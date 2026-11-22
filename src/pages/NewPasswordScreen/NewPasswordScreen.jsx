import React, { useState, useRef, useEffect } from 'react';
import styles from '../LoginScreen/LoginScreen.module.css';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import { validateRegisterForm } from '../../utils/validation';

const NewPasswordScreen = () => {
    const [email, setEmail] = useState(localStorage.getItem('recoveryEmail') || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password || errors.confirmPassword) {
            setErrors((prev) => ({ ...prev, password: null }));
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        if (errors.password || errors.confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: null }));
        }
    };

    const handleCodeChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return; // Akceptuje tylko cyfry
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus(); // Przejście do następnego pola
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Przycisk został kliknięty!");

        const token = code.join('');
        const email = localStorage.getItem('recoveryEmail'); // Pobranie e-maila z localStorage

        if (!email) {
            console.error("Brak adresu e-mail w pamięci localStorage!");
            setErrors({ general: "Wystąpił błąd. Spróbuj ponownie." });
            return;
        }

        try {
            console.log("Wysyłanie żądania do API...");
            const response = await fetch('http://localhost:8080/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
                body: JSON.stringify({
                    token: token,
                    email: email,
                    newPassword: password,
                    confirmPassword: confirmPassword,
                }),
            });

            const responseText = await response.text(); // Pobranie tekstowej odpowiedzi serwera
            console.log("Odpowiedź serwera:", responseText);

            if (!response.ok) {
                throw new Error(`Błąd ${response.status}: ${responseText}`);
            }

            console.log("Hasło zostało zresetowane!");
            localStorage.removeItem('recoveryEmail');
            navigate('/login');
        } catch (error) {
            console.error("Błąd podczas resetowania hasła:", error);
            setErrors({ general: error.message });
        }

    };


    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftSection}>
                <div className={styles.loginContainer}>
                    <h1 className={styles.loginText}>Nowe hasło</h1>
                    <p className={styles.subtitle}>
                        Wpisz kod, który otrzymałeś, a następnie nowe hasło.
                    </p>
                    <form onSubmit={handleSubmit} className={styles.formContainer}>
                        <div className={styles.field}>
                            <Input
                                type="password"
                                placeholder="Nowe hasło"
                                value={password}
                                onChange={handlePasswordChange}
                                isPasswordField={true}
                                hasError={!!errors.password}
                            />
                            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                        </div>
                        <div className={styles.field}>
                            <Input
                                type="password"
                                placeholder="Potwierdź nowe hasło"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                isPasswordField={true}
                                hasError={!!errors.confirmPassword}
                            />
                            {errors.confirmPassword && (
                                <p className={styles.errorText}>{errors.confirmPassword}</p>
                            )}
                        </div>
                        <div className={styles.field}>
                            <div className={styles.codeInputContainer}>
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        className={styles.codeInput}
                                    />
                                ))}
                            </div>
                        </div>
                        {errors.general && <p className={styles.errorText}>{errors.general}</p>}
                        <div className={styles.buttonContainer}>
                            <Button text="Ustaw nowe hasło" type="submit" disabled={isSubmitting} />
                        </div>
                    </form>
                    <div className={styles.signupContainer}>
                        <p>
                            Wróć do{' '}
                            <a href="/login" className={styles.signupLink}>
                                strony logowania
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            <div className={styles.rightSection}></div>
        </div>
    );
};

export default NewPasswordScreen;
