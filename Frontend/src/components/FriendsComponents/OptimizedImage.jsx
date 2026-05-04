// Create a new file: components/OptimizedImage.jsx
import { useState } from 'react';

const imageCache = new Set();

const OptimizedImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(imageCache.has(src));
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => {
          imageCache.add(src);
          setIsLoaded(true);
        }}
        onError={() => {
          setError(true);
          imageCache.delete(src);
        }}
        loading="lazy"
        {...props}
      />
      {error && (
        <img
          src="/default-avatar.png"
          alt={alt}
          className={className}
        />
      )}
    </div>
  );
};

export default OptimizedImage;