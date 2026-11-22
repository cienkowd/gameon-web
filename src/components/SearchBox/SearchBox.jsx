import React from 'react';
import DatePicker from "react-datepicker";
import { pl } from "date-fns/locale/pl";
import "react-datepicker/dist/react-datepicker.css";
import styles from './SearchBox.module.css';
import arrowIcon from '../../assets/images/arrow-right.svg';

const SearchBox = ({ filters, handleFilterChange, handleDateChange, formSubmitted, onSearch }) => {
    return (
        <div className={styles.searchBox}>
            <div className={styles.inputGroup}>
                <label>Gdzie</label>
                <input
                    type="text"
                    name="location"
                    placeholder="Wyszukaj lokalizację"
                    value={filters.location}
                    onChange={handleFilterChange}
                />
            </div>
            <div className={styles.separator}></div>
            <div className={styles.inputGroup}>
                <label>Data</label>
                <DatePicker
                    selected={filters.start_time ? new Date(filters.start_time) : null}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Godzina"
                    placeholderText="Data rozpoczęcia"
                    dateFormat="HH:mm, dd.MM.yyyy "
                    minDate={new Date()}
                    locale={pl}
                    className={`${styles.datePicker} ${formSubmitted && !filters.start_time ? styles.errorField : ''}`}
                    fixedHeight
                    onFocus={(e) => e.target.blur()}
                    onKeyDown={(e) => e.preventDefault()}
                />
            </div>
            <div className={styles.separator}></div>
            <div className={styles.inputGroup}>
                <label>Minimalna liczba wolnych miejsc</label>
                <input
                    type="number"
                    name="minFreeSlots"
                    placeholder="Podaj liczbę graczy"
                    value={filters.minFreeSlots}
                    onChange={handleFilterChange}
                />
            </div>
            <button className={styles.searchButton} onClick={onSearch}>
                <img src={arrowIcon} alt="Szukaj"/>
            </button>
        </div>
    );
};

export default SearchBox;
