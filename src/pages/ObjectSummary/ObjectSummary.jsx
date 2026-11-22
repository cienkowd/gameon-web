import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ObjectSummary.module.css';
import Button from '../../components/Button/Button';
import HeaderMainAdmin from '../../components/HeaderMainAdmin/HeaderMainAdmin';

const ObjectSummary = () => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showCourtModal, setShowCourtModal] = useState(false);
    const [selectedCourtIndex, setSelectedCourtIndex] = useState(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [userName, setUserName] = useState('');
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
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
    const { state } = useLocation();
    const navigate = useNavigate();
    const courtsGridRef = useRef(null);

    const dayTranslations = {
        poniedzialek: 'pn',
        wtorek: 'wt',
        sroda: 'śr',
        czwartek: 'czw',
        piatek: 'pt',
        sobota: 'sb',
        niedziela: 'nd'
    };

    const fullDayNames = {
        poniedzialek: 'Poniedziałek',
        wtorek: 'Wtorek',
        sroda: 'Środa',
        czwartek: 'Czwartek',
        piatek: 'Piątek',
        sobota: 'Sobota',
        niedziela: 'Niedziela'
    };

    const [courts, setCourts] = useState(() => {
        if (state?.courtData) {
            const maxIndex = Math.max(...Object.keys(state.courtData).map(Number), -1);
            return Array.from({ length: maxIndex + 3 }, (_, i) => i);
        }
        return [0, 1];
    });

    const [courtData, setCourtData] = useState(() => {
        return state?.courtData || {};
    });

    const {
        objectName = '',
        objectLocation = '',
        objectDescription = '',
        imagePreview = '',
        selectedImage = null,
        latitude = null,
        longitude = null
    } = state || {};

    useEffect(() => {
        if (state?.courtData) {
            setCourtData(state.courtData);
        }

        const maxIndex = state?.courtData 
            ? Math.max(...Object.keys(state.courtData).map(Number), -1)
            : -1;
        const updatedCourts = Array.from({ length: maxIndex + 3 }, (_, i) => i);
        setCourts(updatedCourts);
    }, [state]);

    useEffect(() => {
        if (state?.selectedCourtIndex !== undefined && courtsGridRef.current) {
            const courtElements = courtsGridRef.current.querySelectorAll(`.${styles.courtPlaceholder}`);
            const targetIndex = Object.keys(courtData)
                .map(Number)
                .findIndex(index => index === state.selectedCourtIndex);

            if (targetIndex !== -1 && courtElements[targetIndex]) {
                const elementWidth = courtElements[0].offsetWidth + 15; // 15px to gap
                courtsGridRef.current.scrollTo({
                    left: elementWidth * targetIndex,
                    behavior: 'auto'
                });
            }
        }
    }, [state?.selectedCourtIndex, courtData]);

    const sportOptions = [
        'Piłka nożna',
        'Koszykówka',
        'Siatkówka',
        'Tenis',
        'Badminton',
        'Squash',
        'Ping-pong',
        'Hokej',
        'Rugby',
        'Boks',
        'Sztuki walki',
        'Gimnastyka',
        'Lekkoatletyka',
        'Pływanie',
        'Taniec',
        'Joga',
        'Fitness',
        'Crossfit',
        'Wspinaczka',
        'Bowling'
    ];

    const checkScroll = () => {
        if (courtsGridRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = courtsGridRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
        }
    };

    useEffect(() => {
        const gridElement = courtsGridRef.current;
        if (gridElement) {
            gridElement.addEventListener('scroll', checkScroll);
            checkScroll();
        }
        return () => {
            if (gridElement) {
                gridElement.removeEventListener('scroll', checkScroll);
            }
        };
    }, [courts, courtData]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                throw new Error('Brak tokena. Użytkownik nie jest zalogowany.');
            }
            try {
                const response = await fetch('http://localhost:8080/users/user/my-profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Błąd pobierania profilu: ${response.status}`);
                }

                const data = await response.json();
                console.log('Dane użytkownika:', data);
                setUserName(data.login);
            } catch (error) {
                console.error('Błąd:', error);
                setUserName('Użytkowniku');
            }
        };

        fetchUserProfile();
    }, []);

    const handleEdit = (e) => {
        e.preventDefault();
        navigate('/create-object', { 
            state: {
                objectName,
                objectLocation,
                objectDescription,
                imagePreview,
                selectedImage,
                courts,
                courtData
            }
        });
    };

    const toggleDescription = () => {
        setIsDescriptionExpanded((prev) => !prev);
    };

    const handleReject = () => {
        navigate('/homepage');
    };

    const handleCreate = async () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            alert('Brak tokena. Zaloguj się ponownie.');
            return;
        }

        try {
            // Rozbij adres na komponenty (ulica, kod, miasto)
            const parseAddress = (fullAddress) => {
              const parts = fullAddress.split(',').map(p => p.trim());

              return {
                city: parts[0] || '',                 // np. "Warszawa"
                street: parts[1] || '',               // np. "Kobielska 11"
                postalCode: parts[2] || ''            // np. "04-359"
              };
            };
            const { street, postalCode, city } = parseAddress(objectLocation);

            // Współrzędne – opcjonalnie można dynamicznie wyciągnąć
            if (!latitude || !longitude) {
                alert('Brak współrzędnych obiektu.');
                return;
            }
            console.log("Wysyłam dane:", {
                name: objectName,
                description: objectDescription,
                street,
                postalCode,
                city,
                latitude,
                longitude
            });
            console.log(localStorage.getItem('jwt'));

            // 1. Dodaj obiekt sportowy
            const facilityRes = await fetch('http://localhost:8080/facilities/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: objectName.trim(),
                    description: objectDescription,
                    street,
                    postalCode,
                    city,
                    latitude,
                    longitude
                })
            });

            if (facilityRes.status === 409) {
                throw new Error('Obiekt sportowy o tej nazwie już istnieje');
            }
            if (!facilityRes.ok) {
                throw new Error('Nie udało się dodać obiektu');
            }

            const facilityData = await facilityRes.json();
            const facilityId = facilityData;

            console.log('facilityData:', facilityData);

            if (selectedImage) {
                const formData = new FormData();
                formData.append('image', selectedImage);

                const imageRes = await fetch(`http://localhost:8080/facilities/set-image/${facilityId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                });

                if (!imageRes.ok) throw new Error('Nie udało się przesłać zdjęcia obiektu');
            }

            const mapSportNameToEnum = (name) => {
              const map = {
                'Piłka nożna': 'FOOTBALL',
                'Koszykówka': 'BASKETBALL',
                'Tenis ziemny': 'TENNIS',
                'Siatkówka': 'VOLLEYBALL',
                'Piłka ręczna': 'HANDBALL',
                'Baseball': 'BASEBALL',
                'Hokej': 'HOKEY',
                'Bieganie': 'RUNNING',
                'Sztuki walki': 'MARTIAL_ARTS',
                'Wrotki': 'ROLLS',
                'Skateboard': 'SKATEBOARD',
                'Badminton': 'BADMINTON',
                'Tenis stołowy': 'TABLE_TENNIS',
                'Inne': 'OTHER'
              };
              return map[name] || 'OTHER';
            };

            const buildSchedulePayload = (openingHours) => {
                const dayMapping = {
                    poniedzialek: 'MONDAY',
                    wtorek: 'TUESDAY',
                    sroda: 'WEDNESDAY',
                    czwartek: 'THURSDAY',
                    piatek: 'FRIDAY',
                    sobota: 'SATURDAY',
                    niedziela: 'SUNDAY'
                };

                return Object.keys(openingHours).map((dayKey) => {
                    const start = openingHours[dayKey].start
                        ? `${String(openingHours[dayKey].start).padStart(2, '0')}:00`
                        : null;
                    const end = openingHours[dayKey].end
                        ? `${String(openingHours[dayKey].end).padStart(2, '0')}:00`
                        : null;

                    return {
                        weekDay: dayMapping[dayKey],
                        start,
                        end
                    };
                });
            };

            for (const court of Object.values(courtData)) {
              // 1. Dodaj boisko
              const fieldRes = await fetch('http://localhost:8080/fields/new', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  name: court.name,
                  fieldDescription: court.description,
                  sportType: mapSportNameToEnum(court.sportType),
                  sportObjectId: facilityId,
                  maxPlayers: 20,
                  openingHour: { hour: 0, minute: 0, second: 0, nano: 0 },  // wymagane, ale potem nadpisywane
                  closingHour: { hour: 23, minute: 59, second: 0, nano: 0 }, // wymagane, ale potem nadpisywane
                  timeSlotMinutes: 60,
                  flatRatePerSlot: 0
                })
              });

              if (!fieldRes.ok) {
                throw new Error(`Nie udało się dodać boiska: ${fieldRes.status}`);
              }

              const fieldData = await fieldRes.json();
              const fieldId = fieldData;

              console.log('fieldData:', fieldData);

              // 2. Ustaw zdjęcie
              if (court.image) {
                const imageForm = new FormData();
                imageForm.append("image", court.image);

                console.log('FormData preview', imageForm.get('image'));


                const imageRes = await fetch(`http://localhost:8080/fields/set-image/${fieldId}`, {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${token}`
                  },
                  body: imageForm
                });

                if (!imageRes.ok) {
                  throw new Error(`Nie udało się przesłać zdjęcia boiska: ${imageRes.status}`);
                }
              }

              // 3. Ustaw harmonogram godzin
              const schedule = buildSchedulePayload(court.openingHours);

              const scheduleRes = await fetch(`http://localhost:8080/fields/set-schedule/${fieldId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(schedule)
              });

              if (!scheduleRes.ok) {
                throw new Error(`Nie udało się ustawić godzin otwarcia: ${scheduleRes.status}`);
              }
            }

            // 3. Sukces – przekierowanie
            setShowSuccessNotification(true);
            setTimeout(() => {
                navigate('/homepage');
            }, 2000);

        } catch (err) {
            console.error(err);

            if (err.message.includes('już istnieje')) {
                navigate('/create-object', {
                    state: {
                        ...state,
                        errorMessage: err.message,
                        objectName,
                        objectDescription,
                        objectLocation,
                        imagePreview,
                        selectedImage
                    }
                });
            } else {
                alert('Wystąpił błąd podczas dodawania obiektu lub boisk.');
            }
        }
    };

    const handleCourtClick = (index) => {
        if (!courtData[index]) {
            const usedIndices = Object.keys(courtData).map(Number);
            const newIndex = usedIndices.length > 0 ? Math.max(...usedIndices) + 1 : 0;
            
            navigate('/create-court', {
                state: {
                    ...state,
                    selectedCourtIndex: newIndex,
                    existingCourt: null,
                    courtData
                }
            });
        }
    };

    const handleEditCourt = (e, index) => {
        e.stopPropagation();
        const courtToEdit = courtData[index];
        if (courtToEdit) {
            navigate('/create-court', {
                state: {
                    ...state,
                    selectedCourtIndex: index,
                    existingCourt: courtToEdit,
                    courtData
                }
            });
        }
    };

    const handleCourtSubmit = (courtInfo) => {
        setCourtData(prev => {
            const newData = {
                ...prev,
                [selectedCourtIndex]: courtInfo
            };
            return newData;
        });
        setShowCourtModal(false);
        setTimeout(checkScroll, 100);
    };

    const handleScroll = (direction) => {
        if (courtsGridRef.current && !isScrolling) {
            const courtElement = courtsGridRef.current.querySelector(`.${styles.courtPlaceholder}`);
            if (!courtElement) return;
            
            setIsScrolling(true);
            const elementWidth = courtElement.offsetWidth + 15;
            const scrollAmount = direction === 'right' ? elementWidth : -elementWidth;
            
            courtsGridRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'auto'
            });

            setTimeout(() => {
                setIsScrolling(false);
                checkScroll();
            }, 50);
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

    return (
        <>
            <HeaderMainAdmin 
                filters={filters}
                handleFilterChange={handleFilterChange}
                handleDateChange={handleDateChange}
                formSubmitted={formSubmitted}
            />
            <section className={styles.section}>
                <div className={styles.bottomRightStripe}></div>
                <div className={styles.container}>
                    <div className={styles.headerContainer}>
                        <div className={styles.textContent}>
                            <h1 className={styles.heading}>Dziękujemy {userName}!</h1>
                            <h2 className={styles.summaryHeading}>Oto podsumowanie twojego obiektu</h2>
                            <a onClick={handleEdit} href="/create-object" className={styles.editLink}>Wróć do edycji</a>
                        </div>
                        {imagePreview && (
                            <div className={styles.imageContainer}>
                                <img src={imagePreview} alt="Zdjęcie obiektu" className={styles.objectImage} />
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.summary}>
                        <div className={styles.row}>
                            <span className={styles.label}>Nazwa obiektu</span>
                            <span className={styles.value}>{objectName}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Lokalizacja obiektu</span>
                            <span className={styles.value}>{objectLocation}</span>
                        </div>
                        <div className={styles.row}>
                            {isDescriptionExpanded && (
                                <div className={styles.descriptionPopup}>
                                    <p>{objectDescription}</p>
                                </div>
                            )}
                            <div>
                                <span className={styles.label}>Opis obiektu</span>
                            </div>
                            <button onClick={toggleDescription} className={styles.expandButton}>
                                {isDescriptionExpanded ? 'Zwiń' : 'Rozwiń'}
                            </button>
                        </div>
                    </div>

                    <div className={styles.courtsSection}>
                        <div className={styles.courtsHeader}>
                            <h3 className={styles.courtsHeading}>Dodane boiska</h3>
                            <span className={styles.courtsCounter}>
                                Dodano {Object.keys(courtData).length} {
                                    Object.keys(courtData).length === 1 ? 'boisko' : 
                                    Object.keys(courtData).length >= 2 && Object.keys(courtData).length <= 4 ? 'boiska' : 
                                    'boisk'
                                }
                            </span>
                        </div>
                        <div className={styles.courtsOuterContainer}>
                            <button 
                                className={`${styles.scrollButton} ${styles.scrollButtonLeft} ${!canScrollLeft ? styles.hidden : ''}`}
                                onClick={() => handleScroll('left')}
                                aria-label="Przewiń w lewo"
                            >
                                ←
                            </button>
                            <div className={styles.courtsInnerContainer}>
                                <div ref={courtsGridRef} className={styles.courtsGrid}>
                                    {Object.entries(courtData).map(([index, court]) => (
                                        <div 
                                            key={index} 
                                            className={styles.courtPlaceholder}
                                            onClick={() => handleCourtClick(Number(index))}
                                        >
                                            <div className={styles.courtInfo}>
                                                <div className={styles.courtHeader}>
                                                    <h4>{court.name}</h4>
                                                    <p>{court.sportType}</p>
                                                </div>
                                                <div className={styles.openingHours}>
                                                    <div className={styles.openingHoursTitle}>Godziny otwarcia</div>
                                                    <div className={styles.hoursRow}>
                                                        {['poniedzialek', 'wtorek', 'sroda'].map(day => (
                                                            <div key={day} className={styles.dayHours}>
                                                                <span>{dayTranslations[day]}</span>
                                                                <span className={!court.openingHours[day].start && !court.openingHours[day].end ? styles.closed : undefined}>
                                                                    {court.openingHours[day].start && court.openingHours[day].end 
                                                                        ? `${court.openingHours[day].start}:00-${court.openingHours[day].end}:00` 
                                                                        : 'Zamknięte'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className={styles.hoursRow}>
                                                        {['czwartek', 'piatek', 'sobota'].map(day => (
                                                            <div key={day} className={styles.dayHours}>
                                                                <span>{dayTranslations[day]}</span>
                                                                <span className={!court.openingHours[day].start && !court.openingHours[day].end ? styles.closed : undefined}>
                                                                    {court.openingHours[day].start && court.openingHours[day].end 
                                                                        ? `${court.openingHours[day].start}:00-${court.openingHours[day].end}:00` 
                                                                        : 'Zamknięte'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className={styles.hoursRow}>
                                                        <div className={styles.dayHours}>
                                                            <span>{dayTranslations['niedziela']}</span>
                                                            <span className={!court.openingHours['niedziela'].start && !court.openingHours['niedziela'].end ? styles.closed : undefined}>
                                                                {court.openingHours['niedziela'].start && court.openingHours['niedziela'].end 
                                                                    ? `${court.openingHours['niedziela'].start}:00-${court.openingHours['niedziela'].end}:00` 
                                                                    : 'Zamknięte'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div 
                                                    className={styles.editOverlay}
                                                    onClick={(e) => handleEditCourt(e, Number(index))}
                                                >
                                                    <span className={styles.editText}>Edytuj</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {[...Array(2)].map((_, i) => {
                                        const nextIndex = Object.keys(courtData).length > 0 
                                            ? Math.max(...Object.keys(courtData).map(Number)) + 1 + i 
                                            : i;
                                        return (
                                            <div 
                                                key={`empty-${i}`} 
                                                className={styles.courtPlaceholder}
                                                onClick={() => handleCourtClick(nextIndex)}
                                            >
                                                <div className={styles.addCourtIcon}>+</div>
                                                <span className={styles.addCourtText}>Dodaj boisko</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <button 
                                className={`${styles.scrollButton} ${styles.scrollButtonRight} ${!canScrollRight ? styles.hidden : ''}`}
                                onClick={() => handleScroll('right')}
                                aria-label="Przewiń w prawo"
                            >
                                →
                            </button>
                        </div>
                    </div>
                    
                    <div className={styles.scrollHintContainer}>
                        {courts.length > 2 && (
                            <div className={styles.scrollHint}>
                                Przewiń w prawo aby zobaczyć więcej →
                            </div>
                        )}
                        {Object.keys(courtData).length === 0 && (
                            <p style={{ color: '#e54a23', marginBottom: '8px', fontSize: '14px', textAlign: 'center' }}>
                                Aby kontynuować, musisz dodać przynajmniej jedno boisko.
                            </p>
                        )}
                    </div>
                    
                    <div className={styles.buttonContainer}>
                        <Button
                            text="Odrzuć"
                            onClick={handleReject}
                            className={styles.rejectButton}
                        />
                        <Button
                            text="Dodaj obiekt"
                            onClick={handleCreate}
                            disabled={Object.keys(courtData).length === 0}
                            title={Object.keys(courtData).length === 0 ? "Musisz dodać przynajmniej jedno boisko" : ""}
                        />
                    </div>
                </div>
            </section>

            {showSuccessNotification && (
                <div className={styles.notificationOverlay}>
                    <div className={styles.notification}>
                        <div className={styles.notificationIcon}>✓</div>
                        <div className={styles.notificationText}>Obiekt i boiska zostały dodane!</div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ObjectSummary;