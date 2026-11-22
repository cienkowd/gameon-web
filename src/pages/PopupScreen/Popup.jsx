import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import styles from './Popup.module.css';

const Popup = ({message, onClose}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={styles.popup}>
            <p>{message}</p>
        </div>
    );
};

Popup.propTypes = {
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default Popup;
