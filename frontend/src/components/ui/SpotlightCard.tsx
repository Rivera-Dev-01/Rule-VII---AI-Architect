"use client";

import React, { useRef, useCallback } from 'react';

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
    spotlightSize?: number;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
    children,
    className = '',
    spotlightColor = 'rgba(255, 255, 255, 0.1)',
    spotlightSize = 300
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !spotlightRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Direct DOM update for performance
        spotlightRef.current.style.opacity = '1';
        spotlightRef.current.style.background = `radial-gradient(${spotlightSize}px circle at ${x}px ${y}px, ${spotlightColor}, transparent 60%)`;
    }, [spotlightColor, spotlightSize]);

    const handleMouseEnter = useCallback(() => {
        if (spotlightRef.current) {
            spotlightRef.current.style.opacity = '1';
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (spotlightRef.current) {
            spotlightRef.current.style.opacity = '0';
        }
    }, []);

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Spotlight effect div */}
            <div
                ref={spotlightRef}
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    opacity: 0,
                    background: `radial-gradient(${spotlightSize}px circle at 0px 0px, ${spotlightColor}, transparent 60%)`
                }}
            />
            {children}
        </div>
    );
};

export default SpotlightCard;
