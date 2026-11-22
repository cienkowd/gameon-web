import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './HeaderMain.module.css';
import logo from '../../assets/images/logo_mini.svg';
import SearchBox from '../SearchBox/SearchBox';
import ExtraActions from '../ExtraActions/ExtraActions';

const HeaderMain = ({ filters, handleFilterChange, handleDateChange, formSubmitted, onSearch, onSettingsClick }) => {
    const location = useLocation();

    // Function to check if link is active
    const isActiveLink = (path) => {
        return location.pathname === path;
    };

    // Function to get the active link text based on current page
    const getActiveLinkText = () => {
        if (isActiveLink('/homepage')) {
            return 'Dashboard';
        } else if (isActiveLink('/object-detail')) {
            return 'Twoje obiekty';
        } else if (isActiveLink('/field-detail')) {
            return 'Twoje boiska';
        }
        return 'Wydarzenia';
    };

    return (
        <div className={styles.headerWrapper}>
            <header className={styles.header}>
                <Link to="/homepage" className={styles.logoLink}>
                    <img src={logo} alt="GameOn Logo" className={styles.logo}/>
                </Link>
                <div className={styles.searchWrapper}>
                    <SearchBox
                        filters={filters}
                        handleFilterChange={handleFilterChange}
                        handleDateChange={handleDateChange}
                        formSubmitted={formSubmitted}
                        onSearch={onSearch}
                    />
                    <div className={styles.extraActionsWrapper}>
                        <ExtraActions onSettingsClick={onSettingsClick} />
                    </div>
                </div>
            </header>
        </div>
    );
};

export default HeaderMain; 