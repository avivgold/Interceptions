import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, Trophy, Play, Home as HomeIcon } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      
      <header className="tactical-panel border-b border-green-500/30 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-green-400 pulse-glow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-400 glow-text">INTERCEPTOR</h1>
              <p className="text-xs text-green-300/70 tracking-widest">MISSILE DEFENSE</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-4">
            <Link to={createPageUrl("Home")} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${location.pathname === createPageUrl("Home") ? 'bg-green-500/20 text-green-400' : 'text-green-300 hover:bg-green-500/10'}`}><HomeIcon className="w-4 h-4" /> HOME</Link>
            <Link to={createPageUrl("Game")} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${location.pathname === createPageUrl("Game") ? 'bg-green-500/20 text-green-400' : 'text-green-300 hover:bg-green-500/10'}`}><Play className="w-4 h-4" /> GAME</Link>
            <Link to={createPageUrl("Leaderboard")} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${location.pathname === createPageUrl("Leaderboard") ? 'bg-green-500/20 text-green-400' : 'text-green-300 hover:bg-green-500/10'}`}><Trophy className="w-4 h-4" /> SCORES</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
