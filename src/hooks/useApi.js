import { useState, useCallback } from 'react';
import { getAuthHeaders } from './useAuth';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiCall = useCallback(async (url, options = {}) => {
        setLoading(true);
        setError(null);

        try {
            const defaultHeaders = {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
                ...options.headers
            };

            const response = await fetch(`http://localhost:8080${url}`, {
                method: 'GET',
                ...options,
                headers: defaultHeaders
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { apiCall, loading, error };
};

// Specialized hooks for common API patterns
export const usePaginatedApi = () => {
    const [data, setData] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const { apiCall, loading, error } = useApi();

    const fetchPage = useCallback(async (url, pageNum = 0, size = 10, resetData = false) => {
        try {
            const params = new URLSearchParams({ page: pageNum, size });
            const response = await apiCall(`${url}?${params}`);
            
            if (resetData || pageNum === 0) {
                setData(response.content || []);
            } else {
                setData(prev => [...prev, ...(response.content || [])]);
            }
            
            setHasMore(!response.last);
            setPage(pageNum);
            
            return response;
        } catch (err) {
            console.error('Paginated API call failed:', err);
            return null;
        }
    }, [apiCall]);

    const loadMore = useCallback(() => {
        return fetchPage('', page + 1);
    }, [fetchPage, page]);

    const reset = useCallback(() => {
        setData([]);
        setHasMore(true);
        setPage(0);
    }, []);

    return {
        data,
        hasMore,
        page,
        loading,
        error,
        fetchPage,
        loadMore,
        reset
    };
}; 