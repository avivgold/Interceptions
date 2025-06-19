import React from 'react';
import { Shield, Zap, Target } from 'lucide-react';

const defenseSystems = {
  iron_dome: { 
    name: 'Iron Dome', 
    icon: Shield, 
    cooldown: 1500, 
    description: 'vs Katyusha Rockets', 
    key: '1',
    color: 'text-yellow-400',
    effectiveness: 'Fast, short-range interception'
  },
  davids_sling: { 
    name: "David's Sling", 
    icon: Zap, 
    cooldown: 3000, 
    description: 'vs Fateh Missiles', 
    key: '2',
    color: 'text-orange-400',
    effectiveness: 'Medium-range tactical defense'
  },
  arrow: { 
    name: 'Arrow/Hetz', 
    icon: Target, 
    cooldown: 5000, 
    description: 'vs Shahab Ballistic', 
    key: '3',
    color: 'text-red-400',
    effectiveness: 'Long-range ballistic interception'
  }
};

export default function DefenseSelector({ selectedSystem, onSystemSelect, cooldowns, upgrades }) {
  React.useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === '1') onSystemSelect('iron_dome');
      if (event.key === '2') onSystemSelect('davids_sling');
      if (event.key === '3') onSystemSelect('arrow');
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSystemSelect]);

  return (
    <div className="mt-4 flex justify-center">
      <div className="tactical-panel rounded-xl p-4 backdrop-blur-md">
        <div className="text-center mb-3">
          <p className="text-green-400 text-sm font-semibold">DEFENSE SYSTEMS</p>
          <p className="text-green-300/70 text-xs">
            Speed Lvl {upgrades.interceptor_speed} | Reload Lvl {upgrades.reload_speed}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {Object.entries(defenseSystems).map(([key, system]) => {
            const Icon = system.icon;
            const isOnCooldown = cooldowns[key] > 0;
            const isSelected = selectedSystem === key;
            
            return (
              <button 
                key={key} 
                onClick={() => onSystemSelect(key)} 
                disabled={isOnCooldown}
                className={`relative flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 min-w-[140px] ${
                  isSelected 
                    ? 'border-green-400 bg-green-500/30 shadow-lg shadow-green-500/20' 
                    : isOnCooldown 
                      ? 'border-red-500/50 bg-red-500/20 opacity-60' 
                      : 'border-gray-600 bg-gray-800/80 hover:border-green-500/70'
                }`}
              >
                <Icon className={`w-6 h-6 ${system.color}`} />
                <div className="text-center">
                  <div className="font-semibold text-xs text-white">{system.name}</div>
                  <div className="text-xs opacity-80 text-gray-300">{system.description}</div>
                  <div className="text-xs opacity-60 text-gray-400 mt-1">{system.effectiveness}</div>
                </div>
                
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center text-xs font-bold text-green-400">
                  {system.key}
                </div>
                
                {isOnCooldown && (
                  <div className="absolute inset-0 bg-red-900/50 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-red-500/50 transition-all duration-100" 
                      style={{width: `${(cooldowns[key] / system.cooldown) * 100}%`}}
                    ></div>
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
