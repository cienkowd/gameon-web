import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import styles from '../LoginScreen/LoginScreen.module.css';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import {validateRegisterForm} from '../../utils/validation';

const RegisterScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [users, setUsers] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8080/users/user');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

    const handleFieldChange = (field, value) => {
        switch (field) {
            case 'username':
                setUsername(value);
                if (errors.username) {
                    setErrors((prev) => ({ ...prev, username: null }));
                }
                break;
            case 'email':
                setEmail(value);
                if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: null }));
                }
                break;
            case 'password':
                setPassword(value);
                if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: null }));
                }
                if (value === confirmPassword && errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }
                if (password === value && errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }
                break;
            default:
                break;
        }
    };

    const registerUser = async (newUser) => {
        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            const contentType = response.headers.get('Content-Type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(data || 'Rejestracja nie powiodła się.');
            }

            console.log('Rejestracja zakończona sukcesem!');
            navigate('/login', { state: { message: 'Rejestracja zakończona sukcesem!' } });
        } catch (err) {
            console.error('Error during user registration:', err);
            throw err;
        }
    };

    const handleSubmit = async () => {
        const validationErrors = validateRegisterForm({ username, email, password, confirmPassword });

        const usernameExists = users.some((user) => user.login === username);
        const emailExists = users.some((user) => user.email === email);

        if (usernameExists) {
            validationErrors.username = 'Użytkownik o podanej nazwie już istnieje.';
        }

        if (emailExists) {
            validationErrors.email = 'Podany e-mail jest już używany.';
        }

        setErrors((prev) => ({ ...prev, ...validationErrors }));

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const newUser = {
            login: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
        };

        try {
            await registerUser(newUser);
        } catch (err) {
            const backendErrors = {};
            if (err.message.includes('login')) {
                backendErrors.username = 'Użytkownik o podanej nazwie już istnieje.';
            }
            if (err.message.includes('email')) {
                backendErrors.email = 'Adres e-mail jest już używany.';
            }
            setErrors((prev) => ({ ...prev, ...backendErrors }));
        }
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftSection}>
                <div className={styles.loginContainer}>
                    <h1 className={styles.loginText}>Zarejestruj się</h1>
                    <p className={styles.subtitle}>Wypełnij wszystkie pola!</p>
                    <div className={styles.formContainer}>
                        <div className={styles.field}>
                            <Input
                                type="text"
                                placeholder="Nazwa użytkownika"
                                value={username}
                                onChange={(e) => handleFieldChange('username', e.target.value)}
                                isPasswordField={false}
                                hasError={!!errors.username}
                            />
                            {errors.username && <p className={styles.errorText}>{errors.username}</p>}
                        </div>
                        <div className={styles.field}>
                            <Input
                                type="email"
                                placeholder="Adres e-mail"
                                value={email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                isPasswordField={false}
                                hasError={!!errors.email}
                            />
                            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                        </div>
                        <div className={styles.field}>
                            <Input
                                type="password"
                                placeholder="Hasło"
                                value={password}
                                onChange={(e) => handleFieldChange('password', e.target.value)}
                                showPasswordIcon={true}
                                isPasswordField={true}
                                hasError={!!errors.password}
                            />
                            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                        </div>
                        <div className={styles.field}>
                            <Input
                                type="password"
                                placeholder="Potwierdź hasło"
                                value={confirmPassword}
                                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                                showPasswordIcon={true}
                                isPasswordField={true}
                                hasError={!!errors.confirmPassword}
                            />
                            {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword}</p>}
                        </div>
                    </div>
                    <Button text="Zarejestruj się" onClick={handleSubmit}/>
                    <div className={styles.signupContainer}>
                        <span>Posiadasz konto?</span>
                        <Link to="/login" className={styles.signupLink}>
                            Zaloguj się
                        </Link>
                    </div>
                </div>
            </div>
            <div className={styles.rightSection}></div>
        </div>
    );
};

export default RegisterScreen;