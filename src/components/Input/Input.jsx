import React, {useState} from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';
import eyeIcon from '../../assets/images/show-password.svg';
import eyeOffIcon from '../../assets/images/hide-password.svg';

const Input = ({
                   type = 'text',
                   placeholder = '',
                   value,
                   onChange,
                   showPasswordIcon = false,
                   isPasswordField = false,
                   hasError = false,
                   style = {},
                   label,
                   name,
                   textarea = false,
                   disabled = false,
               }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prevState) => !prevState);
    };

    return (
        <div className={`${styles.inputContainer}`}>
            {label && (
                <label className={styles.label} htmlFor={name}>
                    {label}
                </label>
            )}
            {textarea ? (
                <textarea
                    id={name}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`${styles.input} ${hasError ? styles.error : ''}`}
                    style={style}
                    disabled={disabled}
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type={isPasswordField && isPasswordVisible ? 'text' : isPasswordField ? 'password' : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`${styles.input} ${hasError ? styles.error : ''}`}
                    style={style}
                    disabled={disabled}
                />
            )}
            {showPasswordIcon && isPasswordField && (
                <span className={styles.showPasswordIcon} onClick={togglePasswordVisibility}>
                    <img
                        src={isPasswordVisible ? eyeOffIcon : eyeIcon}
                        alt={isPasswordVisible ? 'Hide password' : 'Show password'}
                    />
                </span>
            )}
        </div>
    );
};

Input.propTypes = {
    type: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    showPasswordIcon: PropTypes.bool,
    isPasswordField: PropTypes.bool,
    hasError: PropTypes.bool,
    label: PropTypes.string,
    name: PropTypes.string,
    textarea: PropTypes.bool,
    disabled: PropTypes.bool,
};

Input.defaultProps = {
    type: 'text',
    placeholder: '',
    value: '',
    showPasswordIcon: true,
    isPasswordField: false,
    hasError: false,
    label: '',
    name: '',
    textarea: false,
    disabled: false,
};

export default Input;