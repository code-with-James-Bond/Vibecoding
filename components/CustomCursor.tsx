
import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 40, stiffness: 300 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouch();

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('.cursor-pointer') ||
        target.closest('button')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    if (!isTouchDevice) {
      window.addEventListener('mousemove', moveCursor);
      window.addEventListener('mouseover', handleMouseOver);
    }

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isTouchDevice, cursorX, cursorY]);

  if (isTouchDevice) return null;

  return (
    <motion.div
      style={{
        translateX: springX,
        translateY: springY,
        left: -10,
        top: -10,
      }}
      className="fixed pointer-events-none z-[9999] flex items-center justify-center"
    >
      <motion.div
        animate={{
          width: isHovering ? 50 : 8,
          height: isHovering ? 50 : 8,
          backgroundColor: isHovering ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,1)',
          border: isHovering ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0)',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="rounded-full"
      />
    </motion.div>
  );
};

export default CustomCursor;
