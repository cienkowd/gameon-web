import React from 'react';
import styles from './UserProfile.module.css';
import profileIcon from '../../assets/images/profile_icon.svg';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ name, participationCount, eventsCount, avatarUrl, onEditProfile, isOwner }) => {
    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileContent}>
                <div className={styles.avatarContainer}>
                    <img src={avatarUrl ? avatarUrl : profileIcon} alt="Avatar" className={styles.avatar} />
                </div>
                <div className={styles.nameContainer}>
                    <span className={styles.name}>{name}</span>
                    <div className={styles.statsContainer}>
                        {isOwner ? (
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{eventsCount}</span>
                                <span className={styles.statLabel}>obiekty</span>
                            </div>
                        ) : (
                            <>
                                <div className={styles.statItem1}>
                                    <span className={styles.statNumber}>{participationCount}</span>
                                    <span className={styles.statLabel}>uczestnictwo</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>{eventsCount}</span>
                                    <span className={styles.statLabel}>wydarzenia</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <button className={styles.editProfileButton} type="button" onClick={onEditProfile}>
                    Edytuj profil
                </button>
            </div>
        </div>
    );
};

export default UserProfile; 