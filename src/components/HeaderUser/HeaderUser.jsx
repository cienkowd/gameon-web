import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './HeaderUser.module.css';
import logo from '../../assets/images/logo_mini.svg';
import ExtraActions from '../ExtraActions/ExtraActions';

const HeaderUser = ({ onSettingsClick }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Function to check if link is active
    const isActiveLink = (path) => {
        if (path === '/homepage') {
            return location.pathname === '/homepage';
        }
        if (path === '/favorites') {
            return location.pathname === '/favorites';
        }
        return location.pathname === path;
    };

    return (
        <div className={styles.headerWrapper}>
            <header className={styles.header}>
                <Link to="/homepage" className={styles.logoLink}>
                    <img src={logo} alt="GameOn Logo" className={styles.logo}/>
                </Link>
                <nav className={styles.navLinks}>
                    <Link 
                        to="/homepage" 
                        className={isActiveLink('/homepage') ? styles.activeLink : styles.inactiveLink}
                    >
                        Wydarzenia
                    </Link>
                    <Link 
                        to="/favorites" 
                        className={isActiveLink('/favorites') ? styles.activeLink : styles.inactiveLink}
                    >
                        Uczestnictwo
                    </Link>
                </nav>
                <div className={styles.extraActionsWrapper}>
                    <ExtraActions onSettingsClick={onSettingsClick} />
                </div>
            </header>
        </div>
    );
};

export default HeaderUser; 