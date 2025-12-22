"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number; // Initial delay before starting
  loop?: boolean; // Should it loop?
}

export const TypewriterText = ({ 
  text, 
  className, 
  delay = 0, 
  loop = false 
}: TypewriterTextProps) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!loop) return;

    // Calculate how long the typing takes (text length * 0.02s per char)
    const typingDuration = text.length * 20; 
    
    // Add 4000ms (4 seconds) pause after typing finishes
    const pauseDuration = 4000; 
    
    // Add the initial delay
    const totalCycleTime = (delay * 1000) + typingDuration + pauseDuration;

    const timeout = setTimeout(() => {
      setKey((prev) => prev + 1); // Reset the component to trigger animation again
    }, totalCycleTime);

    return () => clearTimeout(timeout);
  }, [key, loop, text.length, delay]);

  return (
    <span className={className} key={key}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0,
            delay: delay + index * 0.02, // Typing speed
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};