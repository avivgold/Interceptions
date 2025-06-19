import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Zap, Target, Radar, Bomb, DollarSign } from 'lucide-react';

const upgradeData = {
  interceptor_speed: {
    name: 'Interceptor Speed',
    icon: Zap,
    description: 'Faster missile tracking and movement',
    baseCost: 500,
    maxLevel: 5,
    color: 'text-blue-400'
  },
  reload_speed: {
    name: 'Reload Speed',
    icon: Target,
    description: 'Reduced cooldown between launches',
    baseCost: 750,
    maxLevel: 5,
    color: 'text-green-400'
  },
  targeting_range: {
    name: 'Targeting Range',
    icon: Radar,
    description: 'Increased homing detection range',
    baseCost: 600,
    maxLevel: 4,
    color: 'text-purple-400'
  },
  explosion_radius: {
    name: 'Blast Radius',
    icon: Bomb,
    description: 'Larger explosion damage area',
    baseCost: 400,
    maxLevel: 4,
    color: 'text-orange-400'
  },
  money_multiplier: {
    name: 'Resource Efficiency',
    icon: DollarSign,
    description: 'Earn more money per interception',
    baseCost: 1000,
    maxLevel: 3,
    color: 'text-yellow-400'
  }
};

export default function UpgradeShop({ isOpen, onClose, money, upgrades, onUpgrade }) {
  if (!isOpen) return null;

  const calculateCost = (upgradeType, currentLevel) => {
    const base = upgradeData[upgradeType].baseCost;
    return Math.floor(base * Math.pow(1.5, currentLevel - 1));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl tactical-panel border-yellow-500/50 max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-yellow-400">UPGRADE COMMAND CENTER</CardTitle>
            <p className="text-yellow-300/70">Available Budget: ${money}</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(upgradeData).map(([key, upgrade]) => {
              const Icon = upgrade.icon;
              const currentLevel = upgrades[key];
              const isMaxLevel = currentLevel >= upgrade.maxLevel;
              const cost = calculateCost(key, currentLevel);
              const canAfford = money >= cost;

              return (
                <div key={key} className="tactical-panel rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${upgrade.color}`} />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{upgrade.name}</h3>
                        <p className="text-sm text-gray-400">{upgrade.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      LVL {currentLevel}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      {isMaxLevel ? (
                        <span className="text-green-400 font-semibold">MAX LEVEL</span>
                      ) : (
                        <span>Next: <span className="text-yellow-400">${cost}</span></span>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => onUpgrade(key, cost)}
                      disabled={isMaxLevel || !canAfford}
                      size="sm"
                      className={
                        isMaxLevel 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : canAfford 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-600/50 text-red-300 cursor-not-allowed'
                      }
                    >
                      {isMaxLevel ? 'MAXED' : canAfford ? 'UPGRADE' : 'INSUFFICIENT'}
                    </Button>
                  </div>
                  
                  {/* Level progress bar */}
                  <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentLevel / upgrade.maxLevel) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              💡 Tip: Upgrades are permanent for this game session. Choose wisely!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
