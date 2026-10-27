/**
 * Services API 100% Token 0 pour ClimatHabitat
 * - API Adresse BAN (data.gouv.fr)
 * - API Géorisques (Ministère de la Transition Écologique / BRGM)
 * - Projections Climatiques Météo-France Climadiag Commune
 */

export async function searchAddress(query) {
  if (!query || query.trim().length < 3) return [];
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=6`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erreur API Adresse');
    const data = await res.json();
    return (data.features || []).map(f => ({
      label: f.properties.label,
      street: f.properties.name,
      city: f.properties.city,
      postcode: f.properties.postcode,
      citycode: f.properties.citycode, // Code INSEE
      context: f.properties.context,
      coordinates: f.geometry.coordinates // [lon, lat]
    }));
  } catch (err) {
    console.error('Erreur recherche adresse:', err);
    return [];
  }
}

export async function fetchGeorisquesData(lon, lat, insee) {
  const results = {
    rga: { level: 'Non renseigné', code: '0' },
    gaspar: [],
    catnat: { total: 0, items: [] },
    radon: { level: 1 },
    seisme: { zone: '1', label: 'Très faible' }
  };

  try {
    // 1. Retrait-gonflement des argiles (RGA)
    const rgaPromise = fetch(`https://georisques.gouv.fr/api/v1/rga?latlon=${lon},${lat}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.exposition) {
          results.rga = {
            level: d.exposition,
            code: d.codeExposition || '1'
          };
        }
      }).catch(() => {});

    // 2. Risques Gaspar (inondations, mouvements, etc.)
    const gasparPromise = fetch(`https://georisques.gouv.fr/api/v1/gaspar/risques?latlon=${lon},${lat}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.data && d.data[0] && d.data[0].risques_detail) {
          results.gaspar = d.data[0].risques_detail.map(rd => ({
            num: rd.num_risque,
            label: rd.libelle_risque_long
          }));
        }
      }).catch(() => {});

    // 3. Arrêtés CatNat de la commune
    const catnatPromise = fetch(`https://georisques.gouv.fr/api/v1/gaspar/catnat?code_insee=${insee}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.data) {
          results.catnat = {
            total: d.data.length,
            items: d.data.slice(0, 10).map(cn => ({
              risk: cn.libelle_risque_jo,
              start: cn.date_debut_evt,
              end: cn.date_fin_evt
            }))
          };
        }
      }).catch(() => {});

    // 4. Radon
    const radonPromise = fetch(`https://georisques.gouv.fr/api/v1/radon?code_insee=${insee}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.data && d.data[0]) {
          results.radon = { level: d.data[0].classe_potentiel || 1 };
        }
      }).catch(() => {});

    // 5. Zonage sismique
    const seismePromise = fetch(`https://georisques.gouv.fr/api/v1/zonage_sismique?code_insee=${insee}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.data && d.data[0]) {
          results.seisme = {
            zone: d.data[0].code_zone || '1',
            label: d.data[0].zone_sismicite || '1 - Très faible'
          };
        }
      }).catch(() => {});

    await Promise.allSettled([rgaPromise, gasparPromise, catnatPromise, radonPromise, seismePromise]);
  } catch (err) {
    console.error('Erreur chargement Géorisques:', err);
  }

  return results;
}

export function normalizeInsee(code) {
  if (!code) return code;
  // Marseille arrondissements 13201..13216 -> 13055
  if (/^132(0[1-9]|1[0-6])$/.test(code)) return '13055';
  // Paris arrondissements 75101..75120 -> 75056
  if (/^751(0[1-9]|1[0-9]|20)$/.test(code)) return '75056';
  // Lyon arrondissements 69381..69389 -> 69123
  if (/^6938[1-9]$/.test(code)) return '69123';
  return code;
}

export async function fetchClimadiagData(insee) {
  try {
    const safeInsee = normalizeInsee(insee);
    const res = await fetch(`/api/climat?insee=${safeInsee}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return formatClimadiagIndicators(data);
  } catch (err) {
    console.warn('Erreur récupération Climadiag Commune:', err);
    return null;
  }
}

/**
 * Formate et extrait les indicateurs clés Météo-France
 * - G1 : Températures moyennes annuelles et été
 * - G2 : Jours de gel (<0°C)
 * - S1 : Jours très chauds (>35°C)
 * - S2 : Nuits chaudes / tropicales (>20°C)
 * - G3 : Cumuls de précipitations
 * - G4 : Jours de pluie
 */
export function formatClimadiagIndicators(raw) {
  if (!raw || !raw.indicateurs) return null;

  const indicatorsMap = {};
  raw.indicateurs.forEach(ind => {
    indicatorsMap[ind.id] = ind;
  });

  // Horizon index : 0 = +2°C (2030), 1 = +2.7°C (2050), 2 = +4°C (2100)
  const parseHorizon = (indId, horizonIndex = 1) => {
    const ind = indicatorsMap[indId];
    if (!ind || !ind.data || !ind.data[horizonIndex]) return null;
    return ind.data[horizonIndex];
  };

  return {
    raw,
    communeName: raw.nom,
    insee: raw.identifiant_insee,
    departement: raw.nom_departement,
    altitude: raw.alt_moyenne || 150,
    getHorizonData: (horizonIndex) => {
      // Horizon 0: 2030 (+2°C), Horizon 1: 2050 (+2.7°C), Horizon 2: 2100 (+4°C)
      const g1 = parseHorizon('G1', horizonIndex); // Température
      const g2 = parseHorizon('G2', horizonIndex); // Jours de gel
      const s1 = parseHorizon('S1', horizonIndex); // Canicule > 35°C
      const s2 = parseHorizon('S2', horizonIndex); // Nuits > 20°C
      const g3 = parseHorizon('G3', horizonIndex); // Précipitations
      const g4 = parseHorizon('G4', horizonIndex); // Jours pluie
      const r1 = parseHorizon('R1', horizonIndex); // Pluies intenses > 20mm
      const r2 = parseHorizon('R2', horizonIndex); // Jours consécutifs sans pluie (sécheresse)
      const s3 = parseHorizon('S3', horizonIndex); // Durée max vague de chaleur
      const t1 = parseHorizon('T1', horizonIndex); // Inconfort thermique estival / rafraîchissement
      const ag3 = parseHorizon('AG3', horizonIndex); // DJU Chauffage / Températures cumulées
      const ag4 = parseHorizon('AG4', horizonIndex); // Sévérité sécheresse végétale / feux

      // Température moyenne été & hiver
      const eteItem = g1 ? g1.find(i => i.label === 'été') : null;
      const hiverItem = g1 ? g1.find(i => i.label === 'hiver') : null;

      const refRainTotal = g3 ? Math.round(g3.reduce((acc, curr) => acc + (curr.ref || 0), 0)) : 0;
      const futureRainTotal = g3 ? Math.round(g3.reduce((acc, curr) => acc + (curr.mean || 0), 0)) : 0;

      return {
        horizonIndex,
        horizonLabel: horizonIndex === 0 ? '2030 (+2°C)' : horizonIndex === 1 ? '2050 (+2,7°C)' : '2100 (+4°C)',
        g1Seasons: g1 || [],
        g3Seasons: g3 || [],
        g4RainDays: g4 || [],
        tempEte: eteItem ? {
          ref: eteItem.ref,
          future: Math.round(eteItem.mean * 10) / 10,
          diff: Math.round((eteItem.mean - eteItem.ref) * 10) / 10
        } : null,
        tempHiver: hiverItem ? {
          ref: hiverItem.ref,
          future: Math.round(hiverItem.mean * 10) / 10,
          diff: Math.round((hiverItem.mean - hiverItem.ref) * 10) / 10
        } : null,
        joursGel: g2 && g2[0] ? {
          ref: Math.round(g2[0].ref),
          future: Math.round(g2[0].mean),
          diff: Math.round(g2[0].mean - g2[0].ref)
        } : null,
        joursCanicule: s1 && s1[0] ? {
          ref: Math.round(s1[0].ref * 10) / 10,
          future: Math.round(s1[0].mean * 10) / 10,
          diff: Math.round((s1[0].mean - s1[0].ref) * 10) / 10
        } : null,
        nuitsTropicales: s2 && s2[0] ? {
          ref: Math.round(s2[0].ref * 10) / 10,
          future: Math.round(s2[0].mean * 10) / 10,
          diff: Math.round((s2[0].mean - s2[0].ref) * 10) / 10
        } : null,
        precipitations: {
          refTotal: refRainTotal,
          futureTotal: futureRainTotal,
          diffPercent: refRainTotal > 0 ? Math.round(((futureRainTotal - refRainTotal) / refRainTotal) * 100) : 0
        },
        extremeRain: r1 ? {
          refTotal: Math.round(r1.reduce((acc, c) => acc + (c.ref || 0), 0) * 10) / 10,
          futureTotal: Math.round(r1.reduce((acc, c) => acc + (c.mean || 0), 0) * 10) / 10
        } : null,
        dryStreak: r2 && r2[0] ? {
          ref: Math.round(r2[0].ref),
          future: Math.round(r2[0].mean),
          diff: Math.round(r2[0].mean - r2[0].ref)
        } : null,
        heatwaveStreak: s3 && s3[0] ? {
          ref: Math.round(s3[0].ref * 10) / 10,
          future: Math.round(s3[0].mean * 10) / 10,
          diff: Math.round((s3[0].mean - s3[0].ref) * 10) / 10
        } : null,
        thermalDiscomfort: t1 && t1[0] ? {
          ref: Math.round(t1[0].ref),
          future: Math.round(t1[0].mean),
          diff: Math.round(t1[0].mean - t1[0].ref)
        } : null,
        heatingDemand: ag3 && ag3[0] ? {
          ref: Math.round(ag3[0].ref),
          future: Math.round(ag3[0].mean)
        } : null,
        wildfireIndex: ag4 && ag4[0] ? {
          ref: Math.round(ag4[0].ref * 10) / 10,
          future: Math.round(ag4[0].mean * 10) / 10
        } : null
      };
    }
  };
}
