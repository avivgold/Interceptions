import React, { useState, useEffect } from 'react';
import { GameScore } from '@/entities/GameScore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        const allScores = await GameScore.list('-score', 10);
        setScores(allScores);
      } finally {
        setLoading(false);
      }
    };
    loadScores();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8"><Trophy className="w-16 h-16 text-green-400 mx-auto" /><h1 className="text-4xl font-bold text-green-400">Top Operators</h1></div>
        <Card className="tactical-panel">
          <CardHeader><CardTitle className="text-green-400">Leaderboard</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : (
              <div className="space-y-4">
                {scores.map((score, index) => (
                  <div key={score.id} className={`flex items-center justify-between p-4 rounded-lg ${index < 3 ? 'bg-green-500/10' : 'bg-slate-700/50'}`}>
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-lg">#{index + 1}</div>
                      <div>
                        <div className="font-bold text-green-400">{score.player_name}</div>
                        <div className="text-sm text-gray-400">{score.missiles_intercepted} intercepted</div>
                      </div>
                    </div>
                    <div className="font-bold text-xl">{score.score}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
