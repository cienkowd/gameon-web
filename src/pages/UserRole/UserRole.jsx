import React, {useState} from 'react';
import styles from './UserRole.module.css';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';

const PostRegistrationScreen = () => {
    const [activeIcon, setActiveIcon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleIconClick = (icon) => {
        setActiveIcon(icon);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleConfirm = async () => {
        if (!activeIcon) {
            setErrorMessage('Wybierz rolę przed potwierdzeniem.');
            return;
        }

        const role = activeIcon === 'left' ? 'OWNER' : 'USER';
        const token = localStorage.getItem('jwt');

        if (!token) {
            setErrorMessage('Brak tokena uwierzytelniającego. Zaloguj się ponownie.');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/users/select-role', {
                method: 'PUT',
                headers:{
                    Accept: 'application/json',
                            'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token,
                },
                body: JSON.stringify({role}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Błąd ${response.status}: ${response.statusText}`);
            }

            // Pobierz nowy token z odpowiedzi
            const data = await response.json();
            
            // Aktualizuj token w localStorage
            localStorage.setItem('jwt', data.token);
            // Aktualizuj rolę w localStorage
            localStorage.setItem('role', role);
            
            // Odśwież stronę przed przekierowaniem
            window.location.href = '/homepage';
            
        } catch (error) {
            console.error('Błąd podczas ustawiania roli:', error);
            setErrorMessage(error.message || 'Wystąpił błąd podczas ustawiania roli.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.textBlock}>
                    <h1 className={styles.heading}>Wybierz swoją rolę</h1>
                    <p className={styles.subtitle}>Od Twojej roli zależy funkcjonalność konta</p>
                </div>
                <div className={styles.roleContainer}>
                    <div className={styles.role}>
                        <div
                            className={`${styles.iconLeft} ${activeIcon === 'left' ? styles.active : ''}`}
                            onClick={() => handleIconClick('left')}
                        >
                            <div className={styles.iconContent}></div>
                        </div>
                        <div className={`${styles.roleTitle} ${activeIcon === 'left' ? styles.orangeText : ''}`}>
                            Właściciel
                        </div>
                        <div className={styles.roleDescription}>
                            Zależy ci na udostępnieniu swojego miejsca do gry
                        </div>
                    </div>
                    <div className={styles.role}>
                        <div
                            className={`${styles.iconRight} ${activeIcon === 'right' ? styles.active : ''}`}
                            onClick={() => handleIconClick('right')}
                        >
                            <div className={styles.iconContent}></div>
                        </div>
                        <div className={`${styles.roleTitle} ${activeIcon === 'right' ? styles.orangeText : ''}`}>
                            Użytkownik
                        </div>
                        <div className={styles.roleDescription}>
                            Zależy ci na tworzeniu wydarzeń sportowych oraz wynajmowaniu miejsc do gry
                        </div>
                    </div>
                </div>
                {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
                {successMessage && <p className={styles.successText}>{successMessage}</p>}
                <Button
                    text={loading ? 'Ustawianie...' : 'Potwierdzam'}
                    onClick={handleConfirm}
                    className={styles.confirmButton}
                    disabled={loading}
                />
            </div>
        </section>
    );
};

export default PostRegistrationScreen;
