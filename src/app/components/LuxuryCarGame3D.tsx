import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';

interface LuxuryCarGame3DProps {
  onDestinationReached: () => void;
}

export function LuxuryCarGame3D({ onDestinationReached }: LuxuryCarGame3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 50, 200);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 20);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting - luxury dark theme
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x4a5568, 1.5);
    mainLight.position.set(20, 30, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -50;
    mainLight.shadow.camera.right = 50;
    mainLight.shadow.camera.top = 50;
    mainLight.shadow.camera.bottom = -50;
    scene.add(mainLight);

    // Accent lighting - gold/purple luxury
    const accentLight1 = new THREE.PointLight(0xd4af37, 2, 50);
    accentLight1.position.set(-20, 10, -30);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x9333ea, 2, 50);
    accentLight2.position.set(20, 10, -60);
    scene.add(accentLight2);

    // Road - dark luxury material
    const roadGeometry = new THREE.PlaneGeometry(30, 500);
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);

    // Road markings - gold accent
    const markingGeometry = new THREE.PlaneGeometry(0.4, 6);
    const markingMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0xd4af37,
      emissiveIntensity: 0.5,
    });

    const roadMarkings: THREE.Mesh[] = [];
    for (let i = 0; i < 40; i++) {
      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.position.set(0, 0.05, -i * 12);
      marking.rotation.x = -Math.PI / 2;
      scene.add(marking);
      roadMarkings.push(marking);
    }

    // Ground - dark side areas
    const groundGeometry = new THREE.PlaneGeometry(200, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0f14,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Luxury car - sleek design with metallic finish
    const carGroup = new THREE.Group();

    // Car body - metallic black
    const bodyGeometry = new THREE.BoxGeometry(2.2, 1, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x1a1a1a,
      emissiveIntensity: 0.2,
    });
    const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    carBody.position.y = 0.8;
    carBody.castShadow = true;
    carGroup.add(carBody);

    // Car cabin - tinted glass
    const cabinGeometry = new THREE.BoxGeometry(1.9, 0.9, 2.2);
    const cabinMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 1.5, -0.2);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Windshield - dark blue tint
    const windshieldGeometry = new THREE.PlaneGeometry(1.7, 0.8);
    const windshieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.5,
    });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0, 1.5, 0.9);
    windshield.rotation.x = -0.2;
    carGroup.add(windshield);

    // Wheels - metallic with gold accents
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.8,
      roughness: 0.3,
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xd4af37,
      emissiveIntensity: 0.2,
    });

    const wheelPositions: [number, number, number][] = [
      [-1.2, 0.4, 1.4],
      [1.2, 0.4, 1.4],
      [-1.2, 0.4, -1.4],
      [1.2, 0.4, -1.4],
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      carGroup.add(wheel);

      // Gold rim accent
      const rimGeometry = new THREE.TorusGeometry(0.25, 0.05, 8, 16);
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.y = Math.PI / 2;
      rim.position.set(x > 0 ? x - 0.15 : x + 0.15, y, z);
      carGroup.add(rim);
    });

    // Headlights - bright white/blue
    const headlightGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const headlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xadd8e6,
      emissiveIntensity: 2,
      metalness: 0.5,
      roughness: 0.2,
    });

    [-0.8, 0.8].forEach((x) => {
      const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
      headlight.position.set(x, 0.6, 2.1);
      carGroup.add(headlight);

      const spotlight = new THREE.SpotLight(0xadd8e6, 3, 50, Math.PI / 6, 0.5);
      spotlight.position.set(x, 0.6, 2.1);
      spotlight.target.position.set(x, 0, 10);
      spotlight.castShadow = true;
      carGroup.add(spotlight);
      scene.add(spotlight.target);
    });

    // Taillights - red glow
    const taillightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1.5,
    });

    [-0.8, 0.8].forEach((x) => {
      const taillight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), taillightMaterial);
      taillight.position.set(x, 0.6, -2.1);
      carGroup.add(taillight);
    });

    // Underglow - purple/gold
    const underglowLight = new THREE.PointLight(0x9333ea, 2, 5);
    underglowLight.position.set(0, 0.2, 0);
    carGroup.add(underglowLight);

    carGroup.position.set(0, 0, 0);
    scene.add(carGroup);

    // Buildings - dark futuristic skyscrapers
    const buildings: THREE.Mesh[] = [];
    for (let i = 0; i < 20; i++) {
      const width = 4 + Math.random() * 4;
      const height = 20 + Math.random() * 40;
      const depth = 4 + Math.random() * 4;

      const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
      const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.3,
        roughness: 0.7,
        emissive: 0x0f0f1a,
        emissiveIntensity: 0.1,
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

      building.position.set(
        Math.random() > 0.5 ? 30 + Math.random() * 20 : -30 - Math.random() * 20,
        height / 2,
        -i * 30 - Math.random() * 20
      );
      building.castShadow = true;
      building.receiveShadow = true;
      scene.add(building);
      buildings.push(building);

      // Building windows - gold accent lights
      const windowsGeometry = new THREE.PlaneGeometry(width * 0.8, height * 0.9);
      const windowsMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        emissive: 0xd4af37,
        emissiveIntensity: Math.random() > 0.5 ? 0.3 : 0.05,
        transparent: true,
        opacity: 0.4,
      });
      const windows = new THREE.Mesh(windowsGeometry, windowsMaterial);
      windows.position.copy(building.position);
      windows.position.z += depth / 2 + 0.01;
      scene.add(windows);
    }

    // Particles - floating dust/light particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = Math.random() * 50;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Input handling
    const keys: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game state
    let currentSpeed = 0;
    let currentDistance = 0;
    let carRotation = 0;
    let roadOffset = 0;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Physics
      const acceleration = 0.3;
      const maxSpeed = 15;
      const friction = 0.95;
      const turnSpeed = 0.04;

      if (keys['arrowup'] || keys['w']) {
        currentSpeed = Math.min(currentSpeed + acceleration, maxSpeed);
      } else if (keys['arrowdown'] || keys['s']) {
        currentSpeed = Math.max(currentSpeed - acceleration, -maxSpeed / 2);
      } else {
        currentSpeed *= friction;
        if (Math.abs(currentSpeed) < 0.1) currentSpeed = 0;
      }

      if (Math.abs(currentSpeed) > 0.5) {
        if (keys['arrowleft'] || keys['a']) {
          carRotation += turnSpeed;
          carGroup.position.x -= 0.15;
        }
        if (keys['arrowright'] || keys['d']) {
          carRotation -= turnSpeed;
          carGroup.position.x += 0.15;
        }
      }

      // Keep car on road
      carGroup.position.x = Math.max(-12, Math.min(12, carGroup.position.x));

      // Smooth rotation
      carGroup.rotation.y += (carRotation - carGroup.rotation.y) * 0.1;
      carRotation *= 0.9;

      // Car bounce
      carGroup.position.y = Math.sin(Date.now() * 0.005) * 0.05 * Math.abs(currentSpeed);

      // Update camera follow
      camera.position.x += (carGroup.position.x - camera.position.x) * 0.05;
      camera.position.z = carGroup.position.z + 20 + currentSpeed * 0.5;

      // Animate road markings
      roadOffset += currentSpeed * 0.1;
      roadMarkings.forEach((marking, i) => {
        marking.position.z += currentSpeed * 0.3;
        if (marking.position.z > 20) {
          marking.position.z = -200;
        }
      });

      // Animate buildings
      buildings.forEach((building) => {
        building.position.z += currentSpeed * 0.2;
        if (building.position.z > 50) {
          building.position.z = -200 - Math.random() * 100;
        }
      });

      // Animate particles
      particles.rotation.y += 0.0005;
      const particlePositions = particlesGeometry.attributes.position.array as Float32Array;
      for (let i = 1; i < particlePositions.length; i += 3) {
        particlePositions[i] -= 0.02;
        if (particlePositions[i] < 0) {
          particlePositions[i] = 50;
        }
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // Update distance
      currentDistance += Math.abs(currentSpeed) * 0.1;
      setDistance(Math.floor(currentDistance));
      setSpeed(Math.floor(Math.abs(currentSpeed) * 10));

      // Check destination
      if (currentDistance >= 500) {
        onDestinationReached();
        return;
      }

      // Pulse underglow based on speed
      underglowLight.intensity = 2 + (currentSpeed / maxSpeed) * 2;

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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      scene.clear();
      renderer.dispose();
    };
  }, [onDestinationReached]);

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={containerRef} className="w-full h-full" />

      {/* Luxury HUD */}
      <div className="absolute top-8 left-8">
        <motion.div
          className="bg-gradient-to-br from-black/80 via-gray-900/70 to-black/80 backdrop-blur-xl p-8 rounded-2xl border border-gold-500/20 shadow-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ boxShadow: '0 0 40px rgba(212, 175, 55, 0.1)' }}
        >
          <motion.div
            className="text-7xl font-light mb-3 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent tracking-wider"
            animate={{ scale: speed > 100 ? [1, 1.03, 1] : 1 }}
            transition={{ duration: 0.5, repeat: speed > 100 ? Infinity : 0 }}
          >
            {speed}
          </motion.div>
          <div className="text-sm text-gray-400 tracking-widest mb-6">KM/H</div>

          <div className="text-lg text-gray-300 mb-2 tracking-wide">DISTANCE</div>
          <div className="text-2xl font-light text-yellow-400 mb-6">{distance}M / 500M</div>

          <div className="w-72 h-1 bg-gray-800/50 rounded-full overflow-hidden mb-8">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${(distance / 500) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{ boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)' }}
            />
          </div>

          <div className="space-y-1 text-xs text-gray-500 tracking-wider">
            <div>↑ W → ACCELERATE</div>
            <div>↓ S → BRAKE</div>
            <div>← → A D → STEER</div>
          </div>
        </motion.div>
      </div>

      {/* Destination indicator */}
      <div className="absolute top-8 right-8">
        <motion.div
          className="bg-gradient-to-r from-yellow-900/40 to-yellow-700/40 backdrop-blur-xl border border-yellow-500/30 px-8 py-4 rounded-xl tracking-wider"
          animate={{
            boxShadow: [
              '0 0 20px rgba(212, 175, 55, 0.2)',
              '0 0 40px rgba(212, 175, 55, 0.4)',
              '0 0 20px rgba(212, 175, 55, 0.2)'
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-yellow-400 font-light">DESTINATION AHEAD</span>
        </motion.div>
      </div>

      {/* Speed vignette */}
      {speed > 80 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.6) 100%)',
          }}
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  );
}
