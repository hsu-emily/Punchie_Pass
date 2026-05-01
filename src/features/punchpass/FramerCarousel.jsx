import { motion } from 'framer-motion';
import React from 'react';

/**
 * FramerCarousel displays a carousel of punch cards.
 * @param {Array} punchCards - Array of punch card objects (with id, url, name, filename)
 * @param {Number} activeIndex - Currently selected card index
 * @param {Function} onCardSelect - Callback when a card is selected
 */
function FramerCarousel({ punchCards = [], activeIndex = 0, onCardSelect }) {
  if (!punchCards || punchCards.length === 0) {
    return <div className="text-center text-gray-500">No punch cards available</div>;
  }

  // Navigation - infinite carousel
  const goLeft = () => {
    const newIndex = (activeIndex - 1 + punchCards.length) % punchCards.length;
    if (onCardSelect) onCardSelect(newIndex);
  };
  
  const goRight = () => {
    const newIndex = (activeIndex + 1) % punchCards.length;
    if (onCardSelect) onCardSelect(newIndex);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Carousel */}
      <div
        className="relative flex items-center justify-center w-full max-w-[600px] mx-auto overflow-hidden"
        style={{ minHeight: 280 }}
      >
        {/* Left arrow - only show if 3+ cards */}
        {punchCards.length >= 3 && (
          <button
            onClick={goLeft}
            className="absolute left-2 z-30 bg-white/80 rounded-full shadow px-2 py-1 text-2xl top-1/2 -translate-y-1/2 hover:bg-white transition-colors"
            style={{ pointerEvents: 'auto' }}
          >
            &#8592;
          </button>
        )}
        
        {/* Cards */}
        <div className="relative flex items-center justify-center w-full overflow-hidden" style={{ height: '280px' }}>
          {punchCards.map((item, idx) => {
            // Calculate offset from active index, handling wrap-around for infinite scroll
            let offset = idx - activeIndex;
            
            // Normalize offset for infinite scroll (shortest path)
            if (punchCards.length > 0 && Math.abs(offset) > punchCards.length / 2) {
              offset = offset > 0 
                ? offset - punchCards.length 
                : offset + punchCards.length;
            }
            
            // Determine position and styling
            let scale = 0.85, z = 10, opacity = 0.5, shadow = 'shadow', x = 0;
            
            if (offset === 0) {
              // Active (center) card - bigger and centered
              scale = 1.25;
              z = 20;
              opacity = 1;
              shadow = 'shadow-2xl';
              x = 0;
            } else if (Math.abs(offset) === 1) {
              // Adjacent cards (left and right) - positioned symmetrically
              scale = 0.9;
              z = 15;
              opacity = 0.7;
              shadow = 'shadow-lg';
              x = offset * 100; // Symmetric offset for proper centering
            } else if (Math.abs(offset) === 2) {
              // Further cards
              scale = 0.85;
              z = 10;
              opacity = 0.5;
              shadow = 'shadow';
              x = offset * 80;
            } else {
              // Cards further away - hide or minimize
              scale = 0.75;
              z = 5;
              opacity = 0.3;
              shadow = 'shadow';
              x = offset * 60;
            }
            
            return (
              <motion.div
                key={item.id || item.filename || idx}
                className={`absolute cursor-pointer ${shadow}`}
                style={{
                  pointerEvents: 'auto',
                  left: '50%',
                  marginLeft: '-130px', // Half of card width (260px / 2)
                }}
                onClick={() => onCardSelect && onCardSelect(idx)}
                animate={{ 
                  scale, 
                  opacity, 
                  zIndex: z,
                  x: x
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <img
                  src={item.url}
                  alt={item.name || 'Punch Card'}
                  className="rounded-2xl w-[260px] h-[180px] object-cover border-4 border-white"
                />
              </motion.div>
            );
          })}
        </div>
        
        {/* Right arrow - only show if 3+ cards */}
        {punchCards.length >= 3 && (
          <button
            onClick={goRight}
            className="absolute right-2 z-30 bg-white/80 rounded-full shadow px-2 py-1 text-2xl top-1/2 -translate-y-1/2 hover:bg-white transition-colors"
            style={{ pointerEvents: 'auto' }}
          >
            &#8594;
          </button>
        )}
      </div>
      
      {/* Card name below */}
      <div className="mt-4 text-center text-lg font-bold text-pink-600">
        {punchCards[activeIndex]?.name || 'Select a card'}
      </div>
    </div>
  );
}

export default FramerCarousel;
