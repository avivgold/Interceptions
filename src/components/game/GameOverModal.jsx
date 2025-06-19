import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GameOverModal({ isOpen, gameStats, onRestart, onSaveScore }) {
  const [playerName, setPlayerName] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md tactical-panel border-red-500/50">
        <CardHeader className="text-center"><CardTitle className="text-2xl font-bold text-red-400">MISSION FAILED</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center"><p className="text-lg text-white">Your Score: {gameStats.score}</p></div>
          <div className="space-y-3">
            <Input placeholder="Enter call sign..." value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="bg-gray-800/50 border-gray-600 text-green-400" />
            <Button onClick={() => onSaveScore(playerName)} disabled={!playerName.trim()} className="w-full bg-green-600 hover:bg-green-700">Save Score</Button>
          </div>
          <Button onClick={onRestart} className="w-full bg-blue-600 hover:bg-blue-700">Restart Mission</Button>
        </CardContent>
      </Card>
    </div>
  );
}
