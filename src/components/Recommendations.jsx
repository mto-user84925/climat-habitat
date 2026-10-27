import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  ExternalLink, 
  X,
  FileText,
  ShieldAlert,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import { calculateFloodScore, calculateDroughtScore, getRecommendedWorksheets } from '../services/scoring';

// Meta catalogue of the 19 worksheets
const WORKSHEETS_CATALOG = {
  1: { title: "Installer un batardeau", time: "1 à 2 heures", category: "Protection des ouvertures", icon: "🚪" },
  3: { title: "Installer un clapet anti-retour", time: "2 à 4 heures", category: "Réseaux & Évacuation", icon: "🚰" },
  5: { title: "Mettre hors d'eau les équipements électriques", time: "1 journée", category: "Électricité", icon: "⚡" },
  6: { title: "Rehausser les équipements de chauffage et ECS", time: "1 à 2 jours", category: "Chauffage", icon: "🔥" },
  7: { title: "Aménager un puisard ou pompe de relevage", time: "1 à 2 jours", category: "Sous-sol & Caves", icon: "💧" },
  8: { title: "Éloigner les eaux de toiture et rejets pluviaux", time: "1 journée", category: "Gestion des eaux", icon: "🌧️" },
  9: { title: "Maîtriser la végétation et élaguer les racines", time: "1 demi-journée", category: "Végétation & Arbres", icon: "🌳" },
  10: { title: "Mettre en place un trottoir périphérique étanche", time: "2 à 3 jours", category: "Fondations & Bâti", icon: "🧱" },
  11: { title: "Surveiller l'évolution des fissures (jauges)", time: "Régulier", category: "Surveillance", icon: "🔍" },
  12: { title: "Choisir un revêtement de sol résistant à l'eau", time: "1 à 10 jours", category: "Sols intérieurs", icon: "🪵" },
  13: { title: "Privilégier des cloisons insensibles à l'eau", time: "Selon travaux", category: "Cloisons", icon: "🏢" },
  14: { title: "Installer des isolants hydrophobes", time: "Selon rénovation", category: "Isolation", icon: "🛡️" },
  16: { title: "Adapter les menuiseries intérieures", time: "Selon travaux", category: "Menuiseries", icon: "🚪" },
  17: { title: "Protéger et étanchéifier les soupiraux", time: "3 à 5 heures", category: "Sous-sol", icon: "🪟" },
  18: { title: "Entretenir et curer les réseaux d'évacuation", time: "Annuel", category: "Entretien", icon: "🧹" },
  19: { title: "Ancrer les cuves d'hydrocarbures et citernes", time: "1 journée", category: "Sécurité", icon: "🛢️" },
  20: { title: "Créer une zone refuge à l'étage", time: "Selon aménagement", category: "Sécurité des personnes", icon: "🏠" },
  21: { title: "Obturer temporairement les aérations basses", time: "30 minutes", category: "Urgence", icon: "⚠️" },
  22: { title: "Gérer l'arrosage au pied des fondations", time: "Quotidien", category: "Sol & Argiles", icon: "🌿" }
};

export default function Recommendations({ diagnosticResult, addressData, climadiag, onRestart, onBackToDiagnostic }) {
  const { riskType, categories, diagnosticChoices } = diagnosticResult;

  // Calcul du score officiel
  const scoreData = riskType === 'drought'
    ? calculateDroughtScore(categories, diagnosticChoices)
    : calculateFloodScore(diagnosticChoices);

  // Fiches travaux sélectionnées
  const recommendedSheetIds = getRecommendedWorksheets(riskType, categories, diagnosticChoices);

  // Modal fiche travaux HTML
  const [activeSheetId, setActiveSheetId] = useState(null);
  const [sheetHtml, setSheetHtml] = useState('');
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);

  useEffect(() => {
    if (!activeSheetId) {
      setSheetHtml('');
      return;
    }

    async function loadSheet() {
      setIsLoadingSheet(true);
      try {
        const res = await fetch(`/workSheets/${activeSheetId}.html`);
        if (res.ok) {
          const html = await res.text();
          setSheetHtml(html);
        } else {
          setSheetHtml('<p class="p-6 text-slate-600">Fiche pratique en cours de mise à jour.</p>');
        }
      } catch (err) {
        console.error('Erreur chargement fiche travaux:', err);
      } finally {
        setIsLoadingSheet(false);
      }
    }
    loadSheet();
  }, [activeSheetId]);

  const handlePrint = () => {
    window.print();
  };

  const horizon2050 = climadiag ? climadiag.getHorizonData(1) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top action bar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
        <button
          onClick={onBackToDiagnostic}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl transition-colors border border-white/10 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Modifier mes réponses</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Télécharger mon Bilan (PDF)</span>
          </button>
        </div>
      </div>

      {/* PRINT HEADER ONLY VISIBLE DURING PRINT */}
      <div className="print-only hidden mb-8 pb-4 border-b-2 border-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ClimatHabitat — Rapport de Diagnostic</h1>
            <p className="text-xs text-slate-600">Audit de vulnérabilité & projections climatiques 2050 certifiées Météo-Climat Pro</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Adresse : {addressData.label}</div>
            <div>Date : {new Date().toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
      </div>

      {/* Main Score & Diagnosis Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 text-slate-900 shadow-2xl border border-slate-100 mb-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Résultat officiel du diagnostic bâti
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Indice de vulnérabilité : {scoreData.level.label}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Pour votre logement situé au <strong className="text-slate-800">{addressData.street || addressData.label}</strong> ({addressData.city}).
            </p>
          </div>

          {/* Big Score Badge */}
          <div className={`px-6 py-4 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${scoreData.level.bg} ${scoreData.level.border}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Niveau d'exposition</span>
            <span className={`text-3xl font-black ${scoreData.level.color}`}>
              {scoreData.level.label}
            </span>
            <span className="text-[11px] font-mono text-slate-500 mt-0.5">
              Score calculé : {scoreData.score}
            </span>
          </div>
        </div>

        {/* Double Vision Summary: Bâti vs 2050 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
          {/* Diagnostic Bâti */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Constat sur la structure de votre maison</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {riskType === 'drought'
                ? "D'après les caractéristiques constructives (sol, agencement de la parcelle, végétation environnante et fondations), votre logement présente des points de fragilité face au retrait-gonflement des argiles lors des canicules répétées."
                : "Vos matériaux de sol, d'isolation et d'ouvertures basses sont susceptibles d'absorber l'eau et de subir des dégâts matériels importants en cas de submersion ou ruissellement rapide."}
            </p>
          </div>

          {/* Projections Météo-France 2050 */}
          <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Ce que Météo-France prévoit d'ici 2050 pour votre commune</span>
            </h3>
            {horizon2050 ? (
              <div className="text-xs sm:text-sm text-emerald-950 space-y-1.5 leading-relaxed">
                <div>• Canicule : <strong>+{horizon2050.joursCanicule?.diff || 0} jours très chauds</strong> (&gt;35°C) par an.</div>
                <div>• Nuits tropicales : <strong>+{horizon2050.nuitsTropicales?.diff || 0} nuits étouffantes</strong> par an.</div>
                <div>• Climat d'été : <strong>+{horizon2050.tempEte?.diff || 0}°C</strong> sur la température moyenne estivale.</div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">Données prospectives Météo-France en cours de consolidation.</p>
            )}
          </div>

        </div>

      </div>

      {/* WORKSHEETS / FICHES TRAVAUX SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 text-slate-900 shadow-2xl border border-slate-100">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Plan d'actions & fiches travaux recommandées ({recommendedSheetIds.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Fiches pratiques certifiées pour protéger votre maison et réduire votre coût de sinistre.
            </p>
          </div>

          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200/60 w-fit">
            Priorité Prévention BTP
          </span>
        </div>

        {/* Grid of Worksheets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedSheetIds.map(sheetId => {
            const meta = WORKSHEETS_CATALOG[sheetId] || { title: `Fiche travaux ${sheetId}`, time: "1 journée", category: "Travaux", icon: "🛠️" };
            return (
              <div 
                key={sheetId}
                onClick={() => setActiveSheetId(sheetId)}
                className="bg-slate-50 hover:bg-indigo-50/50 rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{meta.icon}</span>
                    <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      Fiche #{sheetId}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-2">
                    {meta.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Durée estimée : {meta.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                  <span>Consulter la fiche technique</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL FULL WORKSHEET DETAILS */}
      {activeSheetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 text-slate-900">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {WORKSHEETS_CATALOG[activeSheetId]?.icon || '🛠️'}
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Fiche pratique #{activeSheetId}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {WORKSHEETS_CATALOG[activeSheetId]?.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveSheetId(null)}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 flex items-center justify-center border border-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with injected HTML */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 prose prose-indigo max-w-none text-slate-700">
              {isLoadingSheet ? (
                <div className="py-12 flex justify-center text-slate-400">
                  Chargement de la fiche technique...
                </div>
              ) : (
                <div 
                  className="worksheet-content"
                  dangerouslySetInnerHTML={{ __html: sheetHtml }} 
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveSheetId(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
              >
                Fermer la fiche
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
