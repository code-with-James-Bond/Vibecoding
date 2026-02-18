
import React, { useState, useEffect } from 'react';
import { Html, useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

const Loader: React.FC = () => {
  const { progress } = useProgress();
  const [show, setShow] = useState(true);

  // Hedge: Minimum visibility time to prevent "flickering" on fast connections/cache
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <Html center fullscreen className="pointer-events-none z-50">
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="w-full h-full flex flex-col items-center justify-center bg-white backdrop-blur-xl"
          >
            <div className="flex flex-col items-center space-y-12 max-w-md w-full px-12">
              <div className="relative w-full h-[1px] bg-gray-100 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  className="absolute top-0 left-0 h-full bg-blue-600" 
                />
              </div>

              <div className="flex flex-col items-center space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[1em] text-gray-300 ml-[1em]">
                  Initializing Vault
                </span>
                <div className="flex items-baseline">
                  <span className="text-7xl font-[900] text-black tracking-tighter">
                    {progress.toFixed(0)}
                  </span>
                  <span className="text-2xl font-black text-blue-600 ml-1">%</span>
                </div>
              </div>
              
              <div className="pt-8 border-t border-gray-50 w-full">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.5em] text-center leading-relaxed">
                  Streamlining spatial data<br/>
                  Optimizing for hardware acceleration
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Html>
  );
};

export default Loader;
