// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    
    // Users
    USERS: '/users/user',
    USER_ROLE: '/users/role',
    USER_PROFILE: '/users/user/my-profile',
    USER_BY_ID: (id) => `/users/user/${id}`,
    SELECT_ROLE: '/users/select-role',
    
    // Events
    EVENTS: '/events',
    UPCOMING_EVENTS: '/events/upcoming-events',
    USER_EVENTS: '/events/user-events',
    ATTENDED_EVENTS: '/events/attended-by-user',
    EVENT_PARTICIPANTS: (id) => `/events/participants/${id}`,
    AM_I_PARTICIPANT: (id) => `/events/am-i-participant/${id}`,
    DELETE_PARTICIPANT: '/events/delete-participant',
    
    // Facilities
    FACILITIES: '/facilities',
    MY_FACILITIES: '/facilities/my-facilities',
    
    // Fields
    FIELDS: '/fields',
    MY_FIELDS: '/fields/my-fields',
    
    // Images
    IMAGE_URL: (path) => `${API_BASE_URL}/${path.replace(/^\/+/, '')}`,
};

// HTTP Methods
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
};

// Common API options
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Błąd połączenia z serwerem',
    UNAUTHORIZED: 'Brak autoryzacji. Zaloguj się ponownie.',
    FORBIDDEN: 'Brak uprawnień do wykonania tej operacji',
    NOT_FOUND: 'Nie znaleziono zasobu',
    SERVER_ERROR: 'Błąd serwera. Spróbuj ponownie później.',
    VALIDATION_ERROR: 'Błąd walidacji danych'
}; 