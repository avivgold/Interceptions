import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Trophy, Shield, Target, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="tactical-panel rounded-lg p-8 mb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="w-20 h-20 text-green-400 pulse-glow" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-green-400 glow-text mb-4">INTERCEPTOR</h1>
          <p className="text-xl text-green-300/80 mb-2 tracking-wide">MISSILE DEFENSE SYSTEM</p>
          <p className="text-green-300/60 mb-8 max-w-2xl mx-auto">Take command of Israel's layered defense systems and protect cities from incoming threats.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Game")}><Button size="lg" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"><Play className="w-5 h-5 mr-2" /> BEGIN MISSION</Button></Link>
            <Link to={createPageUrl("Leaderboard")}><Button size="lg" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10 w-full sm:w-auto"><Trophy className="w-5 h-5 mr-2" /> VIEW INTEL</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
