import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Wind, Sparkles as SparklesIcon } from 'lucide-react';
import * as THREE from 'three';

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 25); // Speed of typing

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <div className="text-yellow-100/95 text-2xl leading-loose font-light tracking-wide whitespace-pre-wrap">
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          className="inline-block w-0.5 h-7 bg-yellow-400/80 ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </div>
  );
}

export function LuxuryBirthday3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [candles, setCandles] = useState([true, true, true, true, true, true, true]);
  const [blowing, setBlowing] = useState(false);
  const [allCandlesOut, setAllCandlesOut] = useState(false);
  const [wishMade, setWishMade] = useState(false);
  const [showWishInput, setShowWishInput] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStream | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  const birthdayMessage = `Happy Birthday to the most precious friend in my life 🌟

Thank you for standing beside me during my toughest times and for being part of all my happiest memories too. Through every smile, every struggle, and every moment we shared, you always stayed with me like a true friend. I honestly don't know what I would have done without you.

I have always adored friendships, but this friendship feels different — rare, genuine, and priceless. It is one of the most beautiful bonds I have ever had, and I truly want to keep it forever. No matter where life takes us, I wish our friendship stays this strong till our very last breath.

Thank you for understanding me when nobody else could, for supporting me without judging me, and for bringing comfort into my life just by being there. You are not just my best friend, you are family to me.

On your special day, I pray that all your dreams come true, that happiness follows you everywhere, and that life gives you endless success, peace, love, and beautiful memories. You deserve every good thing this world has to offer.

No matter how much time passes, I'll always be grateful that life gave me a friend like you. Thank you for being my safe place, my happiness, and one of the best chapters of my life.

Happy Birthday once again 🎉✨ Forever grateful for you. Forever my best friend.`;

  useEffect(() => {
    // Luxury confetti on entrance
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#1a1a2e', '#9333ea', '#6b7280']
      });
    }, 500);
  }, []);

  useEffect(() => {
    if (!containerRef.current || wishMade) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 30, 80);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 6, 18);
    camera.lookAt(0, 2, 0);
    camera.rotation.z = 0; // Ensure no roll

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x6b7280, 1);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Accent lights - luxury purple and gold
    const purpleLight = new THREE.PointLight(0x9333ea, 3, 30);
    purpleLight.position.set(-8, 10, 5);
    scene.add(purpleLight);

    const goldLight = new THREE.PointLight(0xd4af37, 3, 30);
    goldLight.position.set(8, 10, 5);
    scene.add(goldLight);

    // Rotating rim light
    const rimLight = new THREE.PointLight(0xffffff, 2, 40);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);

    // Floor - dark luxury marble
    const floorGeometry = new THREE.CircleGeometry(20, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0f14,
      metalness: 0.8,
      roughness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Cake group
    const cakeGroup = new THREE.Group();

    // Bottom tier - dark chocolate with gold accents
    const bottomTierGeometry = new THREE.CylinderGeometry(3, 3.2, 1.5, 32);
    const bottomTierMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1810,
      metalness: 0.2,
      roughness: 0.6,
    });
    const bottomTier = new THREE.Mesh(bottomTierGeometry, bottomTierMaterial);
    bottomTier.position.y = 0.75;
    bottomTier.castShadow = true;
    cakeGroup.add(bottomTier);

    // Gold frosting on bottom tier
    const frostingCount = 20;
    for (let i = 0; i < frostingCount; i++) {
      const angle = (i / frostingCount) * Math.PI * 2;
      const frostingGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const frostingMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xd4af37,
        emissiveIntensity: 0.3,
      });
      const frosting = new THREE.Mesh(frostingGeometry, frostingMaterial);
      frosting.position.set(Math.sin(angle) * 3.1, 1.4, Math.cos(angle) * 3.1);
      frosting.castShadow = true;
      cakeGroup.add(frosting);
    }

    // Middle tier - deep purple
    const middleTierGeometry = new THREE.CylinderGeometry(2.2, 2.4, 1.2, 32);
    const middleTierMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a0f2e,
      metalness: 0.3,
      roughness: 0.5,
    });
    const middleTier = new THREE.Mesh(middleTierGeometry, middleTierMaterial);
    middleTier.position.y = 2.1;
    middleTier.castShadow = true;
    cakeGroup.add(middleTier);

    // Top tier - charcoal black
    const topTierGeometry = new THREE.CylinderGeometry(1.5, 1.7, 1, 32);
    const topTierMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.4,
      roughness: 0.4,
    });
    const topTier = new THREE.Mesh(topTierGeometry, topTierMaterial);
    topTier.position.y = 3.2;
    topTier.castShadow = true;
    cakeGroup.add(topTier);

    // Candles and flames
    const candleGroup = new THREE.Group();
    const candlePositions: [number, number, number][] = [];
    const flameGroups: THREE.Group[] = [];

    candles.forEach((_, index) => {
      const angle = (index / candles.length) * Math.PI * 2;
      const radius = 1;

      // Candle stick - dark with gold tip
      const candleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
      const candleMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a1810,
        metalness: 0.3,
        roughness: 0.7,
      });
      const candle = new THREE.Mesh(candleGeometry, candleMaterial);
      candle.position.set(
        Math.sin(angle) * radius,
        4.3,
        Math.cos(angle) * radius
      );
      candle.castShadow = true;
      candleGroup.add(candle);

      candlePositions.push([
        Math.sin(angle) * radius,
        4.9,
        Math.cos(angle) * radius
      ]);

      // Flame
      const flameGroup = new THREE.Group();
      const flameGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      const flameMaterial = new THREE.MeshStandardMaterial({
        color: 0xffa500,
        emissive: 0xff6600,
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.9,
      });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.scale.set(1, 1.5, 1);
      flameGroup.add(flame);

      // Flame glow
      const flameLight = new THREE.PointLight(0xffa500, 1.5, 5);
      flameGroup.add(flameLight);

      flameGroup.position.set(...candlePositions[index]);
      candleGroup.add(flameGroup);
      flameGroups.push(flameGroup);
    });

    cakeGroup.add(candleGroup);
    cakeGroup.position.y = 1;
    scene.add(cakeGroup);

    // Particle system - luxury sparkles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = Math.random() * 20;
      positions[i + 2] = (Math.random() - 0.5) * 40;

      // Mix of gold and purple particles
      if (Math.random() > 0.5) {
        colors[i] = 0.83;     // Gold
        colors[i + 1] = 0.69;
        colors[i + 2] = 0.22;
      } else {
        colors[i] = 0.58;     // Purple
        colors[i + 1] = 0.2;
        colors[i + 2] = 0.92;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate cake slowly
      cakeGroup.rotation.y += 0.002;

      // Flicker flames
      flameGroups.forEach((flameGroup, index) => {
        if (candles[index]) {
          flameGroup.visible = true;
          const scale = 1 + Math.sin(time * 10 + index) * 0.1;
          flameGroup.scale.set(scale, scale * 1.2, scale);
          flameGroup.position.y = candlePositions[index][1] + Math.sin(time * 5 + index) * 0.05;
        } else {
          flameGroup.visible = false;
        }
      });

      // Rotate lights
      const lightAngle = time * 0.5;
      purpleLight.position.x = Math.sin(lightAngle) * 8;
      purpleLight.position.z = Math.cos(lightAngle) * 8;
      goldLight.position.x = Math.sin(lightAngle + Math.PI) * 8;
      goldLight.position.z = Math.cos(lightAngle + Math.PI) * 8;

      // Animate particles
      particleSystem.rotation.y += 0.0005;
      const particlePositions = particlesGeometry.attributes.position.array as Float32Array;
      for (let i = 1; i < particlePositions.length; i += 3) {
        particlePositions[i] += Math.sin(time + i) * 0.001;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // Keep camera perfectly straight
      camera.position.x = 0;
      camera.position.y = 6;
      camera.position.z = 18;
      camera.rotation.z = 0;
      camera.lookAt(0, 2, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      scene.clear();
      renderer.dispose();
    };
  }, [candles, wishMade]);

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

    // Luxury confetti
    const duration = 5000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#d4af37', '#9333ea', '#6b7280', '#1a1a2e']
      });

      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#d4af37', '#9333ea', '#6b7280', '#1a1a2e']
      });
    }, 250);
  };

  const handleEnvelopeClick = () => {
    setEnvelopeOpen(true);
    setTimeout(() => {
      setShowMessage(true);
    }, 800);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" style={{ transform: 'none', perspective: 'none' }}>
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0" style={{ transform: 'none' }} />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none" style={{ transform: 'none' }} />

      {/* UI Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'none', perspective: 'none' }}>
        <div className="pointer-events-auto w-full max-w-7xl px-8" style={{ transform: 'none' }}>
          <AnimatePresence mode="wait">
            {!allCandlesOut ? (
              <motion.div
                key="blow"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-center"
              >
                <motion.h1
                  className="text-6xl font-light mb-16 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 tracking-wider"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '200% auto' }}
                >
                  HAPPY BIRTHDAY
                </motion.h1>

                <div className="space-y-6">
                  {micPermission === null && (
                    <motion.button
                      className="bg-gradient-to-r from-gray-900 to-gray-800 border border-yellow-500/30 text-yellow-400 px-12 py-5 rounded-lg font-light text-xl tracking-wider backdrop-blur-xl"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={requestMicrophoneAccess}
                    >
                      <div className="flex items-center gap-4">
                        <Wind className="w-6 h-6" />
                        USE MICROPHONE
                      </div>
                    </motion.button>
                  )}

                  {micPermission === true && (
                    <motion.div
                      className="text-yellow-400 text-xl tracking-wider bg-black/40 backdrop-blur-xl border border-yellow-500/20 px-8 py-4 rounded-lg"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex items-center gap-4">
                        <Wind className="w-6 h-6" />
                        BLOW TO EXTINGUISH
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    className="bg-gradient-to-r from-purple-900/40 to-purple-800/40 border border-purple-500/30 text-purple-300 px-12 py-5 rounded-lg font-light text-xl tracking-wider backdrop-blur-xl"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 0 30px rgba(147, 51, 234, 0.3)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleManualBlow}
                  >
                    <div className="flex items-center gap-4">
                      <SparklesIcon className="w-6 h-6" />
                      CLICK TO BLOW
                    </div>
                  </motion.button>
                </div>

                <motion.div
                  className="text-gray-400 text-sm tracking-widest mt-8 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full inline-block"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {candles.filter(c => c).length} CANDLES REMAINING
                </motion.div>
              </motion.div>
            ) : !wishMade ? (
              <motion.div
                key="wish"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <motion.div
                  className="text-7xl mb-12"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  ✨
                </motion.div>

                <h2 className="text-5xl font-light text-yellow-400 mb-12 tracking-wider">
                  MAKE YOUR WISH
                </h2>

                {showWishInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <textarea
                      className="w-[600px] h-48 bg-black/60 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-8 text-yellow-100 text-lg placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none font-light tracking-wide"
                      placeholder="Your wish..."
                    />

                    <motion.button
                      className="bg-gradient-to-r from-yellow-900/60 to-yellow-800/60 border border-yellow-500/40 text-yellow-300 px-16 py-6 rounded-xl font-light text-2xl tracking-widest backdrop-blur-xl"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 0 50px rgba(212, 175, 55, 0.4)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMakeWish}
                    >
                      SEAL THE WISH
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-5xl mx-auto"
              >
                {!showMessage ? (
                  <>
                    <motion.div
                      className="text-8xl mb-12"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🎊
                    </motion.div>

                    <motion.h2
                      className="text-7xl font-light mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-purple-400 to-yellow-300 tracking-wider"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                      style={{ backgroundSize: '200% auto' }}
                    >
                      MAY YOUR WISH
                    </motion.h2>

                    <motion.p
                      className="text-5xl font-light text-yellow-400/90 tracking-widest mb-16"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      COME TRUE
                    </motion.p>

                    {/* Envelope */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className="mt-16"
                    >
                      <motion.button
                        onClick={handleEnvelopeClick}
                        className="relative group cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Envelope */}
                        <div className="relative w-80 h-48 mx-auto">
                          {/* Envelope body */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-yellow-900/60 to-yellow-800/60 backdrop-blur-xl border border-yellow-500/40 rounded-lg shadow-2xl"
                            style={{ boxShadow: '0 10px 40px rgba(212, 175, 55, 0.3)' }}
                            animate={envelopeOpen ? {} : { y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />

                          {/* Envelope flap */}
                          <motion.div
                            className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-yellow-800/70 to-yellow-700/70 border-x border-t border-yellow-500/40 origin-top"
                            style={{
                              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                            }}
                            animate={envelopeOpen ? { rotateX: -180 } : {}}
                            transition={{ duration: 0.8 }}
                          />

                          {/* Seal */}
                          <motion.div
                            className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full border-2 border-purple-400/50 flex items-center justify-center text-2xl shadow-lg"
                            animate={envelopeOpen ? { scale: 0, opacity: 0 } : {}}
                          >
                            🌟
                          </motion.div>

                          {/* Text on envelope */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="text-yellow-400 font-light tracking-widest text-lg"
                              animate={envelopeOpen ? { opacity: 0 } : { opacity: 1 }}
                            >
                              OPEN WHEN READY
                            </motion.div>
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative w-full max-w-5xl mx-auto"
                  >
                    {/* Decorative friendship symbols around the message */}
                    <motion.div
                      className="absolute -top-8 -left-8 text-5xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🌟
                    </motion.div>
                    <motion.div
                      className="absolute -top-8 -right-8 text-5xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    >
                      🎈
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-8 -left-8 text-5xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    >
                      🌸
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-8 -right-8 text-5xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                    >
                      ✨
                    </motion.div>

                    <style>{`
                      .message-scroll::-webkit-scrollbar {
                        width: 10px;
                      }
                      .message-scroll::-webkit-scrollbar-track {
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 10px;
                        margin: 12px 0;
                      }
                      .message-scroll::-webkit-scrollbar-thumb {
                        background: linear-gradient(to bottom, rgba(212, 175, 55, 0.6), rgba(212, 175, 55, 0.4));
                        border-radius: 10px;
                        border: 2px solid transparent;
                        background-clip: padding-box;
                      }
                      .message-scroll::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(to bottom, rgba(212, 175, 55, 0.8), rgba(212, 175, 55, 0.6));
                        background-clip: padding-box;
                      }
                    `}</style>

                    <div className="relative">
                      <div
                        className="message-scroll bg-gradient-to-br from-black/80 via-gray-900/70 to-black/80 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-12 max-h-[75vh] overflow-y-auto shadow-2xl"
                        style={{
                          boxShadow: '0 0 60px rgba(212, 175, 55, 0.3), inset 0 0 60px rgba(212, 175, 55, 0.05)',
                          transform: 'none',
                          perspective: 'none'
                        }}
                        onScroll={(e) => {
                          const target = e.target as HTMLDivElement;
                          const scrollIndicator = document.getElementById('scroll-indicator');
                          if (scrollIndicator) {
                            if (target.scrollTop > 50) {
                              scrollIndicator.style.opacity = '0';
                            } else {
                              scrollIndicator.style.opacity = '1';
                            }
                          }
                        }}
                      >
                        {/* Decorative header */}
                        <motion.div
                          className="text-center mb-8 pb-6 border-b border-yellow-500/20"
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="text-6xl mb-4">🎁</div>
                          <div className="text-yellow-400 tracking-widest text-sm font-light">
                            A MESSAGE FOR MY BEST FRIEND
                          </div>
                        </motion.div>

                        <div className="text-left">
                          <TypewriterText text={birthdayMessage} />
                        </div>

                        {/* Decorative footer */}
                        <motion.div
                          className="text-center mt-8 pt-6 border-t border-yellow-500/20"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: birthdayMessage.length * 0.025 + 1 }}
                        >
                          <div className="text-4xl">🌟✨🌟</div>
                        </motion.div>
                      </div>

                      {/* Scroll indicator */}
                      <motion.div
                        id="scroll-indicator"
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none transition-opacity duration-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                      >
                        <motion.div
                          className="text-yellow-400/60 text-sm tracking-widest mb-2 font-light"
                        >
                          SCROLL DOWN FOR MORE
                        </motion.div>
                        <motion.div
                          className="text-yellow-400/80 text-2xl"
                          animate={{ y: [0, 8, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ↓
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
