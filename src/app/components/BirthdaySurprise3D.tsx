import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, MeshDistortMaterial, Sparkles as DreiSparkles, Float, Center } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Wind, Heart } from 'lucide-react';
import * as THREE from 'three';

// 3D Candle Component
function Candle3D({ position, isLit, onBlowOut }: any) {
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (flameRef.current && isLit) {
      const time = clock.getElapsedTime();
      flameRef.current.scale.y = 1 + Math.sin(time * 5) * 0.1;
      flameRef.current.scale.x = 1 + Math.sin(time * 3) * 0.05;
      flameRef.current.scale.z = 1 + Math.sin(time * 3) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Candle stick */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
        <meshStandardMaterial
          color="#ff6b9d"
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Wick */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Flame */}
      {isLit && (
        <>
          <mesh ref={flameRef} position={[0, 1.3, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <MeshDistortMaterial
              color="#ff6600"
              emissive="#ffaa00"
              emissiveIntensity={2}
              distort={0.3}
              speed={2}
            />
          </mesh>
          <pointLight
            position={[0, 1.3, 0]}
            intensity={2}
            distance={5}
            color="#ffaa00"
            castShadow
          />
        </>
      )}

      {/* Smoke when blown out */}
      {!isLit && (
        <group position={[0, 1.5, 0]}>
          <DreiSparkles
            count={20}
            scale={0.5}
            size={2}
            speed={0.5}
            opacity={0.3}
            color="#888888"
          />
        </group>
      )}
    </group>
  );
}

// 3D Cake Component
function Cake3D({ candles, blowing }: any) {
  const cakeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (cakeRef.current) {
      cakeRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
      if (blowing) {
        cakeRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 10) * 0.02;
      } else {
        cakeRef.current.rotation.z *= 0.95;
      }
    }
  });

  return (
    <group ref={cakeRef}>
      {/* Bottom tier */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2.2, 1, 32]} />
        <meshStandardMaterial
          color="#ff69b4"
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Frosting decoration bottom */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.sin(angle) * 2.1,
              0.9,
              Math.cos(angle) * 2.1
            ]}
            castShadow
          >
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              metalness={0.1}
              roughness={0.3}
            />
          </mesh>
        );
      })}

      {/* Middle tier */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.6, 1, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      {/* Frosting decoration middle */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={`mid-${i}`}
            position={[
              Math.sin(angle) * 1.55,
              1.9,
              Math.cos(angle) * 1.55
            ]}
            castShadow
          >
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              metalness={0.1}
              roughness={0.3}
            />
          </mesh>
        );
      })}

      {/* Top tier */}
      <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.1, 0.8, 32]} />
        <meshStandardMaterial
          color="#ff1493"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Candles */}
      {candles.map((isLit: boolean, index: number) => {
        const angle = (index / candles.length) * Math.PI * 2;
        const radius = 0.6;
        return (
          <Candle3D
            key={index}
            position={[
              Math.sin(angle) * radius,
              2.7,
              Math.cos(angle) * radius
            ]}
            isLit={isLit}
          />
        );
      })}

      {/* Sparkles around cake */}
      <DreiSparkles
        count={100}
        scale={6}
        size={3}
        speed={0.3}
        opacity={0.6}
        color="#ffd700"
      />
    </group>
  );
}

// Confetti Particles in 3D
function ConfettiParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const [particlePositions] = useState(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  });

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.05;
        if (positions[i + 1] < -5) {
          positions[i + 1] = 15;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ff69b4"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// 3D Scene Component
function BirthdayScene({ candles, blowing, allCandlesOut, wishMade }: any) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={50} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        autoRotate={wishMade}
        autoRotateSpeed={2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={1} color="#ff69b4" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        castShadow
      />

      {/* Environment */}
      <Environment preset="sunset" />

      {/* Cake */}
      {!wishMade && <Cake3D candles={candles} blowing={blowing} />}

      {/* Celebration hearts when wish made */}
      {wishMade && (
        <>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[1, 32, 32]} />
              <MeshDistortMaterial
                color="#ff69b4"
                emissive="#ff1493"
                emissiveIntensity={1}
                distort={0.4}
                speed={2}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </Float>

          {/* Floating hearts */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 4;
            return (
              <Float
                key={i}
                speed={1 + Math.random()}
                rotationIntensity={0.5}
                floatIntensity={1.5}
              >
                <mesh
                  position={[
                    Math.sin(angle) * radius,
                    Math.cos(i) * 2,
                    Math.cos(angle) * radius
                  ]}
                >
                  <sphereGeometry args={[0.3, 16, 16]} />
                  <meshStandardMaterial
                    color={['#ff69b4', '#ffd700', '#ff1493', '#ff6b6b'][i % 4]}
                    emissive={['#ff1493', '#ffa500', '#ff69b4', '#ff0000'][i % 4]}
                    emissiveIntensity={0.8}
                    metalness={0.6}
                    roughness={0.3}
                  />
                </mesh>
              </Float>
            );
          })}
        </>
      )}

      {/* Confetti particles */}
      {allCandlesOut && <ConfettiParticles />}

      {/* Floor */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          blendFunction={BlendFunction.SCREEN}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.001, 0.001)}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  );
}

// Main Component
export function BirthdaySurprise3D() {
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
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD700', '#FF69B4']
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
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

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

      if (newCandles.every(c => !c)) {
        setAllCandlesOut(true);
        setTimeout(() => {
          setShowWishInput(true);
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
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD700', '#FF69B4']
      });

      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD700', '#FF69B4']
      });
    }, 250);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 3D Canvas */}
      <Canvas shadows className="w-full h-full">
        <BirthdayScene
          candles={candles}
          blowing={blowing}
          allCandlesOut={allCandlesOut}
          wishMade={wishMade}
        />
      </Canvas>

      {/* Animated gradient background overlay */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-red-900"
          animate={{
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Floating particles background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              background: `radial-gradient(circle, ${['#ff69b4', '#ffd700', '#4ecdc4', '#ff6b6b'][Math.floor(Math.random() * 4)]}, transparent)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="pointer-events-auto text-center">
          <AnimatePresence mode="wait">
            {!allCandlesOut ? (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="space-y-6"
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

                <div className="space-y-4">
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
                    className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-10 py-5 rounded-full font-bold text-2xl flex items-center gap-4 mx-auto shadow-2xl"
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
                  animate={{
                    opacity: [0.5, 1, 0.5]
                  }}
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
                exit={{ opacity: 0, scale: 0.8 }}
                className="space-y-8"
              >
                <motion.div
                  className="text-8xl mb-8"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  ✨
                </motion.div>

                <h2 className="text-6xl font-bold text-white mb-8 drop-shadow-2xl">
                  Make a Wish!
                </h2>

                {showWishInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <textarea
                      className="w-[500px] h-40 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-2xl p-6 text-white text-xl placeholder-white/50 focus:outline-none focus:border-white/60 focus:ring-4 focus:ring-white/20"
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
                      <span className="flex items-center gap-3">
                        Make My Wish! <Heart className="w-8 h-8 fill-white" />
                      </span>
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
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
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Happy Birthday!
                </motion.h2>

                <motion.p
                  className="text-4xl text-white/90 drop-shadow-xl"
                  animate={{
                    opacity: [0.7, 1, 0.7]
                  }}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Blowing effect particles */}
      <AnimatePresence>
        {blowing && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1
                }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  opacity: 0,
                  scale: [1, 1.5, 0.5]
                }}
                transition={{ duration: 0.8 }}
              >
                💨
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
