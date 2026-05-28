import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'motion/react';
import * as THREE from 'three';

function LoadingRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (particlesRef.current) {
      const geometry = particlesRef.current.geometry;
      const positions = new Float32Array(100 * 3);

      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        const radius = 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }, []);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime();
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.z = -clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group>
      {/* Main ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#ff69b4"
          emissive="#ff1493"
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial
          size={0.1}
          color="#ffd700"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#4ecdc4"
          emissive="#45b7d1"
          emissiveIntensity={1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Lights */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />
      <pointLight position={[3, 0, 0]} intensity={1} color="#ff69b4" />
      <pointLight position={[-3, 0, 0]} intensity={1} color="#4ecdc4" />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <LoadingRing />
    </>
  );
}

interface LoadingScreen3DProps {
  onComplete: () => void;
}

export function LoadingScreen3D({ onComplete }: LoadingScreen3DProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 3D Canvas */}
      <div className="w-96 h-96">
        <Canvas camera={{ position: [0, 0, 6] }}>
          <Scene />
        </Canvas>
      </div>

      {/* Loading text */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <motion.div
          className="text-white text-3xl font-bold text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div>Loading Premium Experience...</div>
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-white rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
