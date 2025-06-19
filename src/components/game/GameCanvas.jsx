import React, { useRef, useEffect, useState, useCallback } from 'react';

export default function GameCanvas({ gameState, onMissileClick, onGameOver, isGameActive, selectedSystem, cooldowns, onLaunchInterceptor, upgrades, startTime }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Game object storage
  const missiles = useRef([]);
  const interceptors = useRef([]);
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
      if (!interceptor.targetMissile || interceptor.targetMissile.isIntercepted) {
        let closestMissile = null;
        let closestDistance = Infinity;
        const reTargetRange = 400;
        const requiredMissileType = defenseSystemMapping[interceptor.systemType];

        missiles.current.forEach(missile => {
          if (missile.isIntercepted || missile.type !== requiredMissileType) return;
          const distance = Math.sqrt(Math.pow(missile.x - interceptor.x, 2) + Math.pow(missile.y - interceptor.y, 2));
          if (distance < reTargetRange && distance < closestDistance) {
            closestDistance = distance;
            closestMissile = missile;
          }
        });
        interceptor.targetMissile = closestMissile;
      }

      if (!interceptor.targetMissile) {
        interceptor.y -= 8;
        ctx.fillStyle = '#cccccc';
        ctx.beginPath();
        ctx.arc(interceptor.x, interceptor.y, 3, 0, Math.PI * 2);
        ctx.fill();
        return interceptor.y > 0;
      }

      interceptor.isHoming = true;
      const targetX = interceptor.targetMissile.x;
      const targetY = interceptor.targetMissile.y;

      const dx = targetX - interceptor.x;
      const dy = targetY - interceptor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 20) {
        const baseRadius = interceptor.isHoming ? 60 : 40;
        const effectiveExplosionRadiusLevel = (upgrades && upgrades.explosion_radius) ? upgrades.explosion_radius : 1;
        const enhancedRadius = baseRadius * (1 + (effectiveExplosionRadiusLevel - 1) * 0.3);

        explosions.current.push({
          x: interceptor.x,
          y: interceptor.y,
          size: 0,
          maxSize: enhancedRadius,
          life: interceptor.isHoming ? 50 : 30,
          color: interceptor.isHoming ? 'cyan' : 'blue'
        });

        const collisionRadius = enhancedRadius * 0.8;
        missiles.current.forEach(missile => {
          if (missile.isIntercepted) return;
          const missileDist = Math.sqrt(
            Math.pow(missile.x - interceptor.x, 2) +
            Math.pow(missile.y - interceptor.y, 2)
          );
          if (missileDist < collisionRadius) {
            onMissileClick(missile, interceptor.systemType);
          }
        });
        return false;
      }

      const baseSpeed = interceptor.isHoming ? 8 : 6;
      const effectiveInterceptorSpeedLevel = (upgrades && upgrades.interceptor_speed) ? upgrades.interceptor_speed : 1;
      const enhancedSpeed = baseSpeed * (1 + (effectiveInterceptorSpeedLevel - 1) * 0.4);
      interceptor.x += (dx / distance) * enhancedSpeed;
      interceptor.y += (dy / distance) * enhancedSpeed;

      if (interceptor.isHoming) {
        const gradient = ctx.createRadialGradient(interceptor.x, interceptor.y, 0, interceptor.x, interceptor.y, 12);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.3, '#0088ff');
        gradient.addColorStop(0.7, '#004499');
        gradient.addColorStop(1, 'rgba(0, 136, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(interceptor.x, interceptor.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(interceptor.x, interceptor.y, 4, 0, Math.PI * 2);
        ctx.fill();

        if (interceptor.targetMissile && !interceptor.targetMissile.isIntercepted) {
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(interceptor.x, interceptor.y);
          ctx.lineTo(interceptor.targetMissile.x, interceptor.targetMissile.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        const gradient = ctx.createRadialGradient(interceptor.x, interceptor.y, 0, interceptor.x, interceptor.y, 8);
        gradient.addColorStop(0, '#88aaff');
        gradient.addColorStop(0.5, '#4466bb');
        gradient.addColorStop(1, 'rgba(68, 102, 187, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(interceptor.x, interceptor.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#cccccc';
        ctx.beginPath();
        ctx.arc(interceptor.x, interceptor.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      return true;
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

  const handleCanvasClick = useCallback((event) => {
    if (!isGameActive) return;
    if (cooldowns[selectedSystem] > 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let bestTarget = null;
    let minDistance = 150;
    const requiredMissileType = defenseSystemMapping[selectedSystem];

    missiles.current.forEach(missile => {
      if (missile.isIntercepted || missile.type !== requiredMissileType) {
        return;
      }

      const distanceToClick = Math.sqrt(Math.pow(missile.x - clickX, 2) + Math.pow(missile.y - clickY, 2));

      if (distanceToClick < minDistance) {
        minDistance = distanceToClick;
        bestTarget = missile;
      }
    });

    if (bestTarget) {
      onLaunchInterceptor(selectedSystem);

      const launchPositions = [
        { x: canvasSize.width * 0.15, y: canvasSize.height * 0.7 },
        { x: canvasSize.width * 0.35, y: canvasSize.height * 0.65 },
        { x: canvasSize.width * 0.5, y: canvasSize.height * 0.6 },
        { x: canvasSize.width * 0.65, y: canvasSize.height * 0.65 },
        { x: canvasSize.width * 0.85, y: canvasSize.height * 0.7 }
      ];
      const launchPos = launchPositions[Math.floor(Math.random() * launchPositions.length)];

      interceptors.current.push({
        id: Date.now() + Math.random(),
        x: launchPos.x,
        y: launchPos.y,
        targetMissile: bestTarget,
        isHoming: true,
        systemType: selectedSystem
      });
    }
  }, [isGameActive, canvasSize, selectedSystem, cooldowns, onLaunchInterceptor]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      onClick={handleCanvasClick}
      className="border border-green-500/30 rounded-lg cursor-crosshair bg-black w-full h-full"
    />
  );
}
