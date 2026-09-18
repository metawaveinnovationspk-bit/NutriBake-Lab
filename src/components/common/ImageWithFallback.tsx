import React, { useState, useEffect } from 'react';
import cupcakesImg from '../../assets/images/nutribake_cupcakes_1789159074122.jpg';
import cookiesImg from '../../assets/images/nutribake_cookies_1789159094420.jpg';
import nutriballsImg from '../../assets/images/nutribake_nutriballs_1789159111855.jpg';
import heroBakeryImage from '../../assets/images/hero_bakery_still_life_1788459814680.jpg';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackType?: 'cupcake' | 'cookie' | 'nutriball' | 'hero' | 'general';
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  fallbackType,
  alt = 'NutriBake',
  className = '',
  ...props
}) => {
  const getDefaultFallback = () => {
    if (fallbackSrc) return fallbackSrc;
    if (fallbackType === 'cookie') return cookiesImg;
    if (fallbackType === 'nutriball') return nutriballsImg;
    if (fallbackType === 'hero') return heroBakeryImage;
    if (fallbackType === 'cupcake') return cupcakesImg;

    // Automatic guessing by src or alt text
    const lower = `${src || ''} ${alt || ''}`.toLowerCase();
    if (lower.includes('cookie') || lower.includes('cocolina')) return cookiesImg;
    if (lower.includes('nutri') || lower.includes('ball') || lower.includes('energy')) return nutriballsImg;
    if (lower.includes('cupcake') || lower.includes('golden crumb')) return cupcakesImg;
    if (lower.includes('hero') || lower.includes('bakery')) return heroBakeryImage;
    return cupcakesImg;
  };

  const [currentSrc, setCurrentSrc] = useState<string>(src || getDefaultFallback());
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setHasError(false);
    } else {
      setCurrentSrc(getDefaultFallback());
    }
  }, [src, fallbackSrc, fallbackType]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const fallback = getDefaultFallback();
      if (currentSrc !== fallback) {
        setCurrentSrc(fallback);
      }
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      onLoad={() => setIsLoaded(true)}
      referrerPolicy="no-referrer"
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-90'} transition-opacity duration-300`}
      {...props}
    />
  );
};
