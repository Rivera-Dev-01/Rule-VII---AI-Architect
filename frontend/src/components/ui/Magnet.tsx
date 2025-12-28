"use client";

import React, { useRef, useCallback } from 'react';

interface MagnetProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
    disabled?: boolean;
}

export const Magnet: React.FC<MagnetProps> = ({
    children,
    className = '',
    strength = 0.3,
    disabled = false
}) => {
    const magnetRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled || !magnetRef.current) return;

        const rect = magnetRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        // Direct DOM update to avoid re-renders
        magnetRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        magnetRef.current.style.transition = 'transform 0.1s ease-out';
    }, [disabled, strength]);

    const handleMouseLeave = useCallback(() => {
        if (!magnetRef.current) return;

        // Reset with smooth spring-like ease
        magnetRef.current.style.transform = 'translate(0px, 0px)';
        magnetRef.current.style.transition = 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)';
    }, []);

    return (
        <div
            ref={magnetRef}
            className={`inline-block ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
};

export default Magnet;
