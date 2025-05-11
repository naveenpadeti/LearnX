import { useState } from 'react';
import Image from 'next/image';

interface FallbackImageProps {
    src: string;
    alt: string;
    fallbackSrc?: string;
    width: number;
    height: number;
    className?: string;
}

export default function FallbackImage({
                                          src,
                                          alt,
                                          fallbackSrc = "/api/placeholder/500/300",
                                          width,
                                          height,
                                          className,
                                      }: FallbackImageProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative">
            {isLoading && !error && (
                <div className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`} />
            )}
            <Image
                src={imgSrc}
                alt={alt}
                width={width}
                height={height}
                className={className}
                onError={() => {
                    setError(true);
                    setImgSrc(fallbackSrc);
                }}
                onLoad={() => setIsLoading(false)}
                loading="lazy"
            />
        </div>
    );
}