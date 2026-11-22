import React from 'react';
import styles from './UserInfo.module.css';

const UserInfo = ({ name, description }) => {
    return (
        <div>
            <h2 className={styles.title}>{name}</h2>
            <div className={styles.descriptionContainer}>
                <span className={styles.description}>{description}</span>
            </div>
        </div>
    );
};

export default UserInfo; 