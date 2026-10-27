import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  HelpCircle,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

export default function Diagnostic3D({ riskType, addressData, onFinish, onBack }) {
  const [data, setData] = useState(null);
  const [currentCatIdx, setCurrentCatIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [categoryName]: [selectedAnswerNames] }
  const [isLoading, setIsLoading] = useState(true);

  // Spline scene URLs extracted directly from Matmut
  const splineUrl = riskType === 'drought'
    ? 'https://prod.spline.design/ZzVV75YowZ4oToCW/scene.splinecode' // Sécheresse RGA
    : 'https://prod.spline.design/2lBljSaoFvF3PdXi/scene.splinecode'; // Inondation

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const file = riskType === 'drought' ? '/data/diagnostic-drought.json' : '/data/diagnostic-flood.json';
        const res = await fetch(file);
        const json = await res.json();
        setData(json);
        
        // Initialiser les réponses par défaut
        const initialAnswers = {};
        (json.categories || []).forEach(cat => {
          if (cat.default_answer != null) {
            const defAns = (cat.answers || []).find(a => a.id === cat.default_answer);
            if (defAns) initialAnswers[cat.name] = [defAns.name];
          } else {
            initialAnswers[cat.name] = [];
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Erreur chargement questionnaire:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [riskType]);

  if (isLoading || !data) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-300">Chargement de la maison 3D et des éléments du diagnostic...</p>
        </div>
      </div>
    );
  }

  const categories = (data.categories || []).filter(c => c.isDisplayed !== false);
  const currentCategory = categories[currentCatIdx];
  const selectedTypes = answers[currentCategory?.name] || [];

  const handleSelectAnswer = (ansName, isMultiple) => {
    setAnswers(prev => {
      const current = prev[currentCategory.name] || [];
      if (isMultiple) {
        if (current.includes(ansName)) {
          return { ...prev, [currentCategory.name]: current.filter(n => n !== ansName) };
        } else {
          return { ...prev, [currentCategory.name]: [...current, ansName] };
        }
      } else {
        return { ...prev, [currentCategory.name]: [ansName] };
      }
    });
  };

  const isLastCategory = currentCatIdx === categories.length - 1;
  const answeredCount = Object.values(answers).filter(arr => arr.length > 0).length;
  const progression = Math.round((answeredCount / categories.length) * 100);

  const handleComplete = () => {
    // Format choices for scoring service
    const diagnosticChoices = categories.map(cat => {
      const chosen = answers[cat.name] || [];
      const abacusVals = [];
      (cat.answers || [])
        .filter(a => chosen.includes(a.name))
        .forEach(a => {
          if (a.abacus && a.abacus[0]) abacusVals.push(a.abacus[0].value);
        });

      return {
        category: cat.name,
        types: chosen,
        abacus: abacusVals,
        validated: chosen.length > 0
      };
    });

    onFinish({
      riskType,
      categories,
      diagnosticChoices
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      
      {/* Top Breadcrumb & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au tableau de bord</span>
          </button>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Diagnostic {riskType === 'drought' ? 'Sécheresse & Fissures RGA' : 'Inondation & Immersion'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">
            Étape {currentCatIdx + 1} / {categories.length} ({progression}%)
          </span>
          <div className="w-32 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-brand-accent to-brand-purple rounded-full transition-all duration-300" 
              style={{ width: `${progression}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: 3D House Viewer on Left, Questions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: 3D SPLINE HOUSE (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-white/15 overflow-hidden shadow-2xl relative h-[420px] lg:h-[620px] flex flex-col">
          
          {/* Badge overlays */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow">
              Maison 3D Interactive
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-xs text-slate-300 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
            <span>💡 Cliquez et faites pivoter la maison pour inspecter les zones exposées</span>
            <span className="font-mono text-indigo-400 font-bold">{currentCategory?.name}</span>
          </div>

          {/* Spline 3D Viewer */}
          <div className="w-full h-full relative">
            <spline-viewer 
              url={splineUrl}
              className="w-full h-full block"
            ></spline-viewer>
          </div>

        </div>

        {/* RIGHT COLUMN: QUESTION & CHOICES (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 flex flex-col justify-between min-h-[500px]">
          
          <div>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Layers className="w-4 h-4" />
              <span>{currentCategory?.name}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 leading-snug">
              {currentCategory?.question || `Quel est le type de ${currentCategory?.name.toLowerCase()} ?`}
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              {currentCategory?.multiple_answers || currentCategory?.isMultipleChoice
                ? 'Plusieurs choix possibles si votre logement combine différents matériaux.'
                : 'Sélectionnez l’option correspondant à votre logement.'}
            </p>

            {/* Answers options list */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {(currentCategory?.answers || []).map((ans) => {
                const isSelected = selectedTypes.includes(ans.name);
                const isMultiple = currentCategory?.multiple_answers || currentCategory?.isMultipleChoice;

                return (
                  <button
                    key={ans.id}
                    type="button"
                    onClick={() => handleSelectAnswer(ans.name, isMultiple)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'border border-slate-300 bg-white text-transparent'
                      }`}>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 group-hover:text-slate-900">
                          {ans.name}
                        </div>
                        {ans.description && (
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {ans.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {ans.score != null && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        ans.score >= 30 ? 'bg-red-100 text-red-700' :
                        ans.score >= 15 ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        Score {ans.score}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => setCurrentCatIdx(prev => Math.max(0, prev - 1))}
              disabled={currentCatIdx === 0}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-colors ${
                currentCatIdx === 0
                  ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                  : 'hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>

            {isLastCategory ? (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 text-sm"
              >
                <span>Terminer et voir mon bilan</span>
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentCatIdx(prev => Math.min(categories.length - 1, prev + 1))}
                className="flex items-center gap-2 bg-brand-accent hover:bg-brand-purple text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 text-sm"
              >
                <span>Suivant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
