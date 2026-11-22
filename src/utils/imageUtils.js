import { API_ENDPOINTS } from '../constants/api';

// Image compression utility
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;

            // Draw and compress
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };

        img.src = URL.createObjectURL(file);
    });
};

// Generate optimized image URL
export const getOptimizedImageUrl = (imagePath, options = {}) => {
    if (!imagePath) return null;
    
    const { width, height, quality = 85 } = options;
    let url = API_ENDPOINTS.IMAGE_URL(imagePath);
    
    // Add query parameters for image optimization if supported by backend
    const params = new URLSearchParams();
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (quality !== 85) params.append('q', quality);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    return url;
};

// Preload image utility
export const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

// Generate placeholder image with text
export const generatePlaceholder = (width = 300, height = 200, text = 'Brak zdjęcia') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // Text
    ctx.fillStyle = '#999';
    ctx.font = `${Math.min(width, height) / 10}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    return canvas.toDataURL();
};

// Image validation
export const validateImage = (file, maxSize = 5 * 1024 * 1024) => { // 5MB default
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Nieprawidłowy format pliku. Dozwolone: JPG, PNG, WebP' };
    }
    
    if (file.size > maxSize) {
        return { valid: false, error: `Plik jest za duży. Maksymalny rozmiar: ${maxSize / 1024 / 1024}MB` };
    }
    
    return { valid: true };
}; 