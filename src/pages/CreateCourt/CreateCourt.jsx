import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CreateCourt.module.css';
import Button from '../../components/Button/Button';
import CustomSelect from '../../components/Select/Select';
import HeaderMainAdmin from '../../components/HeaderMainAdmin/HeaderMainAdmin';
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import { AlertCircle } from "lucide-react";
import Input from "../../components/Input/Input";

const CreateCourt = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const existingCourt = state?.existingCourt || null;
    const selectedCourtIndex = Number(state?.selectedCourtIndex);
    const [courtName, setCourtName] = useState(existingCourt?.name || '');
    const [sportType, setSportType] = useState(existingCourt?.sportType || '');
    const [description, setDescription] = useState(existingCourt?.description || '');
    const [descriptionLength, setDescriptionLength] = useState(existingCourt?.description?.length || 0);
    const [selectedImage, setSelectedImage] = useState(existingCourt?.image || null);
    const [imagePreview, setImagePreview] = useState(existingCourt?.imagePreview || null);
    const [errors, setErrors] = useState({});
    const [courtNameError, setCourtNameError] = useState('');
    const [sportTypeError, setSportTypeError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [openingHoursErrors, setOpeningHoursErrors] = useState({});
    const [filters, setFilters] = useState({
        location: '',
        minFreeSlots: '',
        start_time: '',
        end_time: '',
        privacy: '',
        page: 0,
        size: 10
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [openingHours, setOpeningHours] = useState(
        existingCourt?.openingHours || {
            poniedzialek: { start: '', end: '' },
            wtorek: { start: '', end: '' },
            sroda: { start: '', end: '' },
            czwartek: { start: '', end: '' },
            piatek: { start: '', end: '' },
            sobota: { start: '', end: '' },
            niedziela: { start: '', end: '' }
        }
    );
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        if (!existingCourt) {
            setCourtName('');
            setSportType('');
            setDescription('');
            setDescriptionLength(0);
            setSelectedImage(null);
            setImagePreview(null);
            setErrors({});
            setOpeningHours({
                poniedzialek: { start: '', end: '' },
                wtorek: { start: '', end: '' },
                sroda: { start: '', end: '' },
                czwartek: { start: '', end: '' },
                piatek: { start: '', end: '' },
                sobota: { start: '', end: '' },
                niedziela: { start: '', end: '' }
            });
        }
    }, [existingCourt]);

    const fullDayNames = {
        poniedzialek: 'Poniedziałek',
        wtorek: 'Wtorek',
        sroda: 'Środa',
        czwartek: 'Czwartek',
        piatek: 'Piątek',
        sobota: 'Sobota',
        niedziela: 'Niedziela'
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFilterChange = (e) => {
        const value = e.target.value;
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: value === '' ? undefined : value
        }));
    };

    const handleDateChange = (date) => {
        setFilters((prev) => ({
            ...prev,
            start_time: date ? date.toISOString() : "",
        }));
    };

    const validateCourtName = (courtName) => {
        if (!courtName.trim()) {
            setCourtNameError("Podaj nazwę boiska");
            return false;
        } else if (courtName.length < 3) {
            setCourtNameError("Nazwa boiska musi mieć minimum 3 znaki");
            return false;
        } else if (courtName.length > 40) {
            setCourtNameError("Nazwa boiska może mieć maksymalnie 40 znaków");
            return false;
        } else {
            setCourtNameError('');
            return true;
        }
    };

    const validateSportType = (sportType) => {
        if (!sportType) {
            setSportTypeError("Wybierz rodzaj boiska");
            return false;
        } else if (!sportOptions.includes(sportType)) {
            setSportTypeError("Wybierz sport z listy");
            return false;
        } else {
            setSportTypeError('');
            return true;
        }
    };

    const validateDescription = (description) => {
        if (!description.trim()) {
            setDescriptionError("Dodaj opis boiska");
            return false;
        } else {
            setDescriptionError('');
            return true;
        }
    };

    const validateOpeningHours = (openingHours) => {
        const newErrors = {};
        let valid = true;
        let atLeastOneDayFilled = false;

        Object.entries(openingHours).forEach(([day, { start, end }]) => {
            if (start && end) {
                atLeastOneDayFilled = true;
                if (parseInt(start) >= parseInt(end)) {
                    newErrors[`${day}_hours`] = 'Godzina otwarcia musi być wcześniejsza niż godzina zamknięcia';
                    valid = false;
                }
            } else if ((start && !end) || (!start && end)) {
                newErrors[`${day}_hours`] = 'Wypełnij oba pola godzin lub pozostaw oba puste';
                valid = false;
            }
        });

        if (!atLeastOneDayFilled) {
            valid = false;
            Object.keys(openingHours).forEach(day => {
                newErrors[`${day}_hours`] = 'Uzupełnij godziny w przynajmniej jednym dniu';
            });
        }

        setOpeningHoursErrors(newErrors);
        return valid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);

        const nameValid = validateCourtName(courtName);
        const sportTypeValid = validateSportType(sportType);
        const descriptionValid = validateDescription(description);
        const hoursValid = validateOpeningHours(openingHours);

        if (!nameValid || !sportTypeValid || !descriptionValid || !hoursValid) {
            return;
        }

        if (nameValid && sportTypeValid && descriptionValid && hoursValid) {
            const courtInfo = {
                name: courtName,
                sportType,
                description,
                image: selectedImage,
                imagePreview,
                openingHours
            };

            const updatedCourtData = {
                ...state?.courtData,
                [selectedCourtIndex]: courtInfo
            };

            navigate('/object-summary', {
                state: {
                    ...state,
                    courtData: updatedCourtData
                }
            });
        }
    };

    const handleCancel = () => {
        navigate('/object-summary', { state });
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    const handleConfirmDelete = () => {
        if (existingCourt) {
            const newCourtData = { ...state?.courtData };
            delete newCourtData[selectedCourtIndex];
            
            navigate('/object-summary', {
                state: {
                    ...state,
                    courtData: newCourtData
                }
            });
        }
    };
    const [sportOptions, setSportOptions] = useState([]);

    useEffect(() => {
        const fetchSportTypes = async () => {
            try {
                const token = localStorage.getItem('jwt');
                if (!token) {
                    console.error('Brak tokena. Użytkownik nie jest zalogowany.');
                    return;
                }

                const response = await fetch('http://localhost:8080/events/types', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Błąd API: ${response.status}`);
                }

                const data = await response.json();

                const translations = {
                    'FOOTBALL': 'Piłka nożna',
                    'BASKETBALL': 'Koszykówka',
                    'TENNIS': 'Tenis ziemny',
                    'VOLLEYBALL': 'Siatkówka',
                    'HANDBALL': 'Piłka ręczna',
                    'BASEBALL': 'Baseball',
                    'HOKEY': 'Hokej',
                    'RUNNING': 'Bieganie',
                    'MARTIAL_ARTS': 'Sztuki walki',
                    'ROLLS': 'Wrotki',
                    'SKATEBOARD': 'Skateboard',
                    'BADMINTON': 'Badminton',
                    'TABLE_TENNIS': 'Tenis stołowy',
                    'OTHER': 'Inne'
                };

                const translatedOptions = data.map(type => translations[type] || type);
                setSportOptions(translatedOptions);
            } catch (error) {
                console.error('Błąd pobierania typów sportów:', error);
            }
        };

        fetchSportTypes();
    }, []);

    useEffect(() => {
        if (formSubmitted) {
            validateCourtName(courtName);
            validateSportType(sportType);
            validateDescription(description);
            validateOpeningHours(openingHours);
        }
    }, [formSubmitted, courtName, sportType, description, openingHours]);

    return (
        <>
            <HeaderMainAdmin
                filters={filters}
                handleFilterChange={handleFilterChange}
                handleDateChange={handleDateChange}
                formSubmitted={formSubmitted}
            />
            <div className={styles.pageContainer}>
                <div className={styles.bottomRightStripe}></div>
                <h1 className={styles.heading}>Dodaj boisko</h1>
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <div className={styles.leftColumn}>
                        <div className={styles.formGroup}>
                            <label>
                                Nazwa boiska
                                {formSubmitted && courtNameError && (
                                    <Tippy content={courtNameError} placement="right" theme="custom">
                                        <AlertCircle size={20} className={styles.errorIcon}/>
                                    </Tippy>
                                )}
                            </label>
                            <Input
                                type="text"
                                placeholder="Podaj nazwę boiska"
                                value={courtName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setCourtName(value);
                                }}
                                style={{
                                    border: '1px solid #e54a23',
                                    borderRadius: '14px',
                                    maxWidth: '460px',
                                    paddingRight: '16px',
                                }}
                                hasError={formSubmitted && !!courtNameError}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            {sportOptions.length > 0 && (
                            <CustomSelect
                                label={
                                    <>
                                        Typ sportu
                                        {formSubmitted && sportTypeError && (
                                            <Tippy content={sportTypeError} placement="right" theme="custom">
                                                <AlertCircle size={20} className={styles.errorIcon}/>
                                            </Tippy>
                                        )}
                                    </>
                                }
                                options={sportOptions}
                                value={sportType}
                                onChange={(value) => {
                                    setSportType(value)
                                }}
                                hasError={!!sportTypeError}
                                style={{
                                    width: '100%',
                                    '--options-width': '400px',
                                    '--options-left': '0'
                                }}
                            />)}
                        </div>
                        <div className={styles.formGroup}>
                            <label>
                                Zdjęcie boiska
                            </label>
                            <div className={styles.imageUploadContainer}>
                                <label
                                    className={`
                                    ${styles.imageUploadArea}
                                    ${selectedImage ? styles.hasImage : ''}
                                    `}
                                    htmlFor="imageInput"
                                >
                                    <input
                                        type="file"
                                        id="imageInput"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                    {selectedImage ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Podgląd"
                                                className={styles.imagePreview}
                                            />
                                            <span className={styles.changeImageText}>Zmień zdjęcie</span>
                                        </>
                                    ) : (
                                        <div className={styles.uploadPlaceholder}>
                                            <span className={styles.plusIcon}>+</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                            {errors.image && (
                                <span className={styles.errorText}>{errors.image}</span>
                            )}
                        </div>
                    </div>
                    <div className={styles.rightColumn}>
                        <div className={styles.formGroup}>
                            <label>
                                Opis boiska
                                {formSubmitted && descriptionError && (
                                    <Tippy content={descriptionError} placement="right" theme="custom">
                                        <AlertCircle size={20} className={styles.errorIcon}/>
                                    </Tippy>
                                )}
                            </label>
                            <div className={styles.textareaContainer}>
                                <textarea
                                    className={`${styles.textarea} ${formSubmitted && descriptionError ? styles.errorField : ''}`}
                                    placeholder="Podaj dodatkowe informacje o boisku"
                                    value={description}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= 500) {
                                            setDescription(value);
                                            setDescriptionLength(value.length);
                                        }
                                    }}
                                />
                                <div
                                    className={`${styles.textareaCounter} ${
                                        descriptionLength === 500 ? styles.limitReached : ''
                                    }`}
                                >
                                    {descriptionLength}/500
                                </div>
                            </div>
                            {errors.description && (
                                <span className={styles.errorText}>{errors.description}</span>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Godziny otwarcia</label>
                            <div className={styles.timeInputGroup}>
                                {[['poniedzialek', 'wtorek', 'sroda'], ['czwartek', 'piatek', 'sobota'], ['niedziela']].map((group, index) => (
                                    <div key={index} className={index === 2 ? styles.lastRow : styles.daysRow}>
                                        {group.map((day) => (
                                            <div key={day} className={styles.dayTimeGroup}>
                                                <span className={styles.dayLabel}>
                                                    {fullDayNames[day]}
                                                    {formSubmitted && openingHoursErrors[`${day}_hours`] && (
                                                        <Tippy content={openingHoursErrors[`${day}_hours`]} placement="right" theme="custom">
                                                            <AlertCircle size={20} className={styles.errorIcon}/>
                                                        </Tippy>
                                                    )}
                                                </span>
                                                <div className={styles.timeInputs}>
                                                    <div className={styles.timeInputWrapper}>
                                                        <input
                                                            type="text"
                                                            className={`${styles.hourInput} ${formSubmitted && openingHoursErrors[`${day}_hours`] ? styles.errorHoursField : ''}`}
                                                            placeholder="Od"
                                                            value={openingHours[day].start}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^([0-1]?[0-9]|2[0-3])$/.test(value) || value === '') {
                                                                    setOpeningHours(prev => ({
                                                                        ...prev,
                                                                        [day]: {...prev[day], start: value}
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                        <span className={styles.timeSuffix}>:00</span>
                                                    </div>
                                                    <div className={styles.timeInputWrapper}>
                                                        <input
                                                            type="text"
                                                            className={`${styles.hourInput} ${formSubmitted && openingHoursErrors[`${day}_hours`] ? styles.errorHoursField : ''}`}
                                                            placeholder="Do"
                                                            value={openingHours[day].end}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^([0-1]?[0-9]|2[0-3])$/.test(value) || value === '') {
                                                                    setOpeningHours(prev => ({
                                                                        ...prev,
                                                                        [day]: {...prev[day], end: value}
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                        <span className={styles.timeSuffix}>:00</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {existingCourt && (
                            <button
                                className={styles.deleteButton}
                                onClick={handleDeleteClick}
                                type="button"
                            >
                                Usuń boisko
                            </button>
                        )}
                        <div className={styles.buttonContainer}>
                            <Button
                                text="Anuluj"
                                onClick={handleCancel}
                                className={styles.rejectButton}
                            />
                            <Button
                                text={existingCourt ? 'Zapisz' : 'Dodaj'}
                                type="submit"
                            />
                        </div>
                    </div>
                </form>

                {showDeleteConfirmation && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h2 className={styles.modalTitle}>Potwierdzenie</h2>
                            <p className={styles.modalText}>
                                Czy na pewno chcesz usunąć boisko?
                            </p>
                            <p className={styles.modalSubtext}>
                                Tej zmiany nie będzie można cofnąć
                            </p>
                            <div className={styles.modalButtons}>
                                <Button
                                    text="Anuluj"
                                    onClick={handleCancelDelete}
                                    className={styles.cancelButton}
                                />
                                <Button
                                    text="Usuń"
                                    onClick={handleConfirmDelete}
                                    className={styles.confirmDeleteButton}
                                    icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                               xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.3334 4.00001H2.66675" stroke="currentColor" strokeWidth="1.5"
                                              strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M6.66675 6.66667V11.3333" stroke="currentColor" strokeWidth="1.5"
                                              strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M9.33325 6.66667V11.3333" stroke="currentColor" strokeWidth="1.5"
                                              strokeLinecap="round" strokeLinejoin="round"/>
                                        <path
                                            d="M12.6667 4V13.3333C12.6667 13.5101 12.5965 13.6797 12.4714 13.8047C12.3464 13.9298 12.1769 14 12 14H4C3.82319 14 3.65362 13.9298 3.52859 13.8047C3.40357 13.6797 3.33333 13.5101 3.33333 13.3333V4"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                        <path
                                            d="M10.6667 4V2.66667C10.6667 2.31305 10.5262 1.97391 10.2762 1.72386C10.0261 1.47381 9.68696 1.33334 9.33333 1.33334H6.66667C6.31305 1.33334 5.97391 1.47381 5.72386 1.72386C5.47381 1.97391 5.33334 2.31305 5.33334 2.66667V4"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                    </svg>}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CreateCourt; 