import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './HeaderMainAdmin.module.css';
import logo from '../../assets/images/logo_mini.svg';
import ExtraActions from '../ExtraActions/ExtraActions';

const HeaderMainAdmin = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Function to check if link is active
    const isActiveLink = (path) => {
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
                        Dashboard
                    </Link>
                </nav>
                <div className={styles.extraActionsWrapper}>
                    <ExtraActions />
                </div>
            </header>
        </div>
    );
};

export default HeaderMainAdmin; 