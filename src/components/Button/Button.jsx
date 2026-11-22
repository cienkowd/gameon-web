import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({text, onClick, type = 'button', disabled = false, className = ''}) => {
    return (
        <button
            className={`${styles.button} ${className}`}
            onClick={onClick}
            type={type}
            disabled={disabled}
        >
            {text}
        </button>
    );
};

Button.propTypes = {
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    disabled: PropTypes.bool,
    className: PropTypes.string,
};

Button.defaultProps = {
    onClick: () => {
    },
    type: 'button',
    disabled: false,
    className: '',
};

export default Button;