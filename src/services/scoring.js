/**
 * Moteur de calcul de vulnérabilité & sélection des fiches travaux
 * Barème officiel extrait et étalonné
 */

export const RISK_LEVELS = {
  FAIBLE: { id: 'faible', label: 'Faible', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  PLUTOT_FAIBLE: { id: 'plutot-faible', label: 'Plutôt faible', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  MOYEN: { id: 'moyen', label: 'Moyen', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  PLUTOT_ELEVE: { id: 'plutot-eleve', label: 'Plutôt élevé', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  ELEVE: { id: 'eleve', label: 'Élevé', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' }
};

export function evaluateThresholds(score, thresholds) {
  if (score >= thresholds[3]) return RISK_LEVELS.ELEVE;
  if (score >= thresholds[2]) return RISK_LEVELS.PLUTOT_ELEVE;
  if (score >= thresholds[1]) return RISK_LEVELS.MOYEN;
  if (score >= thresholds[0]) return RISK_LEVELS.PLUTOT_FAIBLE;
  return RISK_LEVELS.FAIBLE;
}

// 1. Scoring Inondation (Seuils : 5, 10, 15, 20)
export function calculateFloodScore(diagnosticChoices) {
  if (!diagnosticChoices || diagnosticChoices.length === 0) return { score: 0, level: RISK_LEVELS.FAIBLE };
  
  const values = [];
  diagnosticChoices.forEach(choice => {
    if (choice.validated && choice.abacus && choice.abacus.length > 0) {
      values.push(Math.max(...choice.abacus));
    }
  });

  if (values.length === 0) return { score: 0, level: RISK_LEVELS.FAIBLE };
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const level = evaluateThresholds(avg, [5, 10, 15, 20]);
  return { score: avg, level };
}

// 2. Scoring Sécheresse RGA (Seuils : 70, 110, 150, 190)
export function calculateDroughtScore(categories, diagnosticChoices) {
  if (!categories || categories.length === 0) return { score: 0, level: RISK_LEVELS.FAIBLE };
  
  let total = 0;
  categories.filter(c => c.isDisplayed !== false).forEach(category => {
    const choice = (diagnosticChoices || []).find(ch => ch.category === category.name && ch.validated);
    let catScore = 0;

    if (choice && choice.types && choice.types.length > 0) {
      const selectedScores = (category.answers || [])
        .filter(ans => choice.types.includes(ans.name))
        .map(ans => ans.score || 0);

      if (selectedScores.length > 0) {
        catScore = category.isScoreCumulative 
          ? selectedScores.reduce((a, b) => a + b, 0) 
          : Math.max(...selectedScores);
      }
    } else if (category.default_answer != null) {
      const defAns = (category.answers || []).find(a => a.id === category.default_answer);
      if (defAns) catScore = defAns.score || 0;
    }

    total += catScore;
  });

  const level = evaluateThresholds(total, [70, 110, 150, 190]);
  return { score: total, level };
}

// Récupération des fiches travaux prioritaires selon les réponses
export function getRecommendedWorksheets(riskType, categories, diagnosticChoices) {
  const recommendedIds = new Set();
  
  if (riskType === 'drought') {
    // Fiches automatiques RGA
    [8, 9, 10, 11].forEach(id => recommendedIds.add(id));

    // Fiches selon réponses
    (diagnosticChoices || []).filter(c => c.validated).forEach(choice => {
      const cat = categories.find(c => c.name === choice.category);
      if (cat) {
        (cat.answers || [])
          .filter(ans => (choice.types || []).includes(ans.name))
          .forEach(ans => {
            (ans.sheets || []).forEach(sId => recommendedIds.add(sId));
          });
      }
    });
  } else {
    // Inondation : batardeaux et protections principales
    recommendedIds.add(1); // Batardeau
    recommendedIds.add(3); // Clapet anti-retour

    (diagnosticChoices || []).filter(c => c.validated).forEach(choice => {
      const cat = categories.find(c => c.name === choice.category);
      if (cat) {
        (cat.answers || [])
          .filter(ans => (choice.types || []).includes(ans.name))
          .forEach(ans => {
            const val = ans.abacus && ans.abacus[0] ? ans.abacus[0].value : 0;
            if (ans.threshold !== -1 && val >= ans.threshold) {
              (ans.advices_sheets || []).forEach(sId => recommendedIds.add(sId));
            }
          });
      }
    });
  }

  return Array.from(recommendedIds);
}
