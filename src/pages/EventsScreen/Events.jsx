import React, { useEffect, useState } from 'react';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
        const token = localStorage.getItem('jwt');
            if (!token) return null;

            try {
                const response = await fetch('http://localhost:8080/events/upcoming-events', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Nie udało się pobrać listy eventów.');
                }

                const data = await response.json();
                setEvents(data);

                if (data.length > 0) {
                    const allKeys = new Set();
                    data.forEach(event => Object.keys(event).forEach(key => allKeys.add(key)));
                    setColumns(Array.from(allKeys));
                }
            } catch (err) {
                console.error('Błąd podczas pobierania listy eventów:', err);
                setError('Nie udało się pobrać listy eventów.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <p></p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h1>Lista nadchodzących eventów</h1>
            <table border="1" style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {events.map((event, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {event[col] !== null && event[col] !== undefined ? event[col].toString() : 'N/A'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Events;
