import React, { useRef, useEffect, useState, useCallback } from 'react';

export default function GameCanvas({ gameState, onMissileClick, onGameOver, isGameActive, selectedSystem, cooldowns, onLaunchInterceptor, upgrades, startTime }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Game object storage
  const missiles = useRef([]);
  const interceptors = useRef([]);
  const activeInterceptor = useRef(null);
  const keyState = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
  const explosions = useRef([]);
  const cities = useRef([
    { name: 'Tel Aviv', x: 0.2, y: 0.85, health: 100 },
    { name: 'Jerusalem', x: 0.4, y: 0.85, health: 100 },
    { name: 'Haifa', x: 0.6, y: 0.85, health: 100 },
    { name: 'Eilat', x: 0.8, y: 0.85, health: 100 }
  ]);

  // Enhanced missile types with progressive speed increases
  const getMissileSpeed = (baseSpeed, wave) => {
    return baseSpeed * (1 + (wave - 1) * 0.15); // 15% faster each wave
  };

  // Enhanced missile types with distinct visuals
  const missileTypes = {
    katyusha: {
      baseSpeed: 1.2,
      color: '#ffaa00',
      trailColor: '#ffcc44',
      size: 8,
      name: 'Katyusha',
      shape: 'rocket',
      health: 1,
      effectiveSystem: 'iron_dome'
    },
    fateh: {
      baseSpeed: 0.8,
      color: '#ff6600',
      trailColor: '#ff8844',
      size: 12,
      name: 'Fateh-110',
      shape: 'missile',
      health: 2,
      effectiveSystem: 'davids_sling'
    },
    shahab: {
      baseSpeed: 0.6,
      color: '#ff2222',
      trailColor: '#ff4444',
      size: 16,
      name: 'Shahab-3',
      shape: 'ballistic',
      health: 3,
      effectiveSystem: 'arrow'
    }
  };

  const defenseSystemMapping = {
    iron_dome: 'katyusha',
    davids_sling: 'fateh',
    arrow: 'shahab'
  };

  const launchInterceptor = useCallback(() => {
    if (!isGameActive) return;
    if (cooldowns[selectedSystem] > 0) return;

    const basePositions = {
      iron_dome: { x: canvasSize.width * 0.25, y: canvasSize.height * 0.9 },
      davids_sling: { x: canvasSize.width * 0.5, y: canvasSize.height * 0.9 },
      arrow: { x: canvasSize.width * 0.75, y: canvasSize.height * 0.9 }
    };
    const pos = basePositions[selectedSystem];
    const interceptor = {
      id: Date.now() + Math.random(),
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: -6,
      systemType: selectedSystem
    };
    interceptors.current.push(interceptor);
    activeInterceptor.current = interceptor;
    onLaunchInterceptor(selectedSystem);
  }, [isGameActive, cooldowns, selectedSystem, canvasSize, onLaunchInterceptor]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        keyState.current[e.code] = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        launchInterceptor();
      }
    };
    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        keyState.current[e.code] = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [launchInterceptor]);

  // Resize canvas
  useEffect(() => {
    const updateSize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        setCanvasSize({ width: Math.min(rect.width, 1200), height: Math.min(rect.height, 800) });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Enhanced spawn system with wave progression and grace period
  useEffect(() => {
    if (!isGameActive) return;

    const baseSpawnRate = 2500;
    const waveMultiplier = Math.max(0.3, 1 - (gameState.wave - 1) * 0.1);
    const spawnRate = Math.floor(baseSpawnRate * waveMultiplier);

    const spawnInterval = setInterval(() => {
      if (!startTime || (Date.now() - startTime) < 4000) {
        return;
      }

      const types = Object.keys(missileTypes);
      const type = types[Math.floor(Math.random() * types.length)];
      const targetCity = cities.current[Math.floor(Math.random() * cities.current.length)];

      missiles.current.push({
        id: Date.now() + Math.random(),
        type,
        x: Math.random() * canvasSize.width,
        y: -30,
        targetX: targetCity.x * canvasSize.width,
        targetY: targetCity.y * canvasSize.height,
        angle: 0,
        health: missileTypes[type].health,
        maxHealth: missileTypes[type].health,
        isIntercepted: false,
        trail: [],
        wobble: Math.random() * 0.3,
        speed: getMissileSpeed(missileTypes[type].baseSpeed, gameState.wave)
      });
    }, spawnRate);

    return () => clearInterval(spawnInterval);
  }, [isGameActive, gameState.wave, canvasSize, startTime]);

  // Main game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    drawBackground(ctx);
    drawCities(ctx);
    updateAndDrawMissiles(ctx);
    updateAndDrawInterceptors(ctx);
    updateAndDrawExplosions(ctx);

    if (isGameActive) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [canvasSize, isGameActive, onGameOver]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameLoop]);

  const drawBackground = (ctx) => {
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
    bgGradient.addColorStop(0, '#0a0a2e');
    bgGradient.addColorStop(0.7, '#16213e');
    bgGradient.addColorStop(1, '#1a365d');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 137) % canvasSize.width;
      const y = (i * 211) % (canvasSize.height * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawCities = (ctx) => {
    cities.current.forEach(city => {
      const cityX = city.x * canvasSize.width;
      const cityY = city.y * canvasSize.height;

      ctx.fillStyle = '#2d3748';
      for (let i = 0; i < 5; i++) {
        const buildingHeight = 30 + Math.random() * 40;
        ctx.fillRect(cityX - 30 + i * 12, cityY - buildingHeight, 10, buildingHeight);
      }

      ctx.fillStyle = '#ffd700';
      for (let i = 0; i < 8; i++) {
        if (Math.random() > 0.3) {
          ctx.fillRect(cityX - 28 + i * 7, cityY - 20 - Math.random() * 30, 2, 2);
        }
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(city.name, cityX, cityY + 20);
    });
  };

  const drawMissile = (ctx, missile) => {
    const { x, y, type, angle, health, maxHealth } = missile;
    const missileType = missileTypes[type];

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);

    drawMissileTrail(ctx, missile, missileType);

    switch (missileType.shape) {
      case 'rocket':
        drawRocketMissile(ctx, missileType);
        break;
      case 'missile':
        drawTacticalMissile(ctx, missileType);
        break;
      case 'ballistic':
        drawBallisticMissile(ctx, missileType);
        break;
    }

    ctx.restore();

    if (health < maxHealth) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fillRect(x - 15, y - 25, 30 * (health / maxHealth), 3);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(x - 15, y - 25, 30, 3);
    }
  };

  const drawMissileTrail = (ctx, missile, missileType) => {
    const trailLength = 20 + missileType.size;
    const trailGradient = ctx.createLinearGradient(0, 0, 0, trailLength);
    trailGradient.addColorStop(0, missileType.trailColor);
    trailGradient.addColorStop(0.5, missileType.color);
    trailGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

    ctx.fillStyle = trailGradient;
    ctx.beginPath();
    ctx.moveTo(-missileType.size/3, 0);
    ctx.lineTo(missileType.size/3, 0);
    ctx.lineTo(0, trailLength + Math.random() * 10);
    ctx.closePath();
    ctx.fill();
  };

  const drawRocketMissile = (ctx, missileType) => {
    ctx.fillStyle = missileType.color;
    ctx.beginPath();
    ctx.moveTo(0, -missileType.size);
    ctx.lineTo(-3, missileType.size/2);
    ctx.lineTo(3, missileType.size/2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#888888';
    ctx.fillRect(-4, missileType.size/2 - 2, 2, 6);
    ctx.fillRect(2, missileType.size/2 - 2, 2, 6);
  };

  const drawTacticalMissile = (ctx, missileType) => {
    ctx.fillStyle = missileType.color;
    ctx.beginPath();
    ctx.moveTo(0, -missileType.size);
    ctx.lineTo(-4, missileType.size/2);
    ctx.lineTo(4, missileType.size/2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#666666';
    ctx.fillRect(-3, -missileType.size/2, 6, 4);
    ctx.fillRect(-3, 0, 6, 4);

    ctx.fillStyle = '#999999';
    ctx.fillRect(-5, missileType.size/2 - 3, 2, 8);
    ctx.fillRect(3, missileType.size/2 - 3, 2, 8);
  };

  const drawBallisticMissile = (ctx, missileType) => {
    ctx.fillStyle = missileType.color;
    ctx.beginPath();
    ctx.moveTo(0, -missileType.size);
    ctx.lineTo(-5, missileType.size/2);
    ctx.lineTo(5, missileType.size/2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(0, -missileType.size/2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#444444';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-4, -missileType.size/2 + i * 6, 8, 2);
    }

    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(-6, missileType.size/2 - 4, 3, 10);
    ctx.fillRect(3, missileType.size/2 - 4, 3, 10);
  };

  const updateAndDrawMissiles = (ctx) => {
    missiles.current = missiles.current.filter(missile => {
      if (missile.isIntercepted) return false;

      const dx = missile.targetX - missile.x;
      const dy = missile.targetY - missile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < missile.speed) {
        onGameOver();
        explosions.current.push({
          x: missile.x,
          y: missile.y,
          size: 0,
          maxSize: 100,
          life: 80,
          color: 'orange'
        });
        return false;
      }

      missile.x += (dx / distance) * missile.speed + Math.sin(Date.now() * 0.01) * missile.wobble;
      missile.y += (dy / distance) * missile.speed;
      missile.angle = Math.atan2(dy, dx);

      drawMissile(ctx, missile);
      return true;
    });
  };

  const updateAndDrawInterceptors = (ctx) => {
    interceptors.current = interceptors.current.filter(interceptor => {
      if (activeInterceptor.current === interceptor) {
        let dx = 0;
        let dy = 0;
        if (keyState.current.ArrowLeft) dx -= 1;
        if (keyState.current.ArrowRight) dx += 1;
        if (keyState.current.ArrowUp) dy -= 1;
        if (keyState.current.ArrowDown) dy += 1;
        if (dx !== 0 || dy !== 0) {
          const speed = 6 * (1 + (upgrades?.interceptor_speed - 1) * 0.4);
          const len = Math.sqrt(dx * dx + dy * dy);
          interceptor.vx = (dx / len) * speed;
          interceptor.vy = (dy / len) * speed;
        }
      }

      interceptor.x += interceptor.vx;
      interceptor.y += interceptor.vy;

      for (const missile of missiles.current) {
        if (missile.isIntercepted) continue;
        const dist = Math.sqrt(
          Math.pow(missile.x - interceptor.x, 2) +
          Math.pow(missile.y - interceptor.y, 2)
        );
        if (dist < 20) {
          explosions.current.push({ x: interceptor.x, y: interceptor.y, size: 0, maxSize: 60, life: 40, color: 'cyan' });
          onMissileClick(missile, interceptor.systemType);
          return false;
        }
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(interceptor.x, interceptor.y, 4, 0, Math.PI * 2);
      ctx.fill();

      return (
        interceptor.x > -20 &&
        interceptor.x < canvasSize.width + 20 &&
        interceptor.y > -20 &&
        interceptor.y < canvasSize.height + 20
      );
    });
  };

  const updateAndDrawExplosions = (ctx) => {
    explosions.current = explosions.current.filter(exp => {
      exp.size += (exp.maxSize - exp.size) * 0.2;
      const alpha = Math.max(0, exp.life / 60);

      const colors = {
        orange: { r: 255, g: 165, b: 0 },
        cyan: { r: 0, g: 255, b: 255 },
        blue: { r: 0, g: 0, b: 255 }
      };
      const rgb = colors[exp.color] || { r: 255, g: 200, b: 0 };

      const gradient = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.size);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.8})`);
      gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.size, 0, Math.PI * 2);
      ctx.fill();

      exp.life--;
      return exp.life > 0;
    });
  };


  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className="border border-green-500/30 rounded-lg cursor-crosshair bg-black w-full h-full"
    />
  );
}
