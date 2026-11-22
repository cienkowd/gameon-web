import { useState, useEffect, useCallback } from 'react';

// Utility functions
export const getUserIdFromJWT = () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return null;
    try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        return payload.id;
    } catch {
        return null;
    }
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const useAuth = () => {
    const [userRole, setUserRole] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchUserRole = useCallback(async () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            setLoadingRole(false);
            setIsAuthenticated(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/users/role', {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            
            if (response.ok) {
                const role = await response.text();
                setUserRole(role);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
            setIsAuthenticated(false);
        } finally {
            setLoadingRole(false);
        }
    }, []);

    useEffect(() => {
        fetchUserRole();
    }, [fetchUserRole]);

    const logout = useCallback(async () => {
        const token = localStorage.getItem('jwt');
        try {
            await fetch('http://localhost:8080/auth/logout', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.clear();
            setUserRole(null);
            setIsAuthenticated(false);
        }
    }, []);

    return {
        userRole,
        loadingRole,
        isAuthenticated,
        getUserId: getUserIdFromJWT,
        getHeaders: getAuthHeaders,
        logout,
        refetchRole: fetchUserRole
    };
}; 