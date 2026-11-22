import React from 'react';
import styles from './UserRole.module.css';

const EmailConfirmationScreen = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={`${styles.role} ${styles.additionalMargin}`}>
                    <div className={`${styles.iconEmail} ${styles.pointerNone} ${styles.iconEmailAdditional}`}>
                        <div className={styles.iconContent}></div>
                    </div>
                </div>
                <h1 className={styles.heading}>Sprawdź e-mail</h1>
                <p className={`${styles.subtitle} ${styles.additionalMargin}`}>
                    Wysłaliśmy tam instrukcję do odzyskania hasła
                </p>
                <div className={styles.actionContainer}>
                    <p className={styles.textContent}>
                        Wróć do{' '}
                        <a href="/login" className={styles.link}>
                            strony logowania
                        </a>
                    </p>
                </div>
                <p className={`${styles.textContent} ${styles.maxWidthTryOtherEmail}`}>
                    Wiadomość nie dotarła? Sprawdź spam lub{' '}
                    <a href="/password-recovery" className={styles.link}>
                        spróbuj inny adres e-mail
                    </a>
                </p>
            </div>
        </section>
    );
};

export default EmailConfirmationScreen;
