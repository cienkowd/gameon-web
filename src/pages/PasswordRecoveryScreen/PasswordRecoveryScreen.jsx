import React, { useState } from 'react';
import styles from '../LoginScreen/LoginScreen.module.css';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';

const PasswordRecoveryScreen = () => {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors((prev) => ({ ...prev, email: null }));
        }
    };

    const validateEmail = () => {
        const errors = {};
        if (!email.trim()) {
            errors.email = 'Proszę podać adres e-mail.';
        } else if (!/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            errors.email = 'Podaj prawidłowy adres e-mail.';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const validationErrors = validateEmail();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/auth/forgot-password?email=${encodeURIComponent(email)}`, {
                method: 'POST',
                headers: {
                    'Accept': '*/*'
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Wystąpił błąd.');
            }

            localStorage.setItem('recoveryEmail', email); // Zapisz e-mail do localStorage
            setMessage('E-mail z instrukcją resetowania został wysłany.');
            setTimeout(() => navigate('/new-password'), 2000);
        } catch (error) {
            console.error('Błąd resetowania hasła:', error);
            setErrors({ email: error.message });
        }
    };


    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftSection}>
                <div className={styles.loginContainer}>
                    <h1 className={`${styles.loginText} ${styles.widthPasswordRecoveryTitle}`}>
                        Odzyskiwanie hasła
                    </h1>
                    <p className={styles.subtitle}>
                        Wpisz swój adres e-mail. <br /> My wyślemy Ci instrukcje, jak zresetować hasło.
                    </p>

                    <form onSubmit={handleSubmit} className={styles.formContainer}>
                        <div className={styles.field}>
                            <Input
                                type="email"
                                placeholder="Adres e-mail"
                                value={email}
                                onChange={handleEmailChange}
                                isPasswordField={false}
                                hasError={!!errors.email}
                            />
                            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                            {message && <p className={styles.successText}>{message}</p>}
                        </div>
                        <div>
                            <Button text="Wyślij instrukcje" type="submit" />
                        </div>
                    </form>
                    <div className={styles.signupContainer}>
                        <p>
                            Wróć do strony logowania
                            <a href="/login" className={styles.signupLink}> Zaloguj się</a>
                        </p>
                    </div>
                </div>
            </div>
            <div className={styles.rightSection}></div>
        </div>
    );
};

export default PasswordRecoveryScreen;
