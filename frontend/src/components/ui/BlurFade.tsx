"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BlurFadeProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    yOffset?: number;
    blur?: string;
    className?: string;
}

export const BlurFade = ({
    children,
    delay = 0,
    duration = 0.4,
    yOffset = 6,
    blur = "6px",
    className = ""
}: BlurFadeProps) => {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: yOffset,
                filter: `blur(${blur})`
            }}
            animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)"
            }}
            transition={{
                delay,
                duration,
                ease: [0.22, 1, 0.36, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default BlurFade;
