"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface SplitTextProps {
    children: string;
    className?: string;
    delay?: number;
    staggerDelay?: number;
    animationType?: 'chars' | 'words' | 'lines';
}

export const SplitText: React.FC<SplitTextProps> = ({
    children,
    className = '',
    delay = 0,
    staggerDelay = 0.05,
    animationType = 'words'
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const elements = containerRef.current.querySelectorAll('.split-item');

        gsap.fromTo(
            elements,
            {
                opacity: 0,
                y: 30,
                rotateX: -40,
                filter: 'blur(8px)'
            },
            {
                opacity: 1,
                y: 0,
                rotateX: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                ease: 'power3.out',
                stagger: staggerDelay,
                delay: delay
            }
        );
    }, [delay, staggerDelay]);

    const splitContent = () => {
        if (animationType === 'chars') {
            return children.split('').map((char, i) => (
                <span
                    key={i}
                    className="split-item inline-block"
                    style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ));
        }

        if (animationType === 'words') {
            return children.split(' ').map((word, i) => (
                <span key={i} className="split-item inline-block mr-[0.25em]">
                    {word}
                </span>
            ));
        }

        // lines - just animate the whole thing
        return <span className="split-item inline-block">{children}</span>;
    };

    return (
        <span
            ref={containerRef}
            className={`inline-block ${className}`}
            style={{ perspective: '1000px' }}
        >
            {splitContent()}
        </span>
    );
};

export default SplitText;
