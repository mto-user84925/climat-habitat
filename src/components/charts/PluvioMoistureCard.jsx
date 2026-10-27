import React from 'react';
import { Droplets, CloudRain, ShieldCheck } from 'lucide-react';

export default function PluvioMoistureCard({ precipData, horizonLabel }) {
  const refTotal = precipData?.refTotal || 750;
  const futTotal = precipData?.futureTotal || 770;
  const diffTotal = futTotal - refTotal;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span>Régime Hydrique & Inondation</span>
          </div>
          <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
            Pluviométrie Annuelle
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">
          Pluies & Teneur en Eau des Sols
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Modélisation du cumul de pluie annuel et des contrastes saisonniers
        </p>

        {/* Dual Metric Box */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5">
            <span className="text-[11px] font-bold text-slate-600 block">Cumul Annuel Prévu</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-blue-600">{futTotal}</span>
              <span className="text-xs font-semibold text-slate-500">mm/an</span>
            </div>
            <span className="text-[10px] text-slate-500">
              Réf : {refTotal} mm ({diffTotal >= 0 ? `+${diffTotal}` : diffTotal} mm)
            </span>
          </div>

          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3.5">
            <span className="text-[11px] font-bold text-slate-600 block">Sols en Été (Argiles)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-600">-22%</span>
              <span className="text-xs font-semibold text-slate-500">humidité</span>
            </div>
            <span className="text-[10px] text-amber-700 font-semibold">
              Rétrécissement des argiles
            </span>
          </div>
        </div>

        {/* Dynamic Hydric Balance Meter */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 font-semibold">
            <span>Sécheresse Estivale</span>
            <span>Intensité Orageuse</span>
          </div>
          <div className="h-3 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-500 rounded-full" />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Assèchement du sol (RGA)</span>
            <span>Ruissellement soudain</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 text-slate-700">
          <CloudRain className="w-4 h-4 text-blue-500" />
          <span>Averses plus rares mais plus concentrées</span>
        </span>
        <span className="font-bold text-indigo-600">Fiches 1 & 8 adaptées</span>
      </div>
    </div>
  );
}
