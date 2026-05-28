import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LuxuryCarGame3D } from './components/LuxuryCarGame3D';
import { LuxuryBirthday3D } from './components/LuxuryBirthday3D';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [gameStage, setGameStage] = useState<'intro' | 'driving' | 'birthday'>('intro');

  return (
    <div className="size-full">
      <AnimatePresence mode="wait">
        {gameStage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="size-full flex items-center justify-center relative overflow-hidden bg-black"
          >
            {/* Dark luxury background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

            {/* Luxury particles - gold and purple */}
            <div className="absolute inset-0">
              {Array.from({ length: 80 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${1 + Math.random() * 3}px`,
                    height: `${1 + Math.random() * 3}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    background: Math.random() > 0.5 ? '#d4af37' : '#9333ea',
                    boxShadow: `0 0 ${4 + Math.random() * 6}px ${Math.random() > 0.5 ? '#d4af37' : '#9333ea'}`,
                  }}
                  animate={{
                    y: [0, -40, 0],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 3
                  }}
                />
              ))}
            </div>

            {/* Spotlight effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black pointer-events-none" />

            <div className="relative z-10 text-center space-y-16 px-8">
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <motion.h1
                  className="text-9xl font-light text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 tracking-[0.2em]"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '200% auto' }}
                >
                  HAPPY BIRTHDAY
                </motion.h1>
                <motion.div
                  className="text-8xl font-extralight text-gray-400 tracking-[0.4em] mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  GAGAN
                </motion.div>
              </motion.div>

              <motion.button
                className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 backdrop-blur-xl border border-yellow-500/30 text-yellow-400 px-20 py-7 rounded-lg font-light text-2xl tracking-[0.2em] mt-16"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGameStage('driving')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                BEGIN JOURNEY
              </motion.button>
            </div>

            {/* Corner accent lights */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
          </motion.div>
        )}

        {gameStage === 'driving' && (
          <motion.div
            key="driving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="size-full"
          >
            <LuxuryCarGame3D onDestinationReached={() => setGameStage('birthday')} />
          </motion.div>
        )}

        {gameStage === 'birthday' && (
          <motion.div
            key="birthday"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="size-full"
          >
            <LuxuryBirthday3D />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
