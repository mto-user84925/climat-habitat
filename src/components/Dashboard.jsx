import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Droplets, 
  Sun, 
  Mountain, 
  Activity, 
  Radio, 
  Flame, 
  Thermometer, 
  Sparkles,
  History,
  CheckCircle2,
  Printer,
  Clock,
  ExternalLink,
  X,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Award,
  Brain,
  Info
} from 'lucide-react';

import SeasonalTempChart from './charts/SeasonalTempChart';
import HeatwaveComparisonCard from './charts/HeatwaveComparisonCard';
import PluvioMoistureCard from './charts/PluvioMoistureCard';

// Catalogue des 19 fiches travaux BTP
const WORKSHEETS_CATALOG = {
  1: { id: 1, title: "Installer un batardeau amovible", time: "1 à 2 h", category: "Inondation", tag: "Ouvertures", icon: "🚪", desc: "Panneau étanche pour bloquer l'eau aux portes et baies vitrées." },
  3: { id: 3, title: "Installer un clapet anti-retour", time: "2 à 4 h", category: "Inondation", tag: "Réseaux", icon: "🚰", desc: "Évite le refoulement des eaux usées lors des inondations de voirie." },
  5: { id: 5, title: "Mettre hors d'eau les équipements électriques", time: "1 jour", category: "Inondation", tag: "Sécurité", icon: "⚡", desc: "Rehausser les prises, tableaux et compteurs au-dessus du niveau de crue." },
  6: { id: 6, title: "Rehausser chaudière et pompe à chaleur", time: "1 à 2 jours", category: "Inondation", tag: "Chauffage", icon: "🔥", desc: "Protéger les équipements thermiques coûteux des dégâts d'eau." },
  7: { id: 7, title: "Aménager un puisard avec pompe de relevage", time: "1 à 2 jours", category: "Inondation", tag: "Sous-sol", icon: "💧", desc: "Évacuer l'eau infiltrée dans les caves et sous-sols enterrés." },
  8: { id: 8, title: "Éloigner les rejets d'eaux pluviales du bâti", time: "1 jour", category: "Sécheresse / RGA", tag: "Eau", icon: "🌧️", desc: "Éviter les variations d'humidité au pied des fondations argileuses." },
  9: { id: 9, title: "Maîtriser la végétation et élaguer les racines", time: "1 demi-journée", category: "Sécheresse / RGA", tag: "Arbres", icon: "🌳", desc: "Les racines pompent l'eau du sol et accentuent les affouillements." },
  10: { id: 10, title: "Mettre en place un trottoir périphérique étanche", time: "2 à 3 jours", category: "Sécheresse / RGA", tag: "Fondations", icon: "🧱", desc: "Crée une bande imperméable autour des murs pour stabiliser le sol." },
  11: { id: 11, title: "Surveiller et jauger l'évolution des fissures", time: "Suivi régulier", category: "Sécheresse / RGA", tag: "Surveillance", icon: "🔍", desc: "Pose de fissuromètres pour distinguer fissures superficielles et structurelles." },
  12: { id: 12, title: "Choisir un revêtement de sol hydrofuge", time: "1 à 5 jours", category: "Inondation", tag: "Sols", icon: "🪵", desc: "Privilégier carrelage ou résine au lieu de parquets stratifiés gonflants." },
  14: { id: 14, title: "Poser des isolants hydrophobes insensibles", time: "Rénovation", category: "Inondation", tag: "Isolation", icon: "🛡️", desc: "Polystyrène ou polyuréthane à la place de laines qui pourrissent." },
  17: { id: 17, title: "Protéger et étanchéifier les soupiraux", time: "3 à 5 h", category: "Inondation", tag: "Sous-sol", icon: "🪟", desc: "Margelles surélevées et vitrages résistants à la poussée d'eau." },
  22: { id: 22, title: "Homogénéiser l'humidité du sol en période sèche", time: "Quotidien", category: "Sécheresse / RGA", tag: "Sol", icon: "🌿", desc: "Éviter les arrosages asymétriques qui déstabilisent l'assise du bâti." }
};

export default function Dashboard({ addressData, georisques, climadiag, quizResult, onRestart }) {
  // Climat en premier dès l'arrivée du quiz !
  const [activeTab, setActiveTab] = useState('climadiag'); // 'climadiag', 'summary', 'worksheets'
  const [horizonIdx, setHorizonIdx] = useState(1); // 0 = 2030, 1 = 2050, 2 = 2100

  // Modal fiche travaux HTML
  const [activeSheetId, setActiveSheetId] = useState(null);
  const [sheetHtml, setSheetHtml] = useState('');
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);

  const horizonData = climadiag ? climadiag.getHorizonData(horizonIdx) : null;

  // Risques actuels
  const isDroughtHigh = georisques?.rga?.code === '3';
  const isDroughtMedium = georisques?.rga?.code === '2';
  const hasFloodRisk = (georisques?.gaspar || []).some(g => 
    g.label?.toLowerCase().includes('inondation') || 
    g.label?.toLowerCase().includes('crue') || 
    g.label?.toLowerCase().includes('ruissellement')
  );

  // Score global de vulnérabilité
  let globalScore = 20;
  if (isDroughtHigh) globalScore += 35;
  else if (isDroughtMedium) globalScore += 20;
  if (hasFloodRisk) globalScore += 30;
  if ((georisques?.catnat?.total || 0) >= 5) globalScore += 15;

  const globalLevel = globalScore >= 70 ? { label: "Élevé", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" } :
                      globalScore >= 45 ? { label: "Moyen", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" } :
                      { label: "Modéré", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };

  // Score de culture climat
  const quizScore = quizResult?.score != null ? quizResult.score : 80;
  const quizLabel = quizScore >= 80 ? "Expert Climat" :
                    quizScore >= 60 ? "Citoyen Éclairé" :
                    quizScore >= 40 ? "Sensibilisé" : "Initié";

  // Sélection automatique des fiches recommandées
  const recommendedSheets = [];
  if (hasFloodRisk) {
    recommendedSheets.push(WORKSHEETS_CATALOG[1], WORKSHEETS_CATALOG[3], WORKSHEETS_CATALOG[5], WORKSHEETS_CATALOG[6], WORKSHEETS_CATALOG[7], WORKSHEETS_CATALOG[12]);
  }
  if (isDroughtHigh || isDroughtMedium || true) {
    recommendedSheets.push(WORKSHEETS_CATALOG[8], WORKSHEETS_CATALOG[9], WORKSHEETS_CATALOG[10], WORKSHEETS_CATALOG[11], WORKSHEETS_CATALOG[22]);
  }

  // Chargement fiche HTML
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
          setSheetHtml(await res.text());
        } else {
          setSheetHtml('<p class="p-6 text-slate-600">Fiche technique en cours de mise à jour.</p>');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingSheet(false);
      }
    }
    loadSheet();
  }, [activeSheetId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* PRINT-ONLY HEADER */}
      <div className="print-only hidden mb-8 pb-4 border-b-2 border-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ClimatHabitat — Rapport Officiel de Diagnostic</h1>
            <p className="text-xs text-slate-600">Audit de vulnérabilité & projections climatiques 2050 certifié Météo-Climat Pro</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Adresse : {addressData.label}</div>
            <div>Score Sensibilisation : {quizScore}/100 ({quizLabel})</div>
            <div>Date : {new Date().toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
      </div>

      {/* TOP HEADER CARD: IDENTIQUE AU STYLE D'ACCUEIL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-1">
              <MapPin className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Diagnostic Validé
                </span>
                <span className="text-xs text-slate-500 font-mono">INSEE {addressData.citycode}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {addressData.street || addressData.label}
              </h1>
              <p className="text-sm text-slate-600 font-medium">
                {addressData.postcode} {addressData.city} ({addressData.context})
              </p>
            </div>
          </div>

          {/* Badges: Score Culture Climat + Risque Logement */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Quiz Score Badge */}
            <div className="px-4 py-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50/80 flex flex-col items-center justify-center shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                <Brain className="w-3 h-3 text-indigo-600" />
                <span>Culture Climat</span>
              </div>
              <span className="text-2xl font-black text-indigo-900">{quizScore}/100</span>
              <span className="text-[10px] font-bold text-indigo-600">{quizLabel}</span>
            </div>

            {/* Global Risk Badge */}
            <div className={`px-4 py-3 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${globalLevel.bg} ${globalLevel.border}`}>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <ShieldAlert className="w-3 h-3" />
                <span>Risque Bâti</span>
              </div>
              <span className={`text-2xl font-black ${globalLevel.color}`}>{globalLevel.label}</span>
              <span className="text-[10px] font-semibold text-slate-500">Aléa naturel</span>
            </div>

            <button
              onClick={() => window.print()}
              className="no-print flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-4 py-3 rounded-2xl shadow-md transition-all hover:scale-105 text-xs sm:text-sm"
              title="Télécharger le rapport officiel en PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Télécharger (PDF)</span>
            </button>
          </div>

        </div>

        {/* 3 Quick Summary Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
          <div className="bg-slate-50 rounded-xl p-3 text-xs flex items-center gap-3">
            <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Inondation</span>
              <span className="font-bold text-slate-800">{hasFloodRisk ? 'Zone couverte PPRN' : 'Pas de crue majeure'}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-xs flex items-center gap-3">
            <Sun className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Fissures Sécheresse (RGA)</span>
              <span className="font-bold text-slate-800">{georisques?.rga?.level || 'Exposition faible'}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-xs flex items-center gap-3">
            <History className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Arrêtés CatNat d'État</span>
              <span className="font-bold text-slate-800">{georisques?.catnat?.total || 0} reconnus</span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS (NO-PRINT) */}
      <div className="no-print flex flex-wrap items-center gap-2 mb-6 border-b border-white/15 pb-3">
        <button
          onClick={() => setActiveTab('climadiag')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'climadiag' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>1. Projections Météo-France 2050 (Graphiques)</span>
          <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Exclusif</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'summary' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Activity className="w-4 h-4 text-brand-accent" />
          <span>2. Risques Immédiats & CatNat</span>
        </button>

        <button
          onClick={() => setActiveTab('worksheets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'worksheets' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>3. Fiches Travaux BTP ({recommendedSheets.length})</span>
        </button>
      </div>

      {/* TAB 1 (PAR DÉFAUT) : CLIMAT & PROJECTIONS GRAPHIQUES 2050 */}
      {activeTab === 'climadiag' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Horizon Selector Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 text-slate-900 shadow-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Simulations Météo-France Climadiag Commune (TRACC / GIEC)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Projections climatiques pour {addressData.city}
              </h2>
            </div>

            {/* Horizon Switcher */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
              <button
                onClick={() => setHorizonIdx(0)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  horizonIdx === 0 ? 'bg-[#4f35d2] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2030 (+2°C)
              </button>
              <button
                onClick={() => setHorizonIdx(1)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  horizonIdx === 1 ? 'bg-[#4f35d2] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2050 (+2,7°C)
              </button>
              <button
                onClick={() => setHorizonIdx(2)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  horizonIdx === 2 ? 'bg-[#4f35d2] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2100 (+4°C)
              </button>
            </div>
          </div>

          {horizonData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 1. GRAPHIQUE SVG : TEMPERATURES PAR SAISON */}
              <SeasonalTempChart
                g1Data={horizonData.g1Seasons}
                horizonLabel={horizonData.horizonLabel}
              />

              {/* 2. GRAPHIQUE : CANICULES & NUITS TROPICALES */}
              <HeatwaveComparisonCard
                caniculeData={horizonData.joursCanicule}
                tropicalData={horizonData.nuitsTropicales}
                horizonLabel={horizonData.horizonLabel}
              />

              {/* 3. GRAPHIQUE : PLUVIOMETRIE & SOLS ARGILES */}
              <PluvioMoistureCard
                precipData={horizonData.precipitations}
                horizonLabel={horizonData.horizonLabel}
              />

              {/* 4. CARTE RECUL DU GEL */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
                      <Activity className="w-4 h-4 text-cyan-600" />
                      <span>Régime Thermique Hivernal</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-cyan-50 text-cyan-800 px-2.5 py-0.5 rounded-full border border-cyan-200">
                      Baisse du Gel
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                    Évolution des Jours de Gel (&lt; 0°C)
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Impact sur les besoins de chauffage et la reprise de végétation
                  </p>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Jours de gel par an</span>
                      <span className="text-3xl font-black text-cyan-800">{horizonData.joursGel?.future || '0'}</span>
                      <span className="text-xs font-semibold text-slate-600 ml-1">jours/an</span>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-slate-500 block">Climat de référence :</span>
                      <span className="font-bold text-slate-800">{horizonData.joursGel?.ref || '0'} j</span>
                      <span className="text-cyan-800 font-bold block">
                        {horizonData.joursGel?.diff || '0'} jours
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <span>Moins de jours de gel l'hiver mais risque accru de gel printanier tardif.</span>
                  <span className="font-bold text-indigo-600">Fiche 6 adaptée</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center text-slate-600 shadow-2xl">
              Chargement des simulations climatiques Météo-France...
            </div>
          )}

        </div>
      )}

      {/* TAB 2 : RISQUES IMMEDIATS & CATNAT */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* INONDATION CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 text-slate-900 shadow-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    hasFloodRisk ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {hasFloodRisk ? 'Zone Sensible' : 'Pas de risque majeur'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Risque Inondation & Débordement</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {hasFloodRisk
                    ? "Votre commune possède un historique officiel de crues, ruissellements de surface ou de remontées de nappe phréatique."
                    : "Votre secteur n'est pas situé dans le lit majeur d'un cours d'eau sous plan de prévention PPRN."}
                </p>
                {hasFloodRisk && (
                  <div className="mt-4 bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                    <div className="font-semibold text-slate-800">Détails enregistrés en préfecture :</div>
                    {(georisques?.gaspar || [])
                      .filter(g => g.label?.toLowerCase().includes('inond') || g.label?.toLowerCase().includes('crue') || g.label?.toLowerCase().includes('ruissellement'))
                      .map((g, i) => (
                        <div key={i} className="text-slate-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{g.label}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveTab('worksheets')}
                className="mt-6 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 pt-3 border-t border-slate-100"
              >
                <span>Voir les 6 travaux recommandés contre l'inondation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SECHERESSE / RGA CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 text-slate-900 shadow-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Sun className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isDroughtHigh ? 'bg-red-100 text-red-800 font-extrabold' :
                    isDroughtMedium ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {georisques?.rga?.level || 'Exposition faible'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Sécheresse & Fissures Argiles (RGA)</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Le phénomène de retrait-gonflement des argiles assèche le sous-sol lors des vagues de chaleur, provoquant un affaissement différentiel des fondations et des fissures sur les façades.
                </p>
                <div className="mt-4 bg-slate-50 p-3 rounded-xl text-xs flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Cartographie BRGM parcellaire :</span>
                  <span className="font-bold text-slate-900">{georisques?.rga?.level}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('worksheets')}
                className="mt-6 text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 pt-3 border-t border-slate-100"
              >
                <span>Voir les 5 fiches de stabilisation du sol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* HISTORIQUE CATNAT OFFICIEL */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Historique des catastrophes naturelles reconnues sur la commune
                </h3>
              </div>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                {georisques?.catnat?.total || 0} arrêtés d'État
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Ces arrêtés confirment que la commune a déjà subi des dégâts climatiques indemnisés par le régime CatNat :
            </p>

            {georisques?.catnat?.items && georisques.catnat.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {georisques.catnat.items.map((cn, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{cn.risk}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{cn.start}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">Aucun arrêté majeur répertorié.</div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: PLAN D'ACTIONS & 19 FICHES TRAVAUX */}
      {activeTab === 'worksheets' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Plan d'actions & fiches travaux recommandées ({recommendedSheets.length})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sélectionnées automatiquement en fonction des risques réels de votre adresse (Inondation & Argiles).
                </p>
              </div>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full w-fit">
                Recommandations BTP Certifiées
              </span>
            </div>

            {/* Grid of Worksheets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedSheets.map(ws => (
                <div
                  key={ws.id}
                  onClick={() => setActiveSheetId(ws.id)}
                  className="bg-slate-50 hover:bg-indigo-50/50 rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{ws.icon}</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {ws.category}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1.5">
                      {ws.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                      {ws.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs font-semibold text-indigo-600 group-hover:text-indigo-800">
                    <span className="flex items-center gap-1.5 text-slate-500 font-normal">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ws.time}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>Fiche technique</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* MODAL WORKSHEET HTML DETAILS */}
      {activeSheetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 text-slate-900">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{WORKSHEETS_CATALOG[activeSheetId]?.icon || '🛠️'}</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Fiche Pratique #{activeSheetId}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {WORKSHEETS_CATALOG[activeSheetId]?.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveSheetId(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 flex items-center justify-center border border-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 prose prose-indigo max-w-none text-slate-700 text-sm">
              {isLoadingSheet ? (
                <div className="py-8 text-center text-slate-400">Chargement de la fiche technique...</div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: sheetHtml }} />
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveSheetId(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
