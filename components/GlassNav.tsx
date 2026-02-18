import React from 'react';
import { motion } from 'framer-motion';
import { ModelData, GlassNavProps } from '../types';

const GlassNav: React.FC<GlassNavProps> = ({ models, currentModelId, onSelectModel }) => {
  if (models.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center z-50 pointer-events-none px-4">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="pointer-events-auto flex flex-wrap justify-center gap-4 p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
      >
        {models.map((model) => (
          <motion.button
            key={model.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectModel(model)}
            className={`
              px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300
              ${currentModelId === model.id 
                ? 'bg-white text-black shadow-lg' 
                : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'}
            `}
          >
            {model.name}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default GlassNav;
