import React from 'react';
import { Link } from 'react-router-dom';

const LinkPreloader = ({ to, children, className, preloadDelay = 100, ...props }) => {
    const handleMouseEnter = () => {
        // Preload the route after a short delay
        setTimeout(() => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = to;
            document.head.appendChild(link);
        }, preloadDelay);
    };

    return (
        <Link 
            to={to} 
            className={className}
            onMouseEnter={handleMouseEnter}
            {...props}
        >
            {children}
        </Link>
    );
};

export default LinkPreloader; 