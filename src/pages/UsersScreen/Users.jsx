import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [columns, setColumns] = useState([]);

    const isAdmin = () => {
        const token = localStorage.getItem('jwt');
        if (!token) return false;

        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.role === 'ADMIN';
        } catch (err) {
            console.error('Błąd podczas dekodowania tokena:', err);
            return false;
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (!isAdmin()) {
                setError('Brak uprawnień do przeglądania listy użytkowników.');
                window.location.href = '/admin-login';
                return;
            }

            try {
                const token = localStorage.getItem('jwt');
                const response = await fetch('http://localhost:8080/users/user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        setError('Sesja wygasła. Zaloguj się ponownie.');
                        localStorage.removeItem('jwt');
                        window.location.href = '/admin-login';
                        return;
                    }
                    throw new Error('Nie udało się pobrać listy użytkowników.');
                }

                const data = await response.json();
                setUsers(data);

                // Pobranie unikalnych kluczy (nazw kolumn) ze wszystkich obiektów
                if (data.length > 0) {
                    const allKeys = new Set();
                    data.forEach(user => Object.keys(user).forEach(key => allKeys.add(key)));
                    setColumns(Array.from(allKeys));
                }
            } catch (err) {
                console.error('Błąd podczas pobierania listy użytkowników:', err);
                setError('Nie udało się pobrać listy użytkowników.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <p></p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h1>Lista użytkowników</h1>
            <table border="1" style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {user[col] !== null && user[col] !== undefined ? user[col].toString() : 'N/A'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Users;
