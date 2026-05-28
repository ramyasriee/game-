import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  PerspectiveCamera,
  Environment,
  Sky,
  Cloud
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { motion } from 'motion/react';

interface CarGame3DProps {
  onDestinationReached: () => void;
}

// 3D Car Component
function Car({ position, rotation, onMove }: any) {
  const carRef = useRef<THREE.Group>(null);
  const [speed, setSpeed] = useState(0);
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!carRef.current) return;

    const keys = keysPressed.current;
    const acceleration = 0.05;
    const maxSpeed = 2;
    const friction = 0.95;
    const turnSpeed = 0.03;

    let currentSpeed = speed;

    // Acceleration
    if (keys.has('arrowup') || keys.has('w')) {
      currentSpeed = Math.min(currentSpeed + acceleration, maxSpeed);
    } else if (keys.has('arrowdown') || keys.has('s')) {
      currentSpeed = Math.max(currentSpeed - acceleration, -maxSpeed / 2);
    } else {
      currentSpeed *= friction;
      if (Math.abs(currentSpeed) < 0.01) currentSpeed = 0;
    }

    setSpeed(currentSpeed);

    // Steering
    if (Math.abs(currentSpeed) > 0.1) {
      if (keys.has('arrowleft') || keys.has('a')) {
        carRef.current.rotation.y += turnSpeed;
      }
      if (keys.has('arrowright') || keys.has('d')) {
        carRef.current.rotation.y -= turnSpeed;
      }
    }

    // Move forward based on rotation
    const moveX = Math.sin(carRef.current.rotation.y) * currentSpeed;
    const moveZ = Math.cos(carRef.current.rotation.y) * currentSpeed;

    carRef.current.position.x += moveX;
    carRef.current.position.z += moveZ;

    // Keep on road (boundaries)
    carRef.current.position.x = Math.max(-15, Math.min(15, carRef.current.position.x));

    // Notify parent of movement
    onMove(carRef.current.position.z, Math.abs(currentSpeed) * 50);

    // Add subtle car bobbing
    carRef.current.position.y = 0.5 + Math.sin(Date.now() * 0.005) * 0.05 * Math.abs(currentSpeed);
  });

  return (
    <group ref={carRef} position={position} rotation={rotation}>
      {/* Car Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 1, 3.5]} />
        <meshStandardMaterial
          color="#ff0000"
          metalness={0.8}
          roughness={0.2}
          emissive="#330000"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Car Roof */}
      <mesh position={[0, 1.2, -0.3]} castShadow>
        <boxGeometry args={[1.8, 0.8, 2]} />
        <meshStandardMaterial
          color="#cc0000"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 1.2, 0.7]} castShadow>
        <boxGeometry args={[1.6, 0.7, 0.1]} />
        <meshStandardMaterial
          color="#88ccff"
          transparent
          opacity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Back Window */}
      <mesh position={[0, 1.2, -1.3]} castShadow>
        <boxGeometry args={[1.6, 0.7, 0.1]} />
        <meshStandardMaterial
          color="#88ccff"
          transparent
          opacity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Wheels */}
      <Wheel position={[-1, 0.3, 1.2]} />
      <Wheel position={[1, 0.3, 1.2]} />
      <Wheel position={[-1, 0.3, -1.2]} />
      <Wheel position={[1, 0.3, -1.2]} />

      {/* Headlights */}
      <pointLight position={[0.7, 0.5, 1.8]} intensity={5} distance={20} color="#ffff88" />
      <pointLight position={[-0.7, 0.5, 1.8]} intensity={5} distance={20} color="#ffff88" />

      <mesh position={[0.7, 0.5, 1.8]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.7, 0.5, 1.8]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// Wheel Component
function Wheel({ position }: { position: [number, number, number] }) {
  const wheelRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (wheelRef.current) {
      wheelRef.current.rotation.x += 0.1;
    }
  });

  return (
    <mesh ref={wheelRef} position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.4} />
    </mesh>
  );
}

// Road Component
function Road() {
  const roadRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (roadRef.current) {
      // Animate road texture
      const time = clock.getElapsedTime();
      (roadRef.current.material as THREE.MeshStandardMaterial).map!.offset.y = time * 0.5;
    }
  });

  return (
    <>
      {/* Road surface */}
      <mesh ref={roadRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[35, 1000]} />
        <meshStandardMaterial
          color="#2a2a2a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Road markings */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.05, -i * 20]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.5, 8]} />
          <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Grass on sides */}
      <mesh position={[25, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 1000]} />
        <meshStandardMaterial color="#2d5016" roughness={0.9} />
      </mesh>
      <mesh position={[-25, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 1000]} />
        <meshStandardMaterial color="#2d5016" roughness={0.9} />
      </mesh>
    </>
  );
}

// Tree Component
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 4]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>

      {/* Foliage */}
      <mesh position={[0, 5, 0]} castShadow>
        <coneGeometry args={[2, 3, 8]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} />
      </mesh>
      <mesh position={[0, 6.5, 0]} castShadow>
        <coneGeometry args={[1.5, 2.5, 8]} />
        <meshStandardMaterial color="#3a6b1f" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Building Component
function Building({ position, width, height, depth }: any) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#5a5a5a"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Windows */}
      {Array.from({ length: Math.floor(height / 3) }).map((_, floor) => (
        <group key={floor}>
          {Array.from({ length: 3 }).map((_, window) => (
            <mesh
              key={window}
              position={[
                (window - 1) * 2,
                floor * 3 + 2,
                depth / 2 + 0.01
              ]}
            >
              <planeGeometry args={[1, 1.5]} />
              <meshStandardMaterial
                color="#ffe082"
                emissive="#ffe082"
                emissiveIntensity={Math.random() > 0.3 ? 0.5 : 0}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Scene Component
function Scene({ onDistanceUpdate, onSpeedUpdate }: any) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [carPosition, setCarPosition] = useState(0);
  const [distance, setDistance] = useState(0);

  const handleCarMove = (z: number, speed: number) => {
    setCarPosition(z);
    const dist = Math.abs(z);
    setDistance(dist);
    onDistanceUpdate(dist);
    onSpeedUpdate(speed);
  };

  useFrame(() => {
    if (cameraRef.current) {
      // Smooth camera follow
      cameraRef.current.position.z += (carPosition - 10 - cameraRef.current.position.z) * 0.05;
    }
  });

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 8, 15]}
        fov={75}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0.6}
        azimuth={0.25}
      />

      {/* Clouds */}
      <Cloud position={[10, 20, -30]} speed={0.2} opacity={0.5} />
      <Cloud position={[-15, 25, -50]} speed={0.3} opacity={0.4} />
      <Cloud position={[20, 22, -80]} speed={0.15} opacity={0.6} />

      {/* Environment */}
      <Environment preset="sunset" />

      {/* Road */}
      <Road />

      {/* Car */}
      <Car
        position={[0, 0.5, 0]}
        rotation={[0, Math.PI, 0]}
        onMove={handleCarMove}
      />

      {/* Trees */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Tree
          key={i}
          position={[
            Math.random() > 0.5 ? 20 + Math.random() * 10 : -20 - Math.random() * 10,
            0,
            -i * 30 - Math.random() * 20
          ]}
        />
      ))}

      {/* Buildings */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Building
          key={i}
          position={[
            Math.random() > 0.5 ? 35 + Math.random() * 10 : -35 - Math.random() * 10,
            0,
            -i * 50 - Math.random() * 30
          ]}
          width={5 + Math.random() * 3}
          height={10 + Math.random() * 20}
          depth={5 + Math.random() * 3}
        />
      ))}

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.9}
          blendFunction={BlendFunction.SCREEN}
        />
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={3}
          height={480}
        />
      </EffectComposer>
    </>
  );
}

// Main Component
export function CarGame3D({ onDestinationReached }: CarGame3DProps) {
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (distance >= 500) {
      onDestinationReached();
    }
  }, [distance, onDestinationReached]);

  return (
    <div className="relative w-full h-full">
      <Canvas shadows>
        <Scene
          onDistanceUpdate={setDistance}
          onSpeedUpdate={setSpeed}
        />
      </Canvas>

      {/* HUD */}
      <div className="absolute top-8 left-8 text-white">
        <motion.div
          className="bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-white/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {Math.round(speed)} km/h
          </div>
          <div className="text-2xl font-semibold mb-6">
            Distance: {Math.round(distance)}m / 500m
          </div>
          <div className="w-64 h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${(distance / 500) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-6 text-sm opacity-75 space-y-1">
            <div>↑ W: Accelerate</div>
            <div>↓ S: Brake</div>
            <div>← → A D: Steer</div>
          </div>
        </motion.div>
      </div>

      {/* Destination indicator */}
      <div className="absolute top-8 right-8">
        <motion.div
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl"
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 0 20px rgba(255, 165, 0, 0.5)",
              "0 0 40px rgba(255, 165, 0, 0.8)",
              "0 0 20px rgba(255, 165, 0, 0.5)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎂 Birthday Destination Ahead!
        </motion.div>
      </div>

      {/* Speed lines effect */}
      {speed > 50 && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 bg-white/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                height: `${20 + Math.random() * 40}px`
              }}
              animate={{
                y: [0, 1000],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
