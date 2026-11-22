import React, {useEffect, useState} from "react";
import styles from "./EventDetail.module.css";
import Button from "../../components/Button/Button";
import {Link, useParams, useNavigate} from "react-router-dom";
import HeaderMainAdmin from "../../components/HeaderMainAdmin/HeaderMainAdmin";
import HeaderUser from "../../components/HeaderUser/HeaderUser";
import deleteIcon from "../../assets/images/delete.svg";
import deleteHoverIcon from "../../assets/images/delete_hover.svg";
import footballPlaceholder from '../../utils/placeholders/football-banner.png';
import basketballPlaceholder from '../../utils/placeholders/basketball-banner.png';
import handballPlaceholder from '../../utils/placeholders/handball-banner.png';
import hokeyPlaceholder from '../../utils/placeholders/hokey-banner.png';
import voleyballPlaceholder from '../../utils/placeholders/voleyball-banner.png';
import tennisPlaceholder from '../../utils/placeholders/tennis-banner.png';
import baseballPlaceholder from '../../utils/placeholders/baseball-banner.png';
import runningPlaceholder from '../../utils/placeholders/running-banner.png';
import badmintonPlaceholder from '../../utils/placeholders/badminton-banner.png';
import tableTennisPlaceholder from '../../utils/placeholders/table-tennis-banner.png';
import rollsPlaceholder from '../../utils/placeholders/rolls-banner.png';
import skateboardPlaceholder from '../../utils/placeholders/skateboard-banner.png';
import otherPlaceholder from '../../utils/placeholders/other-banner.png';
import martialArtsPlaceholder from '../../utils/placeholders/martial-arts-banner.png';
import SettingsModal from '../SettingsScreen/SettingsScreen';

const EventPage = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showEventDeleteConfirmation, setShowEventDeleteConfirmation] = useState(false);
    const [showLeaveEventConfirmation, setShowLeaveEventConfirmation] = useState(false);
    const [showJoinRequestSent, setShowJoinRequestSent] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isCreator, setIsCreator] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [hasJoined, setHasJoined] = useState(false);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingRole, setLoadingRole] = useState(true);
    const [eventData, setEventData] = useState(null);
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
    const participantsPerPage = 6;
    const maxPlayers = 25;
    const [participantsList, setParticipantsList] = useState([]);
    const {id} = useParams();
    const [checkingParticipation, setCheckingParticipation] = useState(true);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const navigate = useNavigate();

    const sportTypeToPlaceholder = {
        FOOTBALL: footballPlaceholder,
        BASKETBALL: basketballPlaceholder,
        HANDBALL: handballPlaceholder,
        HOKEY: hokeyPlaceholder,
        VOLLEYBALL: voleyballPlaceholder,
        TENNIS: tennisPlaceholder,
        BASEBALL: baseballPlaceholder,
        RUNNING: runningPlaceholder,
        BADMINTON: badmintonPlaceholder,
        TABLE_TENNIS: tableTennisPlaceholder,
        ROLLS: rollsPlaceholder,
        SKATEBOARD: skateboardPlaceholder,
        OTHER: otherPlaceholder,
        MARTIAL_ARTS: martialArtsPlaceholder,
    };

    // Calculate pagination values
    const totalPages = Math.ceil(participantsList.length / participantsPerPage);
    const indexOfLastParticipant = currentPage * participantsPerPage;
    const indexOfFirstParticipant = indexOfLastParticipant - participantsPerPage;
    const currentParticipants = participantsList.slice(indexOfFirstParticipant, indexOfLastParticipant);
    // Add empty slots to maintain grid height
    const emptySlots = Array(participantsPerPage - currentParticipants.length).fill(null);

    // Stan do obsługi błędu ładowania obrazka
    const [bannerImage, setBannerImage] = useState('');
    const [imageLoading, setImageLoading] = useState(false);

    // Funkcja do pobierania obrazka z autoryzacją
    const fetchImageWithAuth = async (imageURL) => {
        const token = localStorage.getItem('jwt');
        if (!token) return null;

        try {
            setImageLoading(true);
            const response = await fetch(`http://localhost:8080/${imageURL}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Błąd pobierania obrazka:', response.status);
                return null;
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            return imageUrl;
        } catch (error) {
            console.error('Błąd podczas pobierania obrazka:', error);
            return null;
        } finally {
            setImageLoading(false);
        }
    };

    useEffect(() => {
        const loadBannerImage = async () => {
            if (!eventData) return;
            
            const type = (eventData?.field?.sportType || eventData?.eventType || '').toUpperCase();
            
            if (eventData?.field?.imageURL) {
                // Spróbuj pobrać obrazek z autoryzacją
                const authorizedImageUrl = await fetchImageWithAuth(eventData.field.imageURL);
                
                if (authorizedImageUrl) {
                    setBannerImage(authorizedImageUrl);
                } else {
                    // Jeśli nie udało się pobrać, użyj placeholdera
                    setBannerImage(sportTypeToPlaceholder[type] || '');
                }
            } else {
                setBannerImage(sportTypeToPlaceholder[type] || '');
            }
        };

        loadBannerImage();
    }, [eventData]);

    // Cleanup blob URLs when component unmounts
    useEffect(() => {
        return () => {
            if (bannerImage && bannerImage.startsWith('blob:')) {
                URL.revokeObjectURL(bannerImage);
            }
        };
    }, [bannerImage]);

    useEffect(() => {
        const fetchEvent = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) return;

            try {
                const response = await fetch(`http://localhost:8080/events/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Błąd pobierania danych wydarzenia');

                const data = await response.json();
                setEventData(data);

                // Sprawdź, czy zalogowany użytkownik jest organizatorem wydarzenia
                let loggedInUser = null;
                
                // Pobierz username z JWT token
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        loggedInUser = payload.sub || payload.username || payload.login || payload.name;
                    } catch (e) {
                        console.error('Error parsing JWT:', e);
                    }
                }
                
                const isCreatorCheck = data.organizer && 
                    data.organizer.login && 
                    loggedInUser && 
                    data.organizer.login.toString().trim() === loggedInUser.toString().trim();
                    
                setIsCreator(isCreatorCheck);

                // Pobierz uczestników wydarzenia
                const participantsRes = await fetch(`http://localhost:8080/events/participants/${id}?eventId=${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!participantsRes.ok) throw new Error('Błąd pobierania uczestników wydarzenia');
                const participants = await participantsRes.json();
                const transformedParticipants = participants.map((participant, index) => ({
                    id: participant.userId,
                    imageUrl: "https://cdn.builder.io/api/v1/image/assets/e535df198e3545749ccdc959bd451da8/21169502ad2eb8095b770f0050eda663efaa4507?placeholderIfAbsent=true",
                    name: participant.userName,
                }));
                setParticipantsList(transformedParticipants);
            } catch (err) {
                console.error(err);
            }
        };

        const checkParticipation = async () => {
            setCheckingParticipation(true);
            const token = localStorage.getItem('jwt');
            if (!token) {
                setHasJoined(false);
                setCheckingParticipation(false);
                return;
            }
            try {
                const res = await fetch(`http://localhost:8080/events/am-i-participant/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Błąd sprawdzania uczestnictwa');
                const isParticipant = await res.json();
                setHasJoined(isParticipant === true);
            } catch (err) {
                setHasJoined(false);
            } finally {
                setCheckingParticipation(false);
            }
        };

        fetchEvent();
        checkParticipation();
    }, [id]);

    const handleDeleteUser = (participant) => {
        setUserToDelete(participant);
        setShowConfirmation(true);
    };

    const handleConfirmDelete = async () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            console.error('Brak tokena autoryzacyjnego');
            return;
        }

        try {
            // Wywołanie API do usunięcia uczestnika z wydarzenia - używamy query parameters
            const response = await fetch(`http://localhost:8080/events/delete-participant?eventId=${id}&userId=${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Błąd odpowiedzi:', errorData);
                throw new Error('Błąd podczas usuwania uczestnika');
            }

            // Jeśli API call się udał, usuń z lokalnej listy
            const updatedList = participantsList.filter(p => p.id !== userToDelete.id);
            setParticipantsList(updatedList);

            // Calculate new total pages
            const newTotalPages = Math.ceil(updatedList.length / participantsPerPage);

            // If current page is now empty and it's not the first page, go to previous page
            const currentPageParticipants = updatedList.slice(
                (currentPage - 1) * participantsPerPage,
                currentPage * participantsPerPage
            );

            if (currentPageParticipants.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
            // If we're on the last page and it's now empty, go to the new last page
            else if (currentPage > newTotalPages) {
                setCurrentPage(newTotalPages);
            }

            // Odśwież dane wydarzenia po usunięciu uczestnika
            const eventResponse = await fetch(`http://localhost:8080/events/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (eventResponse.ok) {
                const updatedEventData = await eventResponse.json();
                setEventData(updatedEventData);
            }

        } catch (error) {
            console.error('Błąd podczas usuwania uczestnika:', error);
            // Można dodać tutaj komunikat błędu dla użytkownika
        }

        setShowConfirmation(false);
        setUserToDelete(null);
    };

    const handleCancelDelete = () => {
        setShowConfirmation(false);
        setUserToDelete(null);
    };

    const handleAddUser = async () => {
        if (newUserName.trim()) {
            const token = localStorage.getItem('jwt');
            if (!token) {
                console.error('Brak tokena autoryzacyjnego');
                return;
            }

            try {
                // Wywołanie API do dodania uczestnika do wydarzenia
                const response = await fetch(`http://localhost:8080/events/participants/${id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userName: newUserName.trim()
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error('Błąd odpowiedzi:', errorData);
                    throw new Error('Błąd podczas dodawania uczestnika');
                }

                // Odśwież listę uczestników po dodaniu
                const participantsRes = await fetch(`http://localhost:8080/events/participants/${id}?eventId=${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!participantsRes.ok) throw new Error('Błąd pobierania uczestników wydarzenia');
                const participants = await participantsRes.json();
                const transformedParticipants = participants.map((participant, index) => ({
                    id: participant.userId,
                    imageUrl: "https://cdn.builder.io/api/v1/image/assets/e535df198e3545749ccdc959bd451da8/21169502ad2eb8095b770f0050eda663efaa4507?placeholderIfAbsent=true",
                    name: participant.userName,
                }));
                setParticipantsList(transformedParticipants);

                // Calculate which page the new user will be on
                const newTotalPages = Math.ceil(transformedParticipants.length / participantsPerPage);

                // If the new user is on a new page, switch to that page
                if (newTotalPages > totalPages) {
                    setCurrentPage(newTotalPages);
                }

                // Odśwież dane wydarzenia
                const eventResponse = await fetch(`http://localhost:8080/events/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (eventResponse.ok) {
                    const updatedEventData = await eventResponse.json();
                    setEventData(updatedEventData);
                }

                setNewUserName("");
                setShowAddUserForm(false);

            } catch (error) {
                console.error('Błąd podczas dodawania uczestnika:', error);
                // Można dodać tutaj komunikat błędu dla użytkownika
            }
        }
    };

    const handleCancelAdd = () => {
        setShowAddUserForm(false);
        setNewUserName("");
    };

    const handleDeleteEventClick = () => {
        setShowEventDeleteConfirmation(true);
    };

    const handleConfirmEventDelete = async () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            console.error('Brak tokena autoryzacyjnego');
            return;
        }

        try {
            // Wywołanie API do usunięcia wydarzenia - używamy query parameters
            const response = await fetch(`http://localhost:8080/events/delete-event?eventId=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Błąd odpowiedzi:', errorData);
                throw new Error('Błąd podczas usuwania wydarzenia');
            }

            // Zapisz informację o udanym usunięciu
            localStorage.setItem('eventDeleted', 'true');
            localStorage.setItem('eventDeletedTitle', eventData?.title || 'Wydarzenie');
            setShowEventDeleteConfirmation(false);
            
            // Przekieruj użytkownika na stronę główną
            navigate('/homepage');
            
        } catch (error) {
            console.error('Błąd podczas usuwania wydarzenia:', error);
            // Można dodać tutaj komunikat błędu dla użytkownika
        }
    };

    const handleCancelEventDelete = () => {
        setShowEventDeleteConfirmation(false);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            action();
        }
    };

    const handleJoinEvent = async () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            console.error('Brak tokena autoryzacyjnego');
            return;
        }
        if (!id) {
            console.error('Brak ID wydarzenia');
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/events/join/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Błąd odpowiedzi:', errorData);
                throw new Error('Błąd podczas dołączania do wydarzenia');
            }
            setHasJoined(true);
            // Odśwież dane wydarzenia po dołączeniu
            const eventResponse = await fetch(`http://localhost:8080/events/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (eventResponse.ok) {
                const updatedEventData = await eventResponse.json();
                setEventData(updatedEventData);
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    };

    const handleLeaveEventClick = () => {
        setShowLeaveEventConfirmation(true);
    };

    const handleConfirmLeaveEvent = async () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            console.error('Brak tokena autoryzacyjnego');
            return;
        }
        if (!id) {
            console.error('Brak ID wydarzenia');
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/events/joined/${id}?eventId=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Błąd odpowiedzi:', errorData);
                throw new Error('Błąd podczas opuszczania wydarzenia');
            }
            setHasJoined(false);
            // Odśwież dane wydarzenia po opuszczeniu
            const eventResponse = await fetch(`http://localhost:8080/events/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (eventResponse.ok) {
                const updatedEventData = await eventResponse.json();
                setEventData(updatedEventData);
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
        setShowLeaveEventConfirmation(false);
    };

    const handleCancelLeaveEvent = () => {
        setShowLeaveEventConfirmation(false);
    };

    const handleJoinRequest = () => {
        setShowJoinRequestSent(true);
    };

    const handleCloseJoinRequest = () => {
        setShowJoinRequestSent(false);
    };

    const getEventTypeTag = () => {
        switch (eventData?.privacyStatus) {
            case 'PRIVATE':
                return 'Prywatne';
            case 'PUBLIC':
                return 'Publiczne';
            case 'VERIFIED':
                return 'Weryfikowane';
            default:
                return '';
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

    const handleModalClick = (e) => {
        if (e.target.className === styles.modalOverlay) {
            if (showConfirmation) setShowConfirmation(false);
            if (showEventDeleteConfirmation) setShowEventDeleteConfirmation(false);
            if (showAddUserForm) setShowAddUserForm(false);
            if (showLeaveEventConfirmation) setShowLeaveEventConfirmation(false);
            if (showJoinRequestSent) setShowJoinRequestSent(false);
        }
    };

    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                console.error('Brak tokena autoryzacyjnego.');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/users/role', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Błąd ${response.status}`);
                }

                const role = await response.text();
                setUserRole(role);
            } catch (err) {
                console.error(err.message);
            } finally {
            setLoadingRole(false);
            }
        };

        fetchUserRole();
    }, []);

    // Sprawdź czy wszystkie kluczowe dane zostały załadowane
    const isInitialDataLoaded = () => {
        if (loadingRole) return false;
        if (!eventData) return false;
        if (checkingParticipation) return false;
        if (participantsList.length === 0 && eventData?.participationsCount > 0) return false;
        return true;
    };

    // Jeśli dane nie są jeszcze załadowane, pokaż loader
    if (!isInitialDataLoaded()) {
        return (
            <>
                {userRole === 'OWNER' ? (
                    <HeaderMainAdmin activeLink="Dashboard" />
                ) : userRole && (
                    <HeaderUser
                        onSettingsClick={() => setShowSettingsModal(true)}
                    />
                )}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '50vh',
                    fontSize: '18px',
                    color: '#666'
                }}>
                </div>
            </>
        );
    }

    return (
        <>
            {userRole === 'OWNER' ? (
                <HeaderMainAdmin activeLink="Dashboard" />
            ) : (
                <HeaderUser
                    onSettingsClick={() => setShowSettingsModal(true)}
                />
            )}
            <div className={styles.eventPage}>
                {/* Event Banner */}
                <div
                    className={styles.eventBanner}
                    style={{
                        backgroundImage: bannerImage ? `url(${bannerImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        overflow: 'hidden',
                    }}
                >
                    {imageLoading && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontSize: '16px',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                        }}>
                        </div>
                    )}
                    <div className={styles.privateTag}>
                        {getEventTypeTag()}
                    </div>
                </div>

                {/* Main Content Container */}
                <div className={styles.contentContainer}>
                    <div className={styles.mainContent}>
                        {/* Event Info Section */}
                        <div className={styles.eventInfo}>
                            <h1 className={styles.sectionTitle}>{eventData?.title}</h1>
                            <div className={styles.eventDetails}>
                            <div className={styles.location}>
                                    <div>
                                        <Link to={`/field-detail/${eventData?.field?.id}`} className={styles.fieldLink}>
                                            <strong>{eventData?.field?.name}</strong>
                                        </Link>
                                        <br />
                                        {eventData?.field?.sportObject?.city}, Polska
                                    </div>
                                </div>
                                <div className={styles.date}>
                                    <div>
                                        {(() => {
                                            const start = new Date(eventData?.startTime);
                                            const end = new Date(eventData?.endTime);

                                            const optionsDate = {day: 'numeric', month: 'long', year: 'numeric'};
                                            const optionsTime = {hour: '2-digit', minute: '2-digit'};

                                            const dateStr = start.toLocaleDateString('pl-PL', optionsDate);
                                            const startTimeStr = start.toLocaleTimeString('pl-PL', optionsTime);
                                            const endTimeStr = end.toLocaleTimeString('pl-PL', optionsTime);

                                            return `${dateStr}, ${startTimeStr} - ${endTimeStr}`;
                                        })()}
                                    </div>
                                </div>
                                <div className={styles.playerCount}>
                                    Ilość graczy: {eventData?.participationsCount}/{eventData?.maxPlayers}
                                </div>
                            </div>
                        </div>

                        {/* Event Description Section */}
                        <div className={styles.eventDescription}>
                            <h2 className={styles.sectionTitle}>Opis wydarzenia</h2>
                            <div className={styles.descriptionText}>
                                {eventData?.eventDescription}
                            </div>
                        </div>

                        {/* Participants Section */}
                        <div className={styles.participantsSection}>
                            <div className={styles.participantsHeader}>
                                <h2 className={styles.sectionTitle}>Uczestnicy</h2>
                                <div className={styles.pagination}>
                                    {Array.from({length: totalPages}, (_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={`${styles.pageButton} ${currentPage === i + 1 ? styles.activePage : ''}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.participantsGrid}>
                                {currentParticipants.map((participant) => (
                                    <div
                                        key={participant.id}
                                        className={styles.participantItem}
                                    >
                                        {userRole === 'OWNER' ? (
                                            <div className={styles.userProfileContainer}>
                                                <img
                                                    src={participant.imageUrl}
                                                    alt={`${participant.name} avatar`}
                                                    className={styles.participantAvatar}
                                                />
                                                <div className={styles.participantInfo}>
                                                    <div className={styles.participantName}>{participant.name}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Link to={`/user-account/${participant.id}`} className={styles.userProfileLink}>
                                                <div className={styles.userProfileContainer}>
                                                    <img
                                                        src={participant.imageUrl}
                                                        alt={`${participant.name} avatar`}
                                                        className={styles.participantAvatar}
                                                    />
                                                    <div className={styles.participantInfo}>
                                                        <div className={styles.participantName}>{participant.name}</div>
                                                    </div>
                                                </div>
                                            </Link>
                                        )}
                                        {isCreator && (
                                            <button
                                                className={styles.deleteUserButton}
                                                onClick={() => handleDeleteUser(participant)}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {emptySlots.map((_, index) => (
                                    <div
                                        key={`empty-${index}`}
                                        className={`${styles.participantItem} ${styles.emptySlot}`}
                                    >
                                    </div>
                                ))}
                            </div>
                            {isCreator && (
                                <div className={styles.addParticipantContainer}>
                                    <Button
                                        text="Dodaj uczestnika"
                                        onClick={() => setShowAddUserForm(true)}
                                        className={styles.addParticipantButton}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Organizer Card */}
                    <div className={styles.sidebar}>
                        <div className={styles.organizerCard}>
                            <img
                                src="https://cdn.builder.io/api/v1/image/assets/e535df198e3545749ccdc959bd451da8/d177f660316adb90d7ae262e8a45da34772badfe?placeholderIfAbsent=true"
                                alt="Organizer avatar"
                                className={styles.organizerAvatar}
                            />
                            <div className={styles.organizerName}>
                                {eventData?.organizer?.login}
                            </div>
                            {userRole === 'OWNER' ? (
                                <div className={styles.ownerInfo}>

                                </div>
                            ) : isCreator ? (
                                <div className={styles.creatorActions}>
                                    <Button
                                        text="Edytuj wydarzenie"
                                        onClick={() => window.location.href = `/edit-event/${id}`}
                                        className={styles.editButton}
                                    />
                                    <div className={styles.deleteIconWrapper}>
                                        <img
                                            src={deleteIcon}
                                            alt="Usuń"
                                            className={styles.deleteIcon}
                                            onClick={handleDeleteEventClick}
                                        />
                                        <img
                                            src={deleteHoverIcon}
                                            alt="Usuń"
                                            className={styles.deleteIconHover}
                                            onClick={handleDeleteEventClick}
                                        />
                                    </div>
                                </div>
                            ) : checkingParticipation ? (
                                <Button
                                    text="Sprawdzanie..."
                                    disabled
                                    className={styles.joinButton}
                                />
                            ) : hasJoined ? (
                                <Button
                                    text="Opuść wydarzenie"
                                    onClick={handleLeaveEventClick}
                                    className={`${styles.joinButton} ${styles.leaveButton}`}
                                />
                            ) : eventData?.participationsCount >= eventData?.maxPlayers ? (
                                <>
                                    <Button
                                        text="Wydarzenie pełne"
                                        disabled
                                        className={styles.joinButton}
                                    />
                                </>
                            ) : eventData?.privacyStatus === 'VERIFICATION' ? (
                                <Button
                                    text="Poproś o dołączenie"
                                    onClick={handleJoinRequest}
                                    className={styles.joinButton}
                                />
                            ) : (
                                <Button
                                    text="Dołącz"
                                    onClick={handleJoinEvent}
                                    className={styles.joinButton}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {showConfirmation && (
                    <div
                        className={styles.modalOverlay}
                        onClick={handleModalClick}
                        onKeyPress={(e) => handleKeyPress(e, handleConfirmDelete)}
                        tabIndex={0}
                    >
                        <div className={styles.modal}>
                            <h3 className={styles.modalTitle}>Potwierdzenie</h3>
                            <p className={styles.modalText}>
                                Czy na pewno chcesz usunąć użytkownika {userToDelete.name}?
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
                                    className={styles.confirmButton}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {showAddUserForm && (
                    <div
                        className={styles.modalOverlay}
                        onClick={handleModalClick}
                        onKeyPress={(e) => handleKeyPress(e, handleAddUser)}
                        tabIndex={0}
                    >
                        <div className={styles.modal}>
                            <h3 className={styles.modalTitle}>Dodaj uczestnika</h3>
                            <input
                                type="text"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="Wpisz nazwę użytkownika"
                                className={styles.addUserInput}
                                autoFocus
                            />
                            <div className={styles.modalButtons}>
                                <Button
                                    text="Anuluj"
                                    onClick={handleCancelAdd}
                                    className={styles.cancelButton}
                                />
                                <Button
                                    text="Dodaj"
                                    onClick={handleAddUser}
                                    className={styles.confirmButton}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {showEventDeleteConfirmation && (
                    <div
                        className={styles.modalOverlay}
                        onClick={handleModalClick}
                        onKeyPress={(e) => handleKeyPress(e, handleConfirmEventDelete)}
                        tabIndex={0}
                    >
                        <div className={styles.modal}>
                            <h3 className={styles.modalTitle}>Potwierdzenie</h3>
                            <p className={styles.modalText}>
                                Czy na pewno chcesz usunąć wydarzenie?
                            </p>
                            <p className={styles.modalSubText}>
                                Tej zmiany nie będzie można cofnąć
                            </p>
                            <div className={styles.modalButtons}>
                                <Button
                                    text="Anuluj"
                                    onClick={handleCancelEventDelete}
                                    className={styles.cancelButton}
                                />
                                <Button
                                    text="Usuń"
                                    onClick={handleConfirmEventDelete}
                                    className={`${styles.confirmButton} ${styles.deleteConfirmButton}`}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {showLeaveEventConfirmation && (
                    <div
                        className={styles.modalOverlay}
                        onClick={handleModalClick}
                        onKeyPress={(e) => handleKeyPress(e, handleConfirmLeaveEvent)}
                        tabIndex={0}
                    >
                        <div className={styles.modal}>
                            <h3 className={styles.modalTitle}>Potwierdzenie</h3>
                            <p className={styles.modalText}>
                                Czy na pewno chcesz opuścić to wydarzenie?
                            </p>
                            <div className={styles.modalButtons}>
                                <Button
                                    text="Anuluj"
                                    onClick={handleCancelLeaveEvent}
                                    className={styles.cancelButton}
                                />
                                <Button
                                    text="Opuść"
                                    onClick={handleConfirmLeaveEvent}
                                    className={`${styles.confirmButton} ${styles.leaveConfirmButton}`}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {showJoinRequestSent && (
                    <div
                        className={styles.modalOverlay}
                        onClick={handleModalClick}
                        onKeyPress={(e) => handleKeyPress(e, handleCloseJoinRequest)}
                        tabIndex={0}
                    >
                        <div className={styles.modal}>
                            <h3 className={styles.modalTitle}>Prośba wysłana</h3>
                            <p className={styles.modalText}>
                                Twoja prośba o dołączenie została wysłana do organizatora wydarzenia.
                                Zostaniesz powiadomiony gdy organizator podejmie decyzję.
                            </p>
                            <div className={styles.modalButtons}>
                                <Button
                                    text="OK"
                                    onClick={handleCloseJoinRequest}
                                    className={styles.confirmButton}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        </>
    );
};

export default EventPage;
