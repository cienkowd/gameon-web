import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './SettingsScreen.module.css';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import profileIcon from '../../assets/images/profile_icon.svg';

const SettingsModal = ({ open, onClose, onProfileUpdate }) => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        userDescription: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [imageError, setImageError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentAvatar, setCurrentAvatar] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [descriptionLength, setDescriptionLength] = useState(0);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const MAX_IMAGE_SIZE_MB = 5;

    const fetchUser = useCallback(async () => {
        const jwt = localStorage.getItem('jwt');
        try {
            const res = await fetch('http://localhost:8080/users/user/my-profile', {
                headers: { 'Authorization': `Bearer ${jwt}` }
            });
            if (!res.ok) throw new Error('Błąd pobierania danych użytkownika');
            const data = await res.json();
            setForm({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                userDescription: data.userDescription || '',
                phoneNumber: data.phoneNumber || ''
            });
            setDescriptionLength((data.userDescription || '').length);
            if (data.imageURL) {
                setCurrentAvatar(`http://localhost:8080/${data.imageURL.replace(/^\/+/,'')}`);
            } else {
                setCurrentAvatar(null);
            }
        } catch (e) {
            setError('Nie udało się pobrać danych użytkownika.');
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchUser();
            setValidationErrors({});
            setError('');
            setSuccess('');
            setSelectedImage(null);
        }
    }, [fetchUser, open]);

    // Blokowanie scrollowania gdy modal jest otwarty
    useEffect(() => {
        if (open) {
            // Zapisz aktualną pozycję scroll
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Przywróć scrollowanie i pozycję
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }

        // Cleanup function
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        };
    }, [open]);

    const validateForm = () => {
        const errors = {};

        // Walidacja imienia
        if (form.firstName && form.firstName.trim()) {
            if (form.firstName.length < 2) {
                errors.firstName = 'Imię musi mieć minimum 2 znaki';
            } else if (form.firstName.length > 50) {
                errors.firstName = 'Imię może mieć maksymalnie 50 znaków';
            } else if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/.test(form.firstName)) {
                errors.firstName = 'Imię może zawierać tylko litery, spacje i myślniki';
            }
        }

        // Walidacja nazwiska
        if (form.lastName && form.lastName.trim()) {
            if (form.lastName.length < 2) {
                errors.lastName = 'Nazwisko musi mieć minimum 2 znaki';
            } else if (form.lastName.length > 50) {
                errors.lastName = 'Nazwisko może mieć maksymalnie 50 znaków';
            } else if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/.test(form.lastName)) {
                errors.lastName = 'Nazwisko może zawierać tylko litery, spacje i myślniki';
            }
        }

        // Walidacja numeru telefonu
        if (form.phoneNumber && form.phoneNumber.trim()) {
            const phoneClean = form.phoneNumber.replace(/[\s\-()]/g, '');
            if (phoneClean.length < 9) {
                errors.phoneNumber = 'Numer telefonu musi mieć minimum 9 cyfr';
            } else if (phoneClean.length > 9) {
                errors.phoneNumber = 'Numer telefonu może mieć maksymalnie 9 cyfr';
            } else if (!/^[+]?[\d\s\-()]+$/.test(form.phoneNumber.trim())) {
                errors.phoneNumber = 'Numer telefonu może zawierać tylko cyfry, spacje, myślniki i nawiasy';
            }
        }

        // Walidacja opisu (maksymalnie 255 znaków)
        if (form.userDescription && form.userDescription.length > 255) {
            errors.userDescription = 'Opis może mieć maksymalnie 255 znaków';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'userDescription') {
            if (value.length <= 255) {
                setForm({ ...form, [name]: value });
                setDescriptionLength(value.length);
            }
            return;
        }
        
        setForm({ ...form, [name]: value });
        
        // Usuń błąd walidacji dla tego pola po zmianie
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                setImageError('Dozwolone są tylko pliki PNG i JPEG');
                setSelectedImage(null);
                return;
            }
            if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
                setImageError(`Plik jest za duży (max ${MAX_IMAGE_SIZE_MB}MB)`);
                setSelectedImage(null);
                return;
            }
            setImageError('');
            setSelectedImage(file);
        }
    };

    const showNotificationAndClose = () => {
        setShowSuccessNotification(true);
        
        // Poczekaj chwilę, zamknij modal i ukryj powiadomienie
        setTimeout(() => {
            onClose();
            setShowSuccessNotification(false);
            
            // Powiadom parent component o aktualizacji profilu
            if (onProfileUpdate) {
                onProfileUpdate();
            }
        }, 2000);
    };

    // Jeden przycisk do zapisu wszystkiego
    const handleSaveAll = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        
        // Walidacja synchroniczna - sprawdź błędy bezpośrednio
        const errors = {};

        // Walidacja imienia
        if (form.firstName && form.firstName.trim()) {
            if (form.firstName.length < 2) {
                errors.firstName = 'Imię musi mieć minimum 2 znaki';
            } else if (form.firstName.length > 50) {
                errors.firstName = 'Imię może mieć maksymalnie 50 znaków';
            } else if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/.test(form.firstName)) {
                errors.firstName = 'Imię może zawierać tylko litery, spacje i myślniki';
            }
        }

        // Walidacja nazwiska
        if (form.lastName && form.lastName.trim()) {
            if (form.lastName.length < 2) {
                errors.lastName = 'Nazwisko musi mieć minimum 2 znaki';
            } else if (form.lastName.length > 50) {
                errors.lastName = 'Nazwisko może mieć maksymalnie 50 znaków';
            } else if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/.test(form.lastName)) {
                errors.lastName = 'Nazwisko może zawierać tylko litery, spacje i myślniki';
            }
        }

        // Walidacja numeru telefonu
        if (form.phoneNumber && form.phoneNumber.trim()) {
            const phoneClean = form.phoneNumber.replace(/[\s\-()]/g, '');
            if (phoneClean.length < 9) {
                errors.phoneNumber = 'Numer telefonu musi mieć minimum 9 cyfr';
            } else if (phoneClean.length > 9) {
                errors.phoneNumber = 'Numer telefonu może mieć maksymalnie 9 cyfr';
            } else if (!/^[+]?[\d\s\-()]+$/.test(form.phoneNumber.trim())) {
                errors.phoneNumber = 'Numer telefonu może zawierać tylko cyfry, spacje, myślniki i nawiasy';
            }
        }

        // Walidacja opisu (maksymalnie 255 znaków)
        if (form.userDescription && form.userDescription.length > 255) {
            errors.userDescription = 'Opis może mieć maksymalnie 255 znaków';
        }

        // Ustaw błędy walidacji w state
        setValidationErrors(errors);
        
        // Jeśli są błędy, zatrzymaj wysyłanie do API
        if (Object.keys(errors).length > 0) {
            console.log('Walidacja nie przeszła, zatrzymuję wysyłanie do API. Błędy:', errors);
            return;
        }
        
        // Jeśli walidacja przeszła pomyślnie, wyślij do API
        console.log('Walidacja przeszła pomyślnie, wysyłam do API');
        setLoading(true);
        
        const jwt = localStorage.getItem('jwt');
        try {
            // 1. Najpierw wyślij dane tekstowe
            const res = await fetch('http://localhost:8080/users/adjust-user-info', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify(form)
            });
            if (!res.ok) throw new Error('Błąd zapisu danych');

            // 2. Jeśli wybrano nowe zdjęcie, wyślij je
            if (selectedImage) {
                const formData = new FormData();
                formData.append('image', selectedImage);
                const imgRes = await fetch('http://localhost:8080/users/adjust-user-image', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    },
                    body: formData
                });
                if (!imgRes.ok) throw new Error('Błąd zapisu zdjęcia');
                setSelectedImage(null);
            }
            
            showNotificationAndClose();
            
        } catch (e) {
            setError('Nie udało się zapisać zmian.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (formSubmitted) {
            validateForm();
        }
    }, [formSubmitted, form]);

    if (!open) return null;

    const handleOverlayClick = (e) => {
        if (e.target.className === styles.modalOverlay) {
            onClose();
        }
    };

    const modalContent = (
        <>
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.settingsModalContainer}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <div className={styles.sidebarAndContent}>
                    <nav className={styles.sidebar}>
                        <ul>
                            <li
                                className={activeTab === 'profile' ? styles.activeTab : ''}
                                onClick={() => setActiveTab('profile')}
                            >
                                Edytuj profil
                            </li>
                            <li
                                className={activeTab === 'password' ? styles.activeTab : ''}
                                onClick={() => setActiveTab('password')}
                            >
                                Hasło
                            </li>
                        </ul>
                    </nav>
                    <div className={styles.tabContentWrapper}>
                        <div className={styles.tabContent}>
                            {activeTab === 'profile' && (
                                <form className={styles.form} onSubmit={handleSaveAll} style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                                    <h1 className={styles.title}>Edytuj profil</h1>
                                    <div className={styles.avatarUploadSection}>
                                        <div className={styles.avatarPreviewWrapper}>
                                            <img
                                                    src={selectedImage ? URL.createObjectURL(selectedImage) : (currentAvatar || profileIcon)}
                                                    alt="Zdjęcie profilowe"
                                                className={styles.avatarPreview}
                                            />
                                        </div>
                                        <div className={styles.avatarUploadRight}>
                                            <label className={styles.avatarUploadButton}>
                                                Wgraj nowe zdjęcie
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className={styles.avatarInput}
                                                />
                                            </label>
                                            <div className={styles.avatarHint}>
                                                Zalecane minimum 800×800 px. Dozwolone JPG, PNG, GIF.
                                            </div>
                                            {imageError && <div className={styles.error}>{imageError}</div>}
                                        </div>
                                    </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Imię</label>
                                            <Input 
                                                name="firstName" 
                                                value={form.firstName} 
                                                onChange={handleChange}
                                                hasError={formSubmitted && !!validationErrors.firstName}
                                            />
                                            {formSubmitted && validationErrors.firstName && (
                                                <div className={styles.errorMessage}>{validationErrors.firstName}</div>
                                            )}
                                        </div>
                                        
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Nazwisko</label>
                                            <Input 
                                                name="lastName" 
                                                value={form.lastName} 
                                                onChange={handleChange}
                                                hasError={formSubmitted && !!validationErrors.lastName}
                                            />
                                            {formSubmitted && validationErrors.lastName && (
                                                <div className={styles.errorMessage}>{validationErrors.lastName}</div>
                                            )}
                                        </div>
                                        
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Telefon</label>
                                            <Input 
                                                name="phoneNumber" 
                                                value={form.phoneNumber} 
                                                onChange={handleChange}
                                                hasError={formSubmitted && !!validationErrors.phoneNumber}
                                            />
                                            {formSubmitted && validationErrors.phoneNumber && (
                                                <div className={styles.errorMessage}>{validationErrors.phoneNumber}</div>
                                            )}
                                        </div>
                                        
                                        <div className={styles.textareaContainer}>
                                            <label className={styles.label}>Opis</label>
                                            <textarea
                                                name="userDescription"
                                                value={form.userDescription}
                                                onChange={handleChange}
                                                placeholder="Dodaj opis do swojego profilu"
                                                className={`${styles.textarea} ${formSubmitted && validationErrors.userDescription ? styles.errorField : ''}`}
                                            />
                                            <div
                                                className={`${styles.textareaCounter} ${
                                                    descriptionLength === 255 ? styles.limitReached : ''
                                                }`}
                                            >
                                                {descriptionLength}/255
                                            </div>
                                            {formSubmitted && validationErrors.userDescription && (
                                                <div className={styles.errorMessage}>{validationErrors.userDescription}</div>
                                            )}
                                        </div>
                                        
                                    <div className={styles.buttonWrapper} style={{marginTop: 'auto', width: '100%'}}>
                                        <Button text={loading ? 'Zapisywanie...' : 'Zapisz zmiany'} type="submit" disabled={loading} style={{width: '100%', fontSize: '20px', padding: '18px 0', borderRadius: '16px'}} />
                                    </div>
                                        
                                        {error && <div className={styles.errorMessage} style={{textAlign: 'center', marginTop: '16px'}}>{error}</div>}
                                </form>
                            )}
                            {activeTab === 'password' && (
                                <div className={styles.emptyTabContent} style={{height: '100%'}}>
                                    <h1 className={styles.title}>Zmiana hasła</h1>
                                    <p>Ta sekcja będzie dostępna wkrótce.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
            
            {/* Powiadomienie o sukcesie */}
            {showSuccessNotification && (
                <div className={styles.notificationOverlay}>
                    <div className={styles.notification}>
                        <div className={styles.notificationIcon}>✓</div>
                        <div className={styles.notificationText}>Profil został zaktualizowany!</div>
            </div>
        </div>
            )}
        </>
    );

    return createPortal(modalContent, document.body);
};

export default SettingsModal; 