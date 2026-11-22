import React, { useEffect, useState } from 'react';

const PageWrapper = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Małe opóźnienie dla płynnej animacji
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`${isVisible ? 'content-fade-in' : ''}`}>
            {children}
        </div>
    );
};

export default PageWrapper; 