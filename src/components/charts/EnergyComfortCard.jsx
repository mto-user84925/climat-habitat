import React from 'react';
import { Zap, Sun, ShieldAlert, Sparkles, Flame, Snowflake, Clock } from 'lucide-react';

export default function EnergyComfortCard({ thermalDiscomfort = null, dryStreak = null, heatwaveStreak = null, horizonLabel = '2050' }) {
  const daysDiscomfortRef = thermalDiscomfort ? thermalDiscomfort.ref : 70;
  const daysDiscomfortFuture = thermalDiscomfort ? thermalDiscomfort.future : 95;
  const discomfortDiff = daysDiscomfortFuture - daysDiscomfortRef;

  const dryRef = dryStreak ? dryStreak.ref : 24;
  const dryFuture = dryStreak ? dryStreak.future : 30;
  const dryDiff = dryFuture - dryRef;

  const heatStreakDays = heatwaveStreak ? Math.round(heatwaveStreak.future * 10) / 10 : 3.5;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 flex flex-col justify-between">
      <div>
        
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600">
            <Zap className="w-4 h-4 text-purple-600" />
            <span>Impact Bâtiment & Confort Thermique</span>
          </div>
          <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
            Habitat & Énergie
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">
          Besoins de Rafraîchissement & Sécheresse ({horizonLabel})
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Impact direct sur la facture énergétique estivale et les tensions mécaniques du bâti
        </p>

        {/* 2 MAIN METRIC PANELS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          
          {/* 1. Stress thermique estival */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4 rounded-2xl border border-purple-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-purple-600" />
                  <span>Jours d'Inconfort Estival</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black text-purple-900">{daysDiscomfortFuture}</span>
                <span className="text-xs font-semibold text-purple-700">jours/an</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Période où le logement accumule la chaleur et nécessite protection solaire ou climatisation.
              </p>
            </div>
            
            <div className="mt-3 pt-2.5 border-t border-purple-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Climat de réf : {daysDiscomfortRef} j</span>
              <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                +{discomfortDiff} jours
              </span>
            </div>
          </div>

          {/* 2. Période consécutive sans pluie */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 rounded-2xl border border-amber-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>Durée Max Sans Pluie</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black text-amber-900">{dryFuture}</span>
                <span className="text-xs font-semibold text-amber-700">jours consécutifs</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Allongement des périodes sèches en été, facteur déclencheur du retrait des fondations argileuses.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Climat de réf : {dryRef} j</span>
              <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                +{dryDiff} jours secs
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Advice footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Durée continue max des canicules : <strong>{heatStreakDays} jours consécutifs</strong></span>
        </span>
        <span className="font-bold text-indigo-600">Fiches 8, 10 & 14 adaptées</span>
      </div>

    </div>
  );
}
