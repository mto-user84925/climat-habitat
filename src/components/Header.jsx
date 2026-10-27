import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function Header({ onReset, currentStep }) {
  return (
    <header className="border-b border-white/10 bg-[#020b3b]/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div 
          onClick={onReset}
          className="flex items-center gap-4 cursor-pointer group"
          title="Retour à l'accueil"
        >
          <img 
            src="/logo_meteo_climat_pro.png" 
            alt="Météo-Climat Pro" 
            className="h-10 sm:h-12 w-auto object-contain filter drop-shadow hover:scale-105 transition-transform" 
          />
          <div className="border-l border-white/20 pl-4 hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-purple transition-colors">
                Climat<span className="text-brand-purple">Habitat</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-accent/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/20">
                Météo-Climat Pro
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Le diagnostic vulnérabilité & projections climatiques 2050 de votre logement
            </p>
          </div>
        </div>

        {/* Right side status / action */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>Expertise Météo-Climat Pro & Géorisques</span>
          </div>

          {currentStep > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-lg transition-colors border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Autre adresse</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
