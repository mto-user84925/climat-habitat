import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Award, 
  Brain, 
  Sun,
  Droplets, 
  ShieldAlert,
  Flame,
  Zap
} from 'lucide-react';

// Questions 100% Grand Public, Simples & Pratiques
const SIMPLE_QUIZ_QUESTIONS = [
  {
    id: 1,
    theme: "Chaleur & Canicule",
    icon: "☀️",
    question: "En plein été pendant une canicule, par où la chaleur pénètre-t-elle le plus dans votre maison ?",
    options: [
      { text: "Par le toit et les combles", isCorrect: true },
      { text: "Par le carrelage du sol", isCorrect: false },
      { text: "Par la porte d'entrée", isCorrect: false }
    ],
    explanation: "Le toit est frappé par le soleil toute la journée et peut monter à plus de 65°C. Il représente jusqu'à 30% de la chaleur qui entre dans la maison !"
  },
  {
    id: 2,
    theme: "Orages & Inondation",
    icon: "🚗",
    question: "Lors d'un violent orage ou d'une crue, à partir de quelle hauteur d'eau une voiture risque-t-elle de flotter ?",
    options: [
      { text: "Dès 30 cm d'eau (hauteur des roues)", isCorrect: true },
      { text: "À partir d'1 mètre d'eau", isCorrect: false },
      { text: "Une voiture ne flotte jamais à cause de son poids", isCorrect: false }
    ],
    explanation: "Dès 30 cm d'eau, une voiture commence à flotter et peut être emportée par le courant. Ne vous engagez jamais sur une route inondée !"
  },
  {
    id: 3,
    theme: "Sécheresse & Fondations",
    icon: "🏜️",
    question: "Pendant les périodes très sèches, pourquoi certaines maisons voient-elles des fissures apparaître sur leurs murs ?",
    options: [
      { text: "Le sol en terre ou argile sèche et se rétracte sous les murs", isCorrect: true },
      { text: "Le soleil brûle la peinture des façades", isCorrect: false },
      { text: "À cause des rafales de vent", isCorrect: false }
    ],
    explanation: "Comme une éponge qui rétrécit en séchant, la terre argileuse se rétracte et fait bouger les fondations de la maison, créant des fissures."
  },
  {
    id: 4,
    theme: "Climat 2050",
    icon: "🌡️",
    question: "Selon Météo-France, d'ici 2050, à quoi devons-nous nous préparer pour nos logements ?",
    options: [
      { text: "À deux fois plus de jours de canicule et de nuits très chaudes", isCorrect: true },
      { text: "À exactement le même climat qu'aujourd'hui", isCorrect: false },
      { text: "À des hivers avec de la neige en plein été", isCorrect: false }
    ],
    explanation: "Météo-France prévoit un doublement des journées à plus de 35°C et des nuits tropicales. Adapter sa maison dès maintenant est essentiel pour son confort et sa valeur."
  },
  {
    id: 5,
    theme: "Sécurité d'urgence",
    icon: "⚡",
    question: "Si de l'eau commence à entrer dans votre maison ou votre sous-sol, quel est le tout premier geste réflexe ?",
    options: [
      { text: "Couper le disjoncteur général d'électricité", isCorrect: true },
      { text: "Ouvrir toutes les fenêtres", isCorrect: false },
      { text: "Descendre à la cave pour ranger ses affaires", isCorrect: false }
    ],
    explanation: "L'eau et l'électricité ne font pas bon ménage ! Il faut immédiatement couper le disjoncteur général pour éviter tout risque mortel d'électrocution."
  }
];

export default function ClimateQuiz({ addressData, onFinishQuiz }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = SIMPLE_QUIZ_QUESTIONS[currentIdx];
  const isLast = currentIdx === SIMPLE_QUIZ_QUESTIONS.length - 1;

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOptionIdx(idx);
    setIsAnswered(true);

    const isCorrect = currentQ.options[idx].isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 20);
    }
  };

  const handleNext = () => {
    if (isLast) {
      onFinishQuiz({
        score,
        totalQuestions: SIMPLE_QUIZ_QUESTIONS.length
      });
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
      setIsAnswered(false);
    }
  };

  const progressPercent = Math.round(((currentIdx + 1) / SIMPLE_QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Top Banner: Context */}
      <div className="flex items-center justify-between gap-4 mb-4 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-brand-purple" />
          <span className="font-semibold text-white">Quiz Express : Êtes-vous prêt face au climat ?</span>
        </div>
        <button
          onClick={() => onFinishQuiz({ score: 60, totalQuestions: 5 })}
          className="text-slate-400 hover:text-white underline transition-colors"
        >
          Passer au bilan direct
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden mb-6 border border-white/10">
        <div 
          className="bg-gradient-to-r from-brand-accent to-emerald-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100">
        
        {/* Header Question */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5">
            <span>{currentQ.icon}</span>
            <span>Question {currentIdx + 1} / 5</span>
          </span>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Score : {score}/100</span>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug mb-5">
          {currentQ.question}
        </h2>

        {/* 3 Simple Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOptionIdx === idx;
            let btnStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-800";

            if (isAnswered) {
              if (opt.isCorrect) {
                btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-sm";
              } else if (isSelected && !opt.isCorrect) {
                btnStyle = "border-red-400 bg-red-50 text-red-950 line-through opacity-80";
              } else {
                btnStyle = "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 text-sm font-semibold ${btnStyle}`}
              >
                <span>{opt.text}</span>
                {isAnswered && opt.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && !opt.isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback / Explanation Box */}
        {isAnswered && (
          <div className="mt-5 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/60 animate-fade-in text-xs sm:text-sm text-indigo-950 leading-relaxed flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                {currentQ.options[selectedOptionIdx]?.isCorrect ? "✅ Bravo, c'est exact !" : "💡 Le conseil de l'expert :"}
              </span>
              <p>{currentQ.explanation}</p>
            </div>
          </div>
        )}

        {/* Next CTA Button */}
        {isAnswered && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-brand-accent hover:bg-brand-purple text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-900/30 transition-all hover:scale-105 text-sm"
            >
              <span>{isLast ? "Voir mon diagnostic complet" : "Question suivante"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
