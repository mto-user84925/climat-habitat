import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, MapPin, CheckCircle2, Info, Loader2, Sparkles, Brain } from 'lucide-react';
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
    }, 280);

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

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-12 sm:px-6">
      
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-accent/20 blur-[130px] pointer-events-none rounded-full" />

      <div className="w-full max-w-xl mx-auto flex flex-col items-center z-10">
        
        {/* Header Icon + House Badge */}
        <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-3 shadow-lg shadow-black/20">
            <Home className="w-9 h-9 text-white stroke-[1.75]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Que risque ma maison ?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-medium mt-1">
            Votre diagnostic personnalisé & projections 2050
          </p>
        </div>

        {/* Central White Card */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-900 border border-slate-100 relative">
          
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
            Entrez votre adresse pour évaluer vos risques
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1 mb-6">
            (inondation, sécheresse, climat 2050...)
          </p>

          {/* Autocomplete Input */}
          <div ref={wrapperRef} className="relative w-full">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Saisissez votre adresse postale"
                className="w-full h-14 pl-12 pr-12 text-base text-slate-900 placeholder:text-slate-400 bg-white border-2 border-indigo-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
                autoComplete="off"
              />
              <Search className="w-5 h-5 text-indigo-600 absolute left-4 pointer-events-none" />
              {isLoading && (
                <Loader2 className="w-5 h-5 text-indigo-600 absolute right-4 animate-spin" />
              )}
            </div>

            {/* Suggestions dropdown */}
            {isOpen && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100">
                {suggestions.map((item, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full px-4 py-3.5 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors group"
                    >
                      <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {item.street || item.label.split(',')[0]}
                        </div>
                        <div className="text-xs text-slate-600">
                          {item.postcode} {item.city} ({item.context})
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Privacy mention */}
          <div className="flex items-start gap-3 mt-6 pt-5 border-t border-slate-100 text-xs text-slate-600">
            <div className="w-5 h-5 rounded-full bg-brand-accent/15 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-3.5 h-3.5 text-brand-accent" />
            </div>
            <p className="leading-relaxed">
              Données traitées de manière souveraine (Base Adresse Nationale, Géorisques & Météo-France). <strong>Zéro pub, zéro démarchage assurantiel.</strong>
            </p>
          </div>

        </div>

        {/* Section below: "VOTRE DIAGNOSTIC CONTIENDRA :" (Validated layout) */}
        <div className="w-full mt-10">
          <h3 className="text-xs sm:text-sm font-bold text-white/90 text-center mb-5 tracking-wider uppercase">
            Votre diagnostic contiendra :
          </h3>

          <div className="space-y-3">
            
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-md text-slate-900 border border-white/20">
              <div className="w-9 h-9 rounded-full bg-[#4f35d2] flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-slate-900 block">
                  L'audit complet de vos risques naturels actuels
                </span>
                <span className="text-xs text-slate-600">
                  Inondation, sol argileux RGA, séisme, radon et historique officiel des arrêtés CatNat.
                </span>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-md text-slate-900 border border-white/20 border-l-4 border-l-emerald-500">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-emerald-700 font-extrabold uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                    Exclusivité Météo-France
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    Projections climatiques 2030, 2050 et 2100
                  </span>
                </div>
                <span className="text-xs text-slate-600">
                  Évolution des journées caniculaires (&gt;35°C), des nuits tropicales et de la sécheresse.
                </span>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-md text-slate-900 border border-white/20">
              <div className="w-9 h-9 rounded-full bg-[#4f35d2] flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-slate-900 block">
                  Votre plan d'action préventif & fiches travaux personnalisées
                </span>
                <span className="text-xs text-slate-600">
                  Les fiches techniques prioritaires sélectionnées automatiquement pour protéger votre bien.
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
