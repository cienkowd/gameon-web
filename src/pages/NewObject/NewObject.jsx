import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './NewObject.module.css';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from '../../assets/images/marker-icon.png';
import HeaderMainAdmin from '../../components/HeaderMainAdmin/HeaderMainAdmin';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { AlertCircle } from 'lucide-react';

const defaultIcon = L.icon({
    iconUrl: markerIcon,
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    popupAnchor: [1, -34],
});

const NewObject = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [generalError, setGeneralError] = useState(state?.errorMessage || '');
    const [objectName, setObjectName] = useState(state?.objectName || '');
    const [objectDescription, setObjectDescription] = useState(state?.objectDescription || '');
    const [descriptionLength, setDescriptionLength] = useState(state?.objectDescription?.length || 0);
    const [objectLocation, setObjectLocation] = useState(state?.objectLocation || '');
    const [locationCoords, setLocationCoords] = useState([52.2297, 21.0122]); // Domyślnie Warszawa
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [selectedImage, setSelectedImage] = useState(state?.selectedImage || null);
    const [imagePreview, setImagePreview] = useState(state?.imagePreview || null);
    const [nameError, setNameError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [imageError, setImageError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [filters, setFilters] = useState({
        location: '',
        minFreeSlots: '',
        start_time: '',
        end_time: '',
        privacy: '',
        page: 0,
        size: 10
    });

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

    // Jeśli mamy lokalizację z poprzedniego stanu, pobierz jej współrzędne
    React.useEffect(() => {
        if (state?.objectLocation) {
            fetchCoordinates(state.objectLocation);
        }
    }, []);

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

    const fetchCoordinates = async (address) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    address
                )}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const location = data[0];
                setLocationCoords([parseFloat(location.lat), parseFloat(location.lon)]);
            }
        } catch (error) {
            console.error('Błąd podczas pobierania współrzędnych:', error);
        }
    };

    const handleLocationChange = (e) => {
        const address = e.target.value;
        setObjectLocation(address);
        if (address.length > 3) {
            fetchCoordinates(address);
        }
    };

    const handleObjectNameChange = (e) => {
        setObjectName(e.target.value);
        if (generalError) {
            setGeneralError('');
        }
    };

    const validateObjectName = (objectName) => {
        if (!objectName.trim()) {
            setNameError("Podaj nazwę obiektu");
            return false;
        } else if (objectName.trim().length < 5) {
            setNameError("Nazwa obiektu musi mieć minimum 5 znaków");
            return false;
        } else if (objectName.trim().length > 100) {
            setNameError("Nazwa obiektu może mieć maksymalnie 100 znaków");
            return false;
        } else {
            setNameError('');
            return true;
        }
    };

    const validateLocation = (objectLocation) => {
        const trimmed = objectLocation.trim();
        const parts = trimmed.split(',').map(p => p.trim());
        const postalCode = parts[2] || '';

        const commaCount = (trimmed.match(/,/g) || []).length;
        const dashCount = (trimmed.match(/-/g) || []).length;

        if (!objectLocation) {
            setLocationError("Podaj lokalizację obiektu");
            return false;
        } else if (commaCount < 2 || dashCount < 1) {
            setLocationError("Podaj poprawny adres obiektu (miasto, ulica, kod pocztowy)");
            return false;
        } else if (!/^\d{2}-\d{3}$/.test(postalCode)) {
            setLocationError("Kod pocztowy musi być w formacie XX-XXX");
            return false;
        } else if (parts[1] && !/\d/.test(parts[1])) {
            setLocationError("Podaj ulicę z numerem budynku");
            return false;
        } else {
            setLocationError('');
            return true;
        }
    };

    const validateDescription = (objectDescription) => {
        if (!objectDescription) {
            setDescriptionError("Dodaj opis obiektu");
            return false;
        } else {
            setDescriptionError('');
            return true;
        }
    };

    const validateImage = (selectedImage) => {
        if (!selectedImage) {
            setImageError("Dodaj zdjęcie obiektu");
            return false;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(selectedImage.type)) {
            setImageError("Dozwolone są tylko pliki JPG, JPEG lub PNG");
            return false;
        }

        setImageError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);

        const nameValid = validateObjectName(objectName);
        const locationValid = validateLocation(objectLocation);
        const descriptionValid = validateDescription(objectDescription);
        const imageValid = validateImage(selectedImage);

        if (!nameValid || !locationValid || !descriptionValid || !imageValid) {
            return;
        }

        navigate('/object-summary', {
            state: {
                objectName,
                objectDescription,
                objectLocation,
                imagePreview,
                selectedImage,
                courts: state?.courts || [1, 2],
                courtData: state?.courtData || {},
                latitude: locationCoords[0],
                longitude: locationCoords[1]
            }
        });
    };

    useEffect(() => {
        if (formSubmitted) {
            validateObjectName(objectName);
            validateLocation(objectLocation);
            validateDescription(objectDescription);
            validateImage(selectedImage);
        }
    }, [formSubmitted, objectName, objectDescription, objectLocation, selectedImage]);

    return (
        <>
            <HeaderMainAdmin 
                filters={filters}
                handleFilterChange={handleFilterChange}
                handleDateChange={handleDateChange}
                formSubmitted={formSubmitted}
            />
            <div>
                <div className={styles.bottomRightStripe}></div>
                <h1 className={styles.heading}>Nowy obiekt</h1>
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <div className={styles.leftColumn}>
                        <p className={styles.subtitle}>
                            Wpisz nazwę obiektu
                            {formSubmitted && nameError && (
                                <Tippy content={nameError} placement="right" theme="custom">
                                    <AlertCircle size={20} className={styles.errorIcon} />
                                </Tippy>
                            )}
                            {generalError && (
                                <Tippy content={generalError} placement="right" theme="custom">
                                    <AlertCircle size={20} className={styles.errorIcon} />
                                </Tippy>
                            )}
                        </p>
                        <Input
                            type="text"
                            placeholder="Nazwa obiektu"
                            value={objectName}
                            onChange={handleObjectNameChange}
                            style={{
                                border: '1px solid #e54a23',
                                borderRadius: '20px',
                                maxWidth: '460px',
                                paddingRight: '5px',
                            }}
                            hasError={(formSubmitted && !!nameError) || !!generalError}
                        />
                        <p className={styles.subtitle}>
                            Opisz obiekt
                            {formSubmitted && descriptionError && (
                                <Tippy content={descriptionError} placement="right" theme="custom">
                                    <AlertCircle size={20} className={styles.errorIcon} />
                                </Tippy>
                            )}
                        </p>
                        <div className={styles.textareaContainer}>
                            <textarea
                                className={`${styles.textarea} ${formSubmitted && descriptionError ? styles.errorField : ''}`}
                                placeholder="Podaj dodatkowe informacje o obiekcie dla uczestników"
                                value={objectDescription}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length <= 500) {
                                        setObjectDescription(value);
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
                        <p className={styles.subtitle}>
                            Dodaj zdjęcia obiektu
                            {formSubmitted && imageError && (
                                <Tippy content={imageError} placement="right" theme="custom">
                                    <AlertCircle size={20} className={styles.errorIcon} />
                                </Tippy>
                            )}
                        </p>
                        <div className={styles.imageUploadContainer}>
                            <label
                                className={`
                                ${styles.imageUploadArea}
                                ${selectedImage ? styles.hasImage : ''}
                                ${formSubmitted && imageError ? styles.errorField : ''}
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
                    </div>
                    <div className={styles.rightColumn}>
                        <p className={styles.subtitle}>
                            Podaj lokalizację obiektu
                            {formSubmitted && locationError && (
                                <Tippy content={locationError} placement="right" theme="custom">
                                    <AlertCircle size={20} className={styles.errorIcon} />
                                </Tippy>
                            )}
                        </p>
                        <div className={styles.locationInput}>
                            <Input
                                type="text"
                                placeholder="Nazwa miejscowości, ulica, kod pocztowy"
                                value={objectLocation}
                                onChange={handleLocationChange}
                                style={{
                                    border: '1px solid #e54a23',
                                    borderRadius: '20px',
                                    maxWidth: '440px',
                                    paddingRight: '5px',
                                }}
                                hasError={formSubmitted && !!locationError}
                            />
                        </div>
                        <div className={styles.map}>
                            <MapContainer
                                center={locationCoords}
                                zoom={13}
                                style={{ height: '100%', width: '100%', borderRadius: '20px' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={locationCoords} icon={defaultIcon}>
                                    <Popup>Lokalizacja obiektu</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                        <Button text="Przejdź do podsumowania" type="submit"/>
                    </div>
                </form>
            </div>
        </>
    );
};

export default NewObject; 