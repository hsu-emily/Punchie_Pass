import { X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RewardModal({ habit, onClose, onMarkComplete }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
      >
        {/* Confetti effect background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'][
                  Math.floor(Math.random() * 5)
                ]
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [0, -100], opacity: [1, 0] }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Reward Unlocked!
            </h2>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
              <p className="text-xl font-semibold text-gray-800">
                {habit.reward || 'Great job completing your habit!'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  if (onMarkComplete) onMarkComplete();
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Mark as Complete
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

