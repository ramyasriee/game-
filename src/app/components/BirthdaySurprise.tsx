import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Wind } from 'lucide-react';

export function BirthdaySurprise() {
  const [candles, setCandles] = useState([true, true, true, true, true]);
  const [blowing, setBlowing] = useState(false);
  const [allCandlesOut, setAllCandlesOut] = useState(false);
  const [wishMade, setWishMade] = useState(false);
  const [showWishInput, setShowWishInput] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStream | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Entrance confetti
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
      });
    }, 500);
  }, []);

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneRef.current = stream;
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      setMicPermission(true);
      startBlowDetection();
    } catch (error) {
      console.error('Microphone access denied:', error);
      setMicPermission(false);
    }
  };

  const startBlowDetection = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detectBlow = () => {
      if (!analyser) return;

      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      
      // If volume is high enough, consider it as blowing
      if (average > 30) {
        setBlowing(true);
        blowOutCandle();
        
        setTimeout(() => setBlowing(false), 500);
      }
      
      if (!allCandlesOut) {
        requestAnimationFrame(detectBlow);
      }
    };

    detectBlow();
  };

  const blowOutCandle = () => {
    const litCandleIndex = candles.findIndex(c => c);
    if (litCandleIndex !== -1) {
      const newCandles = [...candles];
      newCandles[litCandleIndex] = false;
      setCandles(newCandles);

      // Check if all candles are out
      if (newCandles.every(c => !c)) {
        setAllCandlesOut(true);
        setTimeout(() => {
          setShowWishInput(true);
          // Stop microphone
          if (microphoneRef.current) {
            microphoneRef.current.getTracks().forEach(track => track.stop());
          }
        }, 1000);
      }
    }
  };

  const handleManualBlow = () => {
    setBlowing(true);
    blowOutCandle();
    setTimeout(() => setBlowing(false), 500);
  };

  const handleMakeWish = () => {
    setWishMade(true);
    
    // Epic confetti celebration
    const duration = 5000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
      });
      
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
      });
    }, 250);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0.3 
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        <AnimatePresence mode="wait">
          {!allCandlesOut ? (
            <motion.div
              key="cake"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className="text-7xl font-bold text-white mb-12 drop-shadow-2xl"
                animate={{
                  scale: [1, 1.05, 1],
                  textShadow: [
                    "0 0 20px rgba(255, 255, 255, 0.5)",
                    "0 0 40px rgba(255, 105, 180, 0.8)",
                    "0 0 20px rgba(255, 255, 255, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎉 Happy Birthday! 🎉
              </motion.h1>

              {/* Cake */}
              <div className="relative inline-block">
                {/* Glow effect around cake */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 rounded-full blur-3xl opacity-30"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ width: '120%', height: '120%', left: '-10%', top: '-10%' }}
                />

                {/* Cake base */}
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, -1, 1, -1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Bottom tier */}
                  <div className="w-80 h-32 bg-gradient-to-b from-pink-400 to-pink-500 rounded-lg border-4 border-pink-600 relative">
                    <div className="absolute inset-0 flex items-center justify-around px-8">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="w-1 h-full bg-pink-600" />
                      ))}
                    </div>
                    <div className="absolute top-2 left-0 right-0 h-3 bg-white/30" />
                  </div>

                  {/* Top tier */}
                  <div className="w-64 h-24 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-lg border-4 border-yellow-600 mx-auto -mt-4 relative">
                    <div className="absolute top-2 left-0 right-0 h-2 bg-white/40" />
                    <div className="absolute inset-0 flex items-center justify-around px-6">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-1 h-full bg-yellow-600" />
                      ))}
                    </div>
                  </div>

                  {/* Candles */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-8">
                    {candles.map((isLit, index) => (
                      <div key={index} className="relative">
                        {/* Candle */}
                        <div className="w-3 h-16 bg-gradient-to-b from-red-300 to-red-400 rounded-t-sm border-2 border-red-500" />
                        
                        {/* Flame */}
                        <AnimatePresence>
                          {isLit && (
                            <motion.div
                              className="absolute -top-8 left-1/2 -translate-x-1/2"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ 
                                opacity: 1, 
                                scale: blowing ? 0.5 : 1,
                                x: blowing ? [-2, 2, -2] : 0
                              }}
                              exit={{ opacity: 0, scale: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="relative">
                                <div className="w-4 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-full" />
                                <motion.div
                                  className="absolute inset-0 bg-yellow-300 rounded-full blur-md"
                                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Smoke when blown out */}
                        <AnimatePresence>
                          {!isLit && (
                            <motion.div
                              className="absolute -top-4 left-1/2 -translate-x-1/2"
                              initial={{ opacity: 0.6, y: 0 }}
                              animate={{ opacity: 0, y: -30 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.5 }}
                            >
                              <div className="text-2xl">💨</div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Blowing effect indicator */}
                <AnimatePresence>
                  {blowing && (
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      💨
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Instructions */}
              <div className="mt-16 space-y-4">
                {micPermission === null && (
                  <motion.button
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-5 rounded-full font-bold text-2xl flex items-center gap-4 mx-auto shadow-2xl"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 0 50px rgba(147, 51, 234, 0.8)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={requestMicrophoneAccess}
                  >
                    <Wind className="w-8 h-8" />
                    Blow with Microphone
                  </motion.button>
                )}
                
                {micPermission === true && (
                  <motion.div
                    className="text-white text-2xl flex items-center gap-4 justify-center bg-black/30 backdrop-blur-md px-8 py-4 rounded-full"
                    animate={{
                      opacity: [0.6, 1, 0.6],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Wind className="w-8 h-8" />
                    Blow into your microphone!
                  </motion.div>
                )}

                <motion.button
                  className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-10 py-5 rounded-full font-bold text-2xl flex items-center gap-4 mx-auto mt-4 shadow-2xl"
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 0 50px rgba(236, 72, 153, 0.8)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleManualBlow}
                >
                  <Sparkles className="w-8 h-8" />
                  Click to Blow
                </motion.button>
              </div>

              <motion.div
                className="text-white text-xl mt-8 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full inline-block"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {candles.filter(c => c).length} candle{candles.filter(c => c).length !== 1 ? 's' : ''} remaining
              </motion.div>
            </motion.div>
          ) : !wishMade ? (
            <motion.div
              key="wish"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <motion.div
                className="text-6xl mb-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
              >
                ✨
              </motion.div>
              
              <h2 className="text-5xl font-bold text-white mb-8">
                Make a Wish!
              </h2>

              {showWishInput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <textarea
                    className="w-[500px] h-40 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-2xl p-6 text-white text-xl placeholder-white/50 focus:outline-none focus:border-white/60 focus:ring-4 focus:ring-white/20 shadow-2xl"
                    placeholder="Type your birthday wish here... ✨"
                  />

                  <motion.button
                    className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white px-16 py-6 rounded-full font-bold text-3xl shadow-2xl"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 0 60px rgba(255, 215, 0, 0.8)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMakeWish}
                  >
                    Make My Wish! ⭐
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <motion.div
                className="text-9xl mb-8"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 15, -15, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🎊
              </motion.div>

              <motion.h2
                className="text-7xl font-bold text-white mb-6 drop-shadow-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                  textShadow: [
                    "0 0 30px rgba(255, 255, 255, 0.7)",
                    "0 0 60px rgba(255, 215, 0, 1)",
                    "0 0 30px rgba(255, 255, 255, 0.7)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Happy Birthday!
              </motion.h2>

              <motion.p
                className="text-4xl text-white/90 drop-shadow-xl"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                May all your wishes come true! ✨
              </motion.p>

              <motion.div
                className="text-9xl mt-12"
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 360]
                }}
                transition={{
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                }}
              >
                🎂
              </motion.div>

              {/* Celebration sparkles */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-4xl"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.3, 1, 0.3],
                    rotate: [0, 360],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                >
                  {['✨', '⭐', '💫', '🌟'][i % 4]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
