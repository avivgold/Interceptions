import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameScore } from '@/entities/GameScore';
import { Button } from '@/components/ui/button';
import { Play, Pause, Zap } from 'lucide-react';
import GameCanvas from '../components/game/GameCanvas';
import DefenseSelector from '../components/game/DefenseSelector';
import GameOverModal from '../components/game/GameOverModal';

export default function Game() {
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false); // New state for pause
  const [gameState, setGameState] = useState({ 
    score: 0, 
    intercepted: 0, 
    missed: 0, 
    wave: 1, 
    duration: 0,
    money: 0 
  });
  const [selectedSystem, setSelectedSystem] = useState('iron_dome');
  const [selectedCity, setSelectedCity] = useState('tel_aviv');
  const [cooldowns, setCooldowns] = useState({ iron_dome: 0, davids_sling: 0, arrow: 0 });
  const [showGameOver, setShowGameOver] = useState(false);
  const [laserCount, setLaserCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameId, setGameId] = useState(1);
  const [bombs, setBombs] = useState(1);
  const [bombSignal, setBombSignal] = useState(0);

  // Upgrade system
  const [upgrades, setUpgrades] = useState({
    interceptor_speed: 1, // Level 1 = base speed
    reload_speed: 1, // Level 1 = base cooldown
    targeting_range: 1, // Level 1 = base range
    explosion_radius: 1, // Level 1 = base radius
    money_multiplier: 1 // Level 1 = base earnings
  });

  const defenseSystemMapping = {
    iron_dome: 'katyusha',
    davids_sling: 'fateh',
    arrow: 'shahab'
  };

  useEffect(() => {
    let timer;
    if (isGameActive && startTime) {
      timer = setInterval(() => {
        setGameState(prev => ({ ...prev, duration: (Date.now() - startTime) / 1000 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameActive, startTime]);

  // Enhanced cooldown system with upgrades
  useEffect(() => {
    const cooldownTimer = setInterval(() => {
      const reductionMultiplier = 1 + (upgrades.reload_speed - 1) * 0.3; // 30% faster per level
      const reductionAmount = 100 * reductionMultiplier;
      
      setCooldowns(prev => ({
        iron_dome: Math.max(0, prev.iron_dome - reductionAmount),
        davids_sling: Math.max(0, prev.davids_sling - reductionAmount),
        arrow: Math.max(0, prev.arrow - reductionAmount)
      }));
    }, 100);
    return () => clearInterval(cooldownTimer);
  }, [upgrades.reload_speed]);

  const startGame = () => {
    setIsGameActive(true);
    setIsGamePaused(false);
    setStartTime(Date.now());
    setGameState({ score: 0, intercepted: 0, missed: 0, wave: 1, duration: 0, money: 0 });
    setShowGameOver(false);

    setGameId(prevId => prevId + 1);
    setBombs(1);
    setBombSignal(0);
    setLaserCount(0);
  };

  const pauseGame = () => {
    setIsGamePaused(true);
    setIsGameActive(false);
  };

  const resumeGame = () => {
    setIsGamePaused(false);
    setIsGameActive(true);
    // Adjust start time to account for pause duration
    if (startTime) {
      const pausedDuration = gameState.duration;
      setStartTime(Date.now() - (pausedDuration * 1000));
    }
  };

  const togglePause = () => {
    if (isGameActive) {
      pauseGame();
    } else if (isGamePaused) {
      resumeGame();
    } else {
      startGame();
    }
  };

  const buyLaser = () => {
    const cost = 3000;
    if (gameState.money >= cost && isGameActive) {
      setGameState(prev => ({ ...prev, money: prev.money - cost }));
      setLaserCount(prev => Math.min(3, prev + 1));
    }
  };

  const handleLaserExpired = useCallback(() => {
    setLaserCount(prev => Math.max(0, prev - 1));
  }, []);

  const handleLaunchInterceptor = useCallback(() => {
    if (cooldowns[selectedSystem] > 0) return;
    
    const baseCooldownTimes = { iron_dome: 1000, davids_sling: 2500, arrow: 4000 };
    setCooldowns(prev => ({ ...prev, [selectedSystem]: baseCooldownTimes[selectedSystem] }));
  }, [selectedSystem, cooldowns]);

  const handleMissileClick = useCallback((missile, hittingSystemType) => {
    if (missile.isIntercepted) return;

    const isCorrectSystem = defenseSystemMapping[hittingSystemType] === missile.type;
    
    if (isCorrectSystem) {
      missile.health -= 2;
    } else {
      missile.health -= 1;
    }

    if (missile.health <= 0) {
      missile.isIntercepted = true;
      
      const basePoints = { katyusha: 100, fateh: 250, shahab: 500 };
      const baseMoney = { katyusha: 50, fateh: 100, shahab: 200 };
      
      const multiplier = isCorrectSystem ? 2 : 0.5;
      const scoreBonus = basePoints[missile.type] * multiplier;
      const moneyEarned = Math.round(baseMoney[missile.type] * multiplier * upgrades.money_multiplier);
      
      setGameState(prev => {
        const newIntercepted = prev.intercepted + 1;
        const newWave = (newIntercepted > 0 && newIntercepted % 8 === 0) ? prev.wave + 1 : prev.wave;

        return {
          ...prev,
          score: prev.score + Math.round(scoreBonus),
          intercepted: newIntercepted,
          wave: newWave,
          money: prev.money + moneyEarned
        };
      });
    }
  }, [defenseSystemMapping, upgrades.money_multiplier]);

  const handleGameOver = useCallback(() => {
    setIsGameActive(false);
    setIsGamePaused(false); // Ensure game is not in a 'paused' state after game over
    setShowGameOver(true);
    setGameState(prev => ({ ...prev, missed: prev.missed + 1 }));
  }, []);

  const handleSaveScore = async (playerName) => {
    await GameScore.create({
      player_name: playerName,
      score: gameState.score,
      missiles_intercepted: gameState.intercepted,
      missiles_missed: gameState.missed,
      game_duration: gameState.duration,
      difficulty_level: 'medium',
      money_earned: gameState.money,
      final_wave: gameState.wave
    });
    setShowGameOver(false);
  };


  const handlePowerUpCollected = (type) => {
    if (type === 'money') {
      setGameState(prev => ({ ...prev, money: prev.money + 200 }));
    } else if (type === 'bomb') {
      setBombs(prev => prev + 1);
    } else if (type === 'shield') {
      // handled inside GameCanvas
    } else if (type === 'reload') {
      setCooldowns({ iron_dome: 0, davids_sling: 0, arrow: 0 });
    } else if (type === 'laser') {
      setLaserCount(prev => Math.min(3, prev + 1));
    }
  };

  const prevWaveRef = useRef(1);
  useEffect(() => {
    if (gameState.wave > prevWaveRef.current) {
      if (gameState.wave === 5) {
        setUpgrades(prev => ({
          ...prev,
          interceptor_speed: prev.interceptor_speed + 1,
          explosion_radius: prev.explosion_radius + 1
        }));
      } else if (gameState.wave === 8) {
        setUpgrades(prev => ({
          ...prev,
          reload_speed: prev.reload_speed + 1
        }));
      }
      prevWaveRef.current = gameState.wave;
    }
  }, [gameState.wave]);

  const useBomb = useCallback(() => {
    if (bombs > 0 && isGameActive) {
      setBombs(prev => prev - 1);
      setBombSignal(Date.now());
    }
  }, [bombs, isGameActive]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        useBomb();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [useBomb]);

  return (
    <div className="h-[calc(100vh-80px)] p-4 flex flex-col relative">
      <div className="tactical-panel rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="flex gap-x-6 items-center font-mono">
          <span className="text-green-400">SCORE: {gameState.score}</span>
          <span className="text-blue-400">INTERCEPTED: {gameState.intercepted}</span>
          <span className="text-orange-400">WAVE: {gameState.wave}</span>
          <span className="text-yellow-400">💰 ${gameState.money}</span>
          <span className="text-gray-400">MISSED: {gameState.missed}</span>
          <span className="text-purple-400">BOMBS: {bombs}</span>
          {isGamePaused && <span className="text-yellow-400 animate-pulse">⏸ PAUSED</span>}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={isGameActive}
            className="ml-4 bg-gray-800 border border-green-500 text-green-300 text-sm rounded px-2 py-1"
          >
            <option value="tel_aviv">Tel Aviv</option>
            <option value="jerusalem">Jerusalem</option>
            <option value="haifa">Haifa</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={buyLaser}
            disabled={!isGameActive || gameState.money < 3000 || laserCount >= 3}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Zap className="mr-2 h-4 w-4"/>
            BUY LASER ($3000)
          </Button>
          <div className="text-purple-300 text-sm">LASERS: {laserCount}</div>
          <div className="text-green-300 text-sm">
            Selected: <span className="text-green-400 font-semibold">
              {selectedSystem === 'iron_dome' ? 'Iron Dome' :
               selectedSystem === 'davids_sling' ? "David's Sling" : 'Arrow'}
            </span>
          </div>
          <Button
            onClick={useBomb}
            disabled={bombs <= 0 || !isGameActive}
            className="bg-red-600 hover:bg-red-700"
          >
            BOMB
          </Button>
          <Button 
            onClick={togglePause}
            className={
              isGameActive 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : isGamePaused 
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-green-600 hover:bg-green-700'
            }
          >
            {isGameActive 
              ? <><Pause className="mr-2 h-4 w-4"/>PAUSE</> 
              : isGamePaused 
                ? <><Play className="mr-2 h-4 w-4"/>RESUME</>
                : <><Play className="mr-2 h-4 w-4"/>START</>
            }
          </Button>
        </div>
      </div>
      
      <div
        className="tactical-panel rounded-lg relative mx-auto w-full"
        style={{ height: '70vh' }}
      >
        <GameCanvas
          key={gameId}
          gameState={gameState}
          onMissileClick={handleMissileClick} 
          onGameOver={handleGameOver} 
          isGameActive={isGameActive}
          selectedCity={selectedCity}
          selectedSystem={selectedSystem}
          cooldowns={cooldowns}
          onLaunchInterceptor={handleLaunchInterceptor}
          upgrades={upgrades}
          startTime={startTime}
          bombSignal={bombSignal}
          onPowerUpCollected={handlePowerUpCollected}
          laserCount={laserCount}
          onLaserExpired={handleLaserExpired}
        />
      </div>
      
      <DefenseSelector 
        selectedSystem={selectedSystem} 
        onSystemSelect={setSelectedSystem} 
        cooldowns={cooldowns}
        upgrades={upgrades}
      />
      
      
      <GameOverModal 
        isOpen={showGameOver} 
        gameStats={gameState} 
        onRestart={startGame} 
        onSaveScore={handleSaveScore} 
      />
    </div>
  );
}
