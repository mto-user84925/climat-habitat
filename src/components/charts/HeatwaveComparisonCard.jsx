import React from 'react';
import { Flame, Moon, AlertTriangle } from 'lucide-react';

export default function HeatwaveComparisonCard({ caniculeData, tropicalData, horizonLabel }) {
  const canRef = caniculeData?.ref || 0;
  const canFut = caniculeData?.future || 0;
  const canFactor = canRef > 0 ? (canFut / canRef).toFixed(1) : canFut;

  const tropRef = tropicalData?.ref || 0;
  const tropFut = tropicalData?.future || 0;
  const tropFactor = tropRef > 0 ? (tropFut / tropRef).toFixed(1) : tropFut;

  const maxVal = Math.max(canFut, tropFut, 25);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
            <Flame className="w-4 h-4 text-red-600" />
            <span>Surchauffe Estivale Extrême</span>
          </div>
          <span className="text-[10px] font-extrabold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">
            Impact Direct Toiture & Combles
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">
          Jours Caniculaires & Nuits Chaudes
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Nombre de jours et nuits critiques par an enregistrés sur votre commune
        </p>

        {/* 1. Jours très chauds > 35°C */}
        <div className="mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500" />
              <span>Jours à plus de 35°C (Canicule)</span>
            </span>
            <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
              x{canFactor} d'ici {horizonLabel}
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Barre Futur */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-700 w-16">Futur :</span>
              <div className="flex-1 bg-slate-200 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(12, Math.min(100, (canFut / maxVal) * 100))}%` }}
                >
                  <span className="text-[9px] font-extrabold text-white">{canFut} j</span>
                </div>
              </div>
            </div>
            {/* Barre Référence */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-slate-500 w-16">Référence :</span>
              <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-400 h-full rounded-full"
                  style={{ width: `${Math.max(5, Math.min(100, (canRef / maxVal) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">{canRef} j</span>
            </div>
          </div>
        </div>

        {/* 2. Nuits tropicales > 20°C */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Nuits Tropicales (Temp. &gt; 20°C)</span>
            </span>
            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              x{tropFactor} d'ici {horizonLabel}
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Barre Futur */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-700 w-16">Futur :</span>
              <div className="flex-1 bg-slate-200 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(12, Math.min(100, (tropFut / maxVal) * 100))}%` }}
                >
                  <span className="text-[9px] font-extrabold text-white">{tropFut} n</span>
                </div>
              </div>
            </div>
            {/* Barre Référence */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-slate-500 w-16">Référence :</span>
              <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-400 h-full rounded-full"
                  style={{ width: `${Math.max(5, Math.min(100, (tropRef / maxVal) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">{tropRef} n</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-amber-800 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-snug">
          L'absence de fraîcheur nocturne empêche le logement de ventiler passivement. L'isolation thermique par déphasage devient prioritaire.
        </p>
      </div>
    </div>
  );
}
