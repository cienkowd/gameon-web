import React, { useState, useEffect, useRef } from 'react';
import styles from './ExtraActions.module.css';
import profileIcon from '../../assets/images/profilepicture.png';
import { useNavigate } from "react-router-dom";

const ExtraActions = ({ onSettingsClick }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) { setLoadingRole(false); return; }
            try {
                const response = await fetch('http://localhost:8080/users/role', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    const role = await response.text();
                    setUserRole(role);
                }
            } catch {}
            setLoadingRole(false);
        };

        const fetchUserAvatar = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) return;
            try {
                const response = await fetch('http://localhost:8080/users/user/my-profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.imageURL) {
                        setAvatarUrl(`http://localhost:8080/${data.imageURL.replace(/^\/+/,'')}`);
                    } else {
                        setAvatarUrl(null);
                    }
                }
            } catch (err) {
                setAvatarUrl(null);
            }
        };

        fetchUserRole();
        fetchUserAvatar();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleClick = () => {
        if (userRole === 'OWNER') {
            navigate('/create-object');
        } else {
            navigate('/create-event');
        }
    };

    const handleMenuItemClick = (path) => {
        setDropdownOpen(false);
        navigate(path);
    };

    const getButtonClassName = () => {
        if (userRole === 'OWNER') {
            return styles.createButtonOwner;
        }
        return styles.createButtonUser;
    };

    // Add a function to get userId from JWT
    const getUserIdFromJWT = () => {
        const jwt = localStorage.getItem('jwt');
        if (!jwt) return null;
        try {
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            return payload.id;
        } catch {
            return null;
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('jwt');
        try {
            await fetch('http://localhost:8080/auth/logout', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
        } catch (e) {
            // Możesz dodać obsługę błędu
        }
        localStorage.clear();
        navigate('/login');
    };

    if (loadingRole) return null;

    return (
        <div className={styles.extraActions} ref={dropdownRef}>
            <button onClick={handleClick} className={getButtonClassName()}>
                {userRole === 'OWNER' ? 'Stwórz obiekt' : 'Stwórz wydarzenie'}
            </button>

            <div className={styles.settingsContainer}>
                <div
                    className={styles.settingsIcon}
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                >
                    <div className={styles.dotRow}>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                    </div>
                    <div className={styles.dotRow}>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                    </div>
                    <div className={styles.dotRow}>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                    </div>
                </div>
            </div>

            <div className={styles.profileIcon} onClick={() => {
                const userId = getUserIdFromJWT();
                if (userId) {
                    handleMenuItemClick(`/user-account/${userId}`);
                } else {
                    handleMenuItemClick('/login');
                }
            }}>
                <img src={avatarUrl ? avatarUrl : profileIcon} alt="Profil" />
            </div>

            {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                    <ul>
                        <li className={styles.activeOption} onClick={() => handleMenuItemClick(userRole === 'OWNER' ? '/create-object' : '/create-event')}>
                            Stwórz
                        </li>
                        <li onClick={() => handleMenuItemClick('/homepage')}>Home</li>
                        {userRole !== 'OWNER' && (
                            <li onClick={() => handleMenuItemClick('/favorites')}>Ulubione</li>
                        )}
                        <li onClick={() => handleMenuItemClick('/map')}>Mapa</li>
                        {userRole !== 'OWNER' && (
                            <li onClick={() => {
                                if (onSettingsClick) onSettingsClick();
                            }}>Ustawienia</li>
                        )}
                        <li onClick={() => {
                            const userId = getUserIdFromJWT();
                            if (userId) {
                                handleMenuItemClick(`/user-account/${userId}`);
                            } else {
                                handleMenuItemClick('/login');
                            }
                        }}>Profil</li>
                        <li className={styles.logoutOption} onClick={handleLogout}>
                            Wyloguj
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ExtraActions;