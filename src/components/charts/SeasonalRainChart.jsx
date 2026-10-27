import React from 'react';
import { CloudRain, Droplets, AlertTriangle } from 'lucide-react';

export default function SeasonalRainChart({ g3Data = [], extremeRain = null, horizonLabel = '2050' }) {
  const seasonsOrder = ['hiver', 'printemps', 'été', 'automne'];
  const seasonLabels = {
    hiver: { name: 'Hiver', icon: '❄️', color: '#3b82f6' },
    printemps: { name: 'Printemps', icon: '🌱', color: '#10b981' },
    été: { name: 'Été', icon: '☀️', color: '#f59e0b' },
    automne: { name: 'Automne', icon: '🍂', color: '#8b5cf6' }
  };

  const seasons = seasonsOrder.map(s => {
    const item = (g3Data || []).find(d => d.label === s);
    const ref = item ? Math.round(item.ref) : 100;
    const future = item ? Math.round(item.mean) : 100;
    const diff = future - ref;
    const diffPct = ref > 0 ? Math.round((diff / ref) * 100) : 0;
    return {
      key: s,
      ...seasonLabels[s],
      ref,
      future,
      diff,
      diffPct
    };
  });

  const maxVal = Math.max(...seasons.map(s => Math.max(s.ref, s.future)), 180);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <CloudRain className="w-4 h-4" />
            <span>Cycle Pluviométrique Saisonnier</span>
          </div>
          <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
            Cumuls en mm
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">
          Précipitations par saison ({horizonLabel})
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Comparaison des cumuls de pluie entre le climat historique et l'horizon simulé
        </p>

        {/* 4 BARS GRID */}
        <div className="space-y-4">
          {seasons.map((s) => {
            const refWidth = Math.min(100, Math.max(10, (s.ref / maxVal) * 100));
            const futureWidth = Math.min(100, Math.max(10, (s.future / maxVal) * 100));
            const isDrop = s.diff < 0;

            return (
              <div key={s.key} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span>{s.icon}</span>
                    <span>{s.name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-normal">Réf : {s.ref} mm</span>
                    <span className="font-mono font-bold text-slate-900">➔ {s.future} mm</span>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      isDrop ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {s.diff > 0 ? `+${s.diff}` : s.diff} mm ({s.diffPct > 0 ? `+${s.diffPct}` : s.diffPct}%)
                    </span>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-slate-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${refWidth}%` }}
                      title={`Référence: ${s.ref} mm`}
                    />
                  </div>
                  <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${futureWidth}%`,
                        backgroundColor: s.color
                      }}
                      title={`Horizon: ${s.future} mm`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extreme Rain Footer Indicator */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Sécheresse plus marquée l'été avec pluies orageuses intenses concentrées.</span>
        </div>
        {extremeRain && (
          <span className="font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl whitespace-nowrap">
            Pluies extrêmes &gt; 20mm : {extremeRain.futureTotal} j/an
          </span>
        )}
      </div>

    </div>
  );
}
