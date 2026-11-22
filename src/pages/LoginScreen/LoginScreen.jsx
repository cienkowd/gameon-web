import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import styles from './LoginScreen.module.css';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Popup from '../PopupScreen/Popup';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.message) {
            setPopupMessage(location.state.message);
            navigate(location.pathname, {replace: true, state: {}});
        }
    }, [location, navigate]);

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        if (errors.username || errors.form) {
            setErrors((prev) => ({ ...prev, username: null, form: null }));
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password || errors.form) {
            setErrors((prev) => ({ ...prev, password: null, form: null }));
        }
    };

    const validateLoginForm = () => {
        const errors = {};
        if (!username.trim()) {
            errors.username = 'Nazwa użytkownika jest wymagana.';
        }
        if (!password.trim()) {
            errors.password = 'Hasło jest wymagane.';
        }
        return errors;
    };

    const loginUser = async (credentials) => {
        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                if (errorResponse.message.includes('Incorrect password')) {
                    throw new Error(`Nieprawidłowe hasło dla użytkownika '${credentials.login}'`);
                } else if (errorResponse.message.includes('User with login')) {
                    throw new Error(`Podany użytkownik nie istnieje.`);
                } else {
                    throw new Error('Błąd logowania.');
                }
            }

            const data = await response.json();
            localStorage.setItem('jwt', data.token);
            return data;
        } catch (err) {
            console.error('Błąd logowania:', err.message);
            throw err;
        }
    };

    const fetchUserRole = async () => {
    const token = localStorage.getItem('jwt');
        if (!token) return null;

        try {
            const response = await fetch('http://localhost:8080/users/role', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Nie udało się pobrać roli użytkownika.');

            const roleText = await response.text();
            return roleText.trim();

        } catch (error) {
            console.error('Błąd pobierania roli użytkownika:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        const validationErrors = validateLoginForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});
            const credentials = {
                login: username,
                password: password,
            };

            try {
                setLoading(true);
                const data = await loginUser(credentials);
                console.log('Zalogowano pomyślnie:', data);

                const role = await fetchUserRole(data.token);

                if (role === "NOT_ACTIVATED") {
                    navigate('/user-role');
                } else {
                    localStorage.setItem('role', role);
                    const redirectPath = location.state?.from || '/homepage';
                    navigate(redirectPath);
                }
            } catch (err) {
                setErrors({
                    username: '',
                    password: '',
                    form: 'Błędna nazwa użytkownika lub hasło.',
                });
                console.error('Nieudana próba logowania:', err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={styles.mainContainer}>
            {popupMessage && (
                <Popup message={popupMessage} onClose={() => setPopupMessage('')}/>
            )}
            <div className={styles.leftSection}>
                <div className={styles.loginContainer}>
                    <h1 className={styles.loginText}>Zaloguj się</h1>
                    <p className={styles.subtitle}>Witaj ponownie!</p>
                    <div className={styles.formContainer}>
                        <div className={styles.field}>
                            <Input
                                type="text"
                                placeholder="Nazwa użytkownika"
                                value={username}
                                onChange={handleUsernameChange}
                                isPasswordField={false}
                                hasError={!!errors.username || !!errors.form}
                            />
                            {errors.username && <p className={styles.errorText}>{errors.username}</p>}
                        </div>
                        <div className={styles.field}>
                            <Input
                                type="password"
                                placeholder="Hasło"
                                value={password}
                                onChange={handlePasswordChange}
                                showPasswordIcon={true}
                                isPasswordField={true}
                                hasError={!!errors.password || !!errors.form}
                            />
                            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                        </div>
                        {errors.form && <p className={styles.errorText}>{errors.form}</p>}
                    </div>
                    <div className={styles.optionsContainer}>
                        <div className={styles.rememberMeWrapper}>
                            <input type="checkbox" id="rememberMe" className={styles.checkboxInput}/>
                            <label htmlFor="rememberMe" className={styles.rememberMeLabel}>
                                Zapamiętaj mnie
                            </label>
                        </div>
                        <a href="/password-recovery" className={styles.forgotPasswordLink}>
                            Zapomniałeś hasła?
                        </a>
                    </div>
                    <Button text={loading ? 'Logowanie...' : 'Zaloguj się'} onClick={handleSubmit} disabled={loading}/>
                    <div className={styles.signupContainer}>
                        <span>Nie posiadasz konta?</span>
                        <Link to="/register" className={styles.signupLink}>
                            Zarejestruj się
                        </Link>
                    </div>
                </div>
            </div>
            <div className={styles.rightSection}></div>
        </div>
    );
};

export default LoginScreen;
