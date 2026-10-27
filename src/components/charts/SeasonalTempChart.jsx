import React from 'react';
import { Thermometer, TrendingUp } from 'lucide-react';

export default function SeasonalTempChart({ g1Data, horizonLabel }) {
  const seasons = [
    { key: 'hiver', label: 'Hiver', icon: '❄️' },
    { key: 'printemps', label: 'Printemps', icon: '🌱' },
    { key: 'été', label: 'Été', icon: '☀️' },
    { key: 'automne', label: 'Automne', icon: '🍂' }
  ];

  const maxTemp = 30; // Max scale in °C

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <Thermometer className="w-4 h-4" />
            <span>Thermique Saisonnier Météo-France</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Températures moyennes par saison
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparaison entre le climat de référence (1976-2005) et l'horizon {horizonLabel}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-fit">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-600">Référence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4f35d2]" />
            <span className="text-indigo-900 font-bold">Futur</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="w-full">
        <svg viewBox="0 0 460 210" className="w-full h-auto overflow-visible">
          {/* Lignes repères horizontales */}
          {[0, 10, 20, 25].map((temp) => {
            const y = 165 - (temp / maxTemp) * 140;
            return (
              <g key={temp}>
                <line x1="38" y1={y} x2="445" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <text x="30" y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="600">
                  {temp}°C
                </text>
              </g>
            );
          })}

          {/* Barres pour les 4 saisons */}
          {seasons.map((s, idx) => {
            const item = (g1Data || []).find(d => d.label === s.key) || { ref: 0, mean: 0 };
            const refH = Math.max(8, (item.ref / maxTemp) * 140);
            const futH = Math.max(8, (item.mean / maxTemp) * 140);
            const diff = Math.round((item.mean - item.ref) * 10) / 10;
            const groupX = 65 + idx * 95;

            return (
              <g key={s.key}>
                {/* Barre Référence */}
                <rect
                  x={groupX}
                  y={165 - refH}
                  width="22"
                  height={refH}
                  rx="6"
                  fill="#cbd5e1"
                  className="hover:fill-slate-400 transition-colors"
                />
                <text x={groupX + 11} y={158 - refH} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
                  {item.ref ? item.ref.toFixed(1) : 0}°
                </text>

                {/* Barre Horizon Futur */}
                <rect
                  x={groupX + 28}
                  y={165 - futH}
                  width="24"
                  height={futH}
                  rx="6"
                  fill="url(#gradPurple)"
                  className="hover:brightness-110 transition-all shadow-md"
                />
                <text x={groupX + 40} y={158 - futH} textAnchor="middle" fontSize="11" fill="#4f35d2" fontWeight="800">
                  {item.mean ? item.mean.toFixed(1) : 0}°
                </text>

                {/* Label Saison sous l'axe */}
                <text x={groupX + 25} y="184" textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight="700">
                  {s.label}
                </text>

                {/* Badge Delta */}
                <rect x={groupX + 9} y="190" width="32" height="15" rx="7" fill={diff >= 2.5 ? '#fee2e2' : '#fef3c7'} />
                <text x={groupX + 25} y="201" textAnchor="middle" fontSize="9" fill={diff >= 2.5 ? '#b91c1c' : '#b45309'} fontWeight="800">
                  +{diff}°C
                </text>
              </g>
            );
          })}

          {/* Dégradé pour la barre future */}
          <defs>
            <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6347f3" />
              <stop offset="100%" stopColor="#4f35d2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
          <TrendingUp className="w-3.5 h-3.5 text-red-500" />
          <span>Réchauffement accentué en période estivale</span>
        </span>
        <span className="font-mono text-[11px] text-slate-400">Source: Météo-France ALADIN</span>
      </div>
    </div>
  );
}
