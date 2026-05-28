import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface CarGameProps {
  onDestinationReached: () => void;
}

export function CarGame({ onDestinationReached }: CarGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const gameStateRef = useRef({
    carX: 0,
    carY: 0,
    carAngle: 0,
    speed: 0,
    roadOffset: 0,
    trees: [] as { x: number; y: number; type: number }[],
    clouds: [] as { x: number; y: number; speed: number }[],
    buildings: [] as { x: number; y: number; width: number; height: number; type: number }[],
    distance: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize game state
    const state = gameStateRef.current;
    state.carX = canvas.width / 2;
    state.carY = canvas.height * 0.7;

    // Generate initial scenery
    for (let i = 0; i < 30; i++) {
      state.trees.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        type: Math.floor(Math.random() * 3),
      });
    }

    for (let i = 0; i < 8; i++) {
      state.clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.3,
        speed: 0.2 + Math.random() * 0.3,
      });
    }

    for (let i = 0; i < 15; i++) {
      state.buildings.push({
        x: Math.random() < 0.5 ? Math.random() * 200 : canvas.width - 200 + Math.random() * 200,
        y: Math.random() * canvas.height,
        width: 60 + Math.random() * 80,
        height: 100 + Math.random() * 150,
        type: Math.floor(Math.random() * 3),
      });
    }

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Draw functions
    const drawSky = (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.7, '#B0D4E3');
      gradient.addColorStop(1, '#E0F2F7');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawClouds = (ctx: CanvasRenderingContext2D) => {
      state.clouds.forEach(cloud => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 30, 0, Math.PI * 2);
        ctx.arc(cloud.x + 25, cloud.y, 35, 0, Math.PI * 2);
        ctx.arc(cloud.x + 50, cloud.y, 30, 0, Math.PI * 2);
        ctx.fill();

        // Move clouds
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + 100) {
          cloud.x = -100;
        }
      });
    };

    const drawRoad = (ctx: CanvasRenderingContext2D) => {
      const roadWidth = 400;
      const roadX = canvas.width / 2 - roadWidth / 2;

      // Grass
      ctx.fillStyle = '#4A7C3E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road surface
      ctx.fillStyle = '#3D3D3D';
      ctx.fillRect(roadX, 0, roadWidth, canvas.height);

      // Road edges
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(roadX, 0, 8, canvas.height);
      ctx.fillRect(roadX + roadWidth - 8, 0, 8, canvas.height);

      // Lane markings
      ctx.fillStyle = '#FFEB3B';
      const dashHeight = 40;
      const dashGap = 30;
      for (let y = -dashHeight + (state.roadOffset % (dashHeight + dashGap)); y < canvas.height; y += dashHeight + dashGap) {
        ctx.fillRect(canvas.width / 2 - 4, y, 8, dashHeight);
      }
    };

    const drawBuildings = (ctx: CanvasRenderingContext2D) => {
      state.buildings.forEach(building => {
        const colors = ['#6B6B6B', '#8B8B8B', '#5A5A5A'];
        ctx.fillStyle = colors[building.type];
        
        // Building body
        ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Windows
        ctx.fillStyle = '#FFE082';
        const windowRows = Math.floor(building.height / 25);
        const windowCols = Math.floor(building.width / 20);
        for (let row = 0; row < windowRows; row++) {
          for (let col = 0; col < windowCols; col++) {
            if (Math.random() > 0.3) {
              ctx.fillRect(
                building.x + col * 20 + 5,
                building.y + row * 25 + 5,
                10,
                15
              );
            }
          }
        }

        // Move buildings
        building.y += state.speed * 2;
        if (building.y > canvas.height) {
          building.y = -building.height;
          building.x = Math.random() < 0.5 ? Math.random() * 200 : canvas.width - 200 + Math.random() * 200;
        }
      });
    };

    const drawTrees = (ctx: CanvasRenderingContext2D) => {
      state.trees.forEach(tree => {
        // Only draw trees on the sides of the road
        const roadWidth = 400;
        const roadX = canvas.width / 2 - roadWidth / 2;
        
        if (tree.x > roadX + 20 && tree.x < roadX + roadWidth - 20) {
          tree.x = tree.x < canvas.width / 2 ? roadX - 50 : roadX + roadWidth + 50;
        }

        // Tree trunk
        ctx.fillStyle = '#654321';
        ctx.fillRect(tree.x - 5, tree.y, 10, 30);

        // Tree foliage
        const foliageColors = ['#2D5016', '#3A6B1F', '#4A8328'];
        ctx.fillStyle = foliageColors[tree.type];
        ctx.beginPath();
        ctx.arc(tree.x, tree.y - 10, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tree.x - 10, tree.y - 5, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tree.x + 10, tree.y - 5, 15, 0, Math.PI * 2);
        ctx.fill();

        // Move trees
        tree.y += state.speed * 3;
        if (tree.y > canvas.height + 50) {
          tree.y = -50;
          tree.x = Math.random() * canvas.width;
          if (tree.x > roadX + 20 && tree.x < roadX + roadWidth - 20) {
            tree.x = tree.x < canvas.width / 2 ? roadX - 50 : roadX + roadWidth + 50;
          }
        }
      });
    };

    const drawCar = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.translate(state.carX, state.carY);
      ctx.rotate(state.carAngle);

      // Car shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-25, 5, 50, 80);

      // Car body
      ctx.fillStyle = '#E53935';
      ctx.fillRect(-25, -40, 50, 80);

      // Car roof
      ctx.fillStyle = '#C62828';
      ctx.fillRect(-20, -30, 40, 30);

      // Windows
      ctx.fillStyle = '#B3E5FC';
      ctx.fillRect(-18, -28, 15, 25);
      ctx.fillRect(3, -28, 15, 25);

      // Headlights
      ctx.fillStyle = '#FFEB3B';
      ctx.fillRect(-20, -42, 8, 5);
      ctx.fillRect(12, -42, 8, 5);

      // Wheels
      ctx.fillStyle = '#212121';
      ctx.fillRect(-28, -25, 8, 15);
      ctx.fillRect(20, -25, 8, 15);
      ctx.fillRect(-28, 10, 8, 15);
      ctx.fillRect(20, 10, 8, 15);

      ctx.restore();
    };

    // Game loop
    let animationId: number;
    const gameLoop = () => {
      // Update physics
      const keys = keysPressed.current;
      const acceleration = 0.3;
      const maxSpeed = 15;
      const friction = 0.95;
      const turnSpeed = 0.05;

      // Acceleration
      if (keys.has('arrowup') || keys.has('w')) {
        state.speed = Math.min(state.speed + acceleration, maxSpeed);
      } else if (keys.has('arrowdown') || keys.has('s')) {
        state.speed = Math.max(state.speed - acceleration, -maxSpeed / 2);
      } else {
        state.speed *= friction;
        if (Math.abs(state.speed) < 0.1) state.speed = 0;
      }

      // Steering (only when moving)
      if (Math.abs(state.speed) > 0.5) {
        if (keys.has('arrowleft') || keys.has('a')) {
          state.carAngle -= turnSpeed * (state.speed / maxSpeed);
          state.carX -= 2;
        }
        if (keys.has('arrowright') || keys.has('d')) {
          state.carAngle += turnSpeed * (state.speed / maxSpeed);
          state.carX += 2;
        }
      }

      // Keep car on screen
      const roadWidth = 400;
      const roadX = canvas.width / 2 - roadWidth / 2;
      state.carX = Math.max(roadX + 30, Math.min(state.carX, roadX + roadWidth - 30));

      // Straighten car when no turn keys pressed
      if (!keys.has('arrowleft') && !keys.has('a') && !keys.has('arrowright') && !keys.has('d')) {
        state.carAngle *= 0.9;
      }

      // Update road offset for animation
      state.roadOffset += state.speed;

      // Update distance
      state.distance += Math.abs(state.speed) * 0.1;
      setDistance(Math.floor(state.distance));
      setSpeed(Math.floor(Math.abs(state.speed) * 10));

      // Check if destination reached (500 meters)
      if (state.distance >= 500) {
        onDestinationReached();
        return;
      }

      // Draw everything
      drawSky(ctx);
      drawClouds(ctx);
      drawRoad(ctx);
      drawBuildings(ctx);
      drawTrees(ctx);
      drawCar(ctx);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [onDestinationReached]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* HUD */}
      <div className="absolute top-8 left-8 text-white">
        <motion.div
          className="bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.div
            className="text-6xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
            animate={{ scale: speed > 100 ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: speed > 100 ? Infinity : 0 }}
          >
            {speed} km/h
          </motion.div>
          <div className="text-2xl font-semibold mb-6">
            Distance: {distance}m / 500m
          </div>
          <div className="w-64 h-3 bg-white/20 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${(distance / 500) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-4 text-sm opacity-75 space-y-1">
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

      {/* Speed particles effect */}
      {speed > 80 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 bg-gradient-to-b from-white/60 to-transparent"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${20 + Math.random() * 40}px`,
                height: `${30 + Math.random() * 60}px`,
                filter: 'blur(1px)'
              }}
              animate={{
                y: ['0vh', '110vh'],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 0.4 + Math.random() * 0.4,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 0.5
              }}
            />
          ))}
        </div>
      )}

      {/* Engine glow effect when accelerating */}
      {speed > 50 && (
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}
