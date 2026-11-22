import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/images/logo_mini.svg';

const Header = () => {
    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logoLink}>
                <img src={logo} alt="GameOn Logo" className={styles.logo} />
            </Link>
        </header>
    );
};

export default Header; 