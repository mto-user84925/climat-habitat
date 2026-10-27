import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  Thermometer, 
  Droplets, 
  Sun, 
  Wrench, 
  Building2, 
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { searchAddress } from '../services/api';

export default function HeroSearch({ onSelectAddress }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Debounced address search via BAN
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const results = await searchAddress(query);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setQuery(item.label);
    setIsOpen(false);
    onSelectAddress(item);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  return (
    <div className="relative overflow-hidden text-slate-100">
      
      {/* Background radial glows for depth */}
      <div className="absolute top-[-100px] left-1/4 w-[600px] h-[500px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[250px] right-[-100px] w-[500px] h-[450px] bg-purple-600/15 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-blue-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* HERO SECTION 2 COLONNES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* COLONNE GAUCHE (7 COLONNES) : Titre, Promesse & Moteur de Recherche */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tag / Badge discret */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Baromètre National 2026 • 100% Souverain & Gratuit</span>
            </div>

            {/* Grand Titre Haut de Gamme */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Face aux chocs climatiques, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                votre logement est-il prêt ?
              </span>
            </h1>

            {/* Paragraphe d'explication */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Canicules extrêmes, fissures de sécheresse, crues et remontées de nappes : 
              évaluez gratuitement la vulnérabilité de votre maison et projetez votre commune 
              en <strong>2030, 2050 et 2100</strong> grâce aux simulations officielles de <strong>Météo-France</strong> et <strong>Géorisques</strong>.
            </p>

            {/* MOTEUR DE RECHERCHE FLOTTANT NOUVELLE GÉNÉRATION */}
            <div className="pt-2">
              <form onSubmit={handleFormSubmit} ref={wrapperRef} className="relative">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-white/30 flex flex-col sm:flex-row items-center gap-2 ring-4 ring-indigo-500/20 focus-within:ring-indigo-400 transition-all">
                  
                  {/* Champ de saisie */}
                  <div className="relative flex-1 w-full flex items-center">
                    <MapPin className="w-5 h-5 text-indigo-600 absolute left-3.5 pointer-events-none shrink-0" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Entrez votre adresse postale ou votre commune..."
                      className="w-full h-12 sm:h-14 pl-11 pr-10 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none font-medium"
                      autoComplete="off"
                    />
                    {isLoading && (
                      <Loader2 className="w-5 h-5 text-indigo-600 absolute right-3 animate-spin" />
                    )}
                  </div>

                  {/* Bouton d'action principal */}
                  <button
                    type="submit"
                    className="w-full sm:w-auto h-12 sm:h-14 px-6 rounded-xl bg-gradient-to-r from-[#4f35d2] to-[#6366f1] hover:from-[#432dbb] hover:to-[#5558e6] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
                  >
                    <span>Évaluer mon bien</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Suggestions BAN déroulantes */}
                {isOpen && suggestions.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => handleSelect(item)}
                          className="w-full px-4 py-3.5 text-left flex items-start gap-3 hover:bg-indigo-50/70 transition-colors group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-100/70 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <MapPin className="w-4 h-4 text-indigo-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">
                              {item.street || item.label.split(',')[0]}
                            </div>
                            <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                              <span>{item.postcode} {item.city}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[11px] text-slate-400 font-mono">INSEE {item.citycode}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 self-center" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </form>

              {/* 3 Garanties de confiance sous la barre */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4 pt-1 text-xs text-slate-300/90 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>36 181 communes françaises</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-300 shrink-0" />
                  <span>Zéro pub & zéro démarchage</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Données d'État & Météo-France</span>
                </span>
              </div>
            </div>

          </div>

          {/* COLONNE DROITE (5 COLONNES) : SHOWCASE CARTE APERÇU DU RAPPORT */}
          <div className="lg:col-span-5 relative">
            
            {/* Halo lumineux sous la carte */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl transform rotate-1 scale-105 pointer-events-none" />

            {/* Carte Mockup Rapport ClimatHabitat */}
            <div className="relative bg-white rounded-3xl p-6 sm:p-7 text-slate-900 shadow-2xl border border-white/20 space-y-5">
              
              {/* Carte Header : Faux diagnostic démonstrateur */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                      Aperçu de diagnostic
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      Maison Individuelle • 2050
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Exemple Réel
                </span>
              </div>

              {/* 3 Métriques représentatives */}
              <div className="space-y-2.5">
                
                {/* 1. Canicules */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Canicules estivales</span>
                      <span className="text-[11px] text-slate-500">Jours &gt; 35°C d'ici 2050</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-orange-600 block">+14 jours/an</span>
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">x 3.5</span>
                  </div>
                </div>

                {/* 2. Risque Inondation */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Inondation & Crue</span>
                      <span className="text-[11px] text-slate-500">Plan de prévention PPRN</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    Secteur Protégé
                  </span>
                </div>

                {/* 3. Sécheresse Argiles */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Fissures Sécheresse (RGA)</span>
                      <span className="text-[11px] text-slate-500">Retrait-gonflement des argiles</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    Aléa Fort
                  </span>
                </div>

              </div>

              {/* Jauge de Résilience */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-600">Plan d'action préconisé :</span>
                  <span className="font-bold text-indigo-600">5 fiches travaux adaptées</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full w-[75%]" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 italic text-center">
                  Généré en 2 secondes à partir de l'adresse de votre logement
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* BANDEAU DES 4 CHIFFRES CLÉS (KPIs NATIONAUX) */}
        <div className="mt-12 pt-10 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white block">36 181</span>
              <span className="text-xs text-slate-300 font-medium">Communes françaises modélisées</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">+2,7 °C</span>
              <span className="text-xs text-slate-300 font-medium">Trajectoire TRACC à 2050</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-indigo-300 block">19</span>
              <span className="text-xs text-slate-300 font-medium">Fiches travaux BTP intégrées</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-purple-300 block">100%</span>
              <span className="text-xs text-slate-300 font-medium">Open Data souverain & indépendant</span>
            </div>

          </div>
        </div>

        {/* SECTION 3 PILIERS : CE QUE RÉVÈLE VOTRE DIAGNOSTIC */}
        <div className="mt-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ce que révèle votre diagnostic personnalisé
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Un audit complet, scientifique et indépendant, pensé pour les propriétaires et les professionnels de l'habitat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pilier 1 */}
            <div className="bg-white/95 rounded-3xl p-6 text-slate-900 shadow-xl border border-white/20 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
                  <Thermometer className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    Projections 2050
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Simulations Météo-France
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Découvrez l'évolution saisonnière des températures, la multiplication des journées caniculaires (&gt;35°C), des nuits tropicales et le recul du gel d'ici 2030, 2050 et 2100.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-orange-600">
                Basé sur Climadiag Commune TRACC
              </div>
            </div>

            {/* Pilier 2 */}
            <div className="bg-white/95 rounded-3xl p-6 text-slate-900 shadow-xl border border-white/20 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <Droplets className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Risques Géorisques
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Vulnérabilité Bâti & CatNat
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cartographie précise du retrait-gonflement des argiles (RGA), historique officiel des arrêtés ministériels de catastrophe naturelle et zonages de débordement de cours d'eau.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-600">
                Source Ministère de la Transition Écologique
              </div>
            </div>

            {/* Pilier 3 */}
            <div className="bg-white/95 rounded-3xl p-6 text-slate-900 shadow-xl border border-white/20 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                  <Wrench className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Solutions BTP
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Plan d'Action & 19 Fiches BTP
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Batardeaux étanches, clapets anti-retour, trottoirs périphériques imperméables : des solutions techniques concrètes adaptées aux aléas spécifiques de votre sol.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700">
                Recommandations travaux certifiées
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
