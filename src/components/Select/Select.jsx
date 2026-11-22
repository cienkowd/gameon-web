import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import styles from './Select.module.css';

const CustomSelect = ({label, options, value, onChange, hasError, style}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(value);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const selectRef = useRef(null);

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        setSearchValue(inputValue);

        const filtered = options.filter((option) =>
            option.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredOptions(filtered);
        setIsOpen(filtered.length > 0);
        onChange(inputValue);
    };

    const handleOptionSelect = (option) => {
        setSearchValue(option);
        onChange(option);
        setIsOpen(false);
    };

    const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.selectContainer} style={style}>
            <label className={styles.label}>{label}</label>
            <div className={styles.selectWrapper} ref={selectRef}>
                <input
                    type="text"
                    className={`${styles.select} ${hasError ? styles.inputError : ''}`}
                    placeholder="Nazwa sportu"
                    value={searchValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(filteredOptions.length > 0)}
                />
                <span
                    className={styles.arrow}
                    onClick={() => setIsOpen((prev) => filteredOptions.length > 0 && !prev)}
                ></span>
                <span
                    className={styles.divider}
                    onClick={() => setIsOpen((prev) => filteredOptions.length > 0 && !prev)}
                ></span>
                {isOpen && (
                    <div className={styles.optionsContainer}>
                        <ul className={styles.options}>
                            {filteredOptions.map((option, index) => (
                                <li
                                    key={index}
                                    className={styles.option}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    {option}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

CustomSelect.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    style: PropTypes.object,
};

CustomSelect.defaultProps = {
    value: '',
    hasError: false,
    style: {},
};

export default CustomSelect;
