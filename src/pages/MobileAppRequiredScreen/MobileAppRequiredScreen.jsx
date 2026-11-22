import React from 'react';
import styles from './MobileAppRequiredScreen.module.css';

const MobileAppRequiredScreen = () => {
    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <h1 className={styles.title}>Pobierz aplikację mobilną</h1>
                <p className={styles.text}>
                    Aby korzystać z serwisu na telefonie, pobierz aplikację na Androida.<br/>
                    Wejdź do Google Play i wyszukaj naszą aplikację lub zeskanuj kod QR poniżej.
                </p>
                {/* Możesz dodać tu kod QR lub link do Google Play */}
                <div className={styles.androidIcon}>🤖</div>
            </div>
        </div>
    );
};

export default MobileAppRequiredScreen; 