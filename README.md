# 🏠 ClimatHabitat (par Météo-Climat Pro)

> **Le diagnostic vulnérabilité & projections climatiques 2050 de votre logement**

Application web souveraine, moderne et 100% Token 0 pour évaluer la vulnérabilité d'un logement face aux risques naturels (inondation, sécheresse/argiles) et projeter les impacts climatiques locaux d'ici 2050.

---

## 🚀 Fonctionnalités Clés

1. **Recherche d'adresse souveraine (BAN - Base Adresse Nationale)** :
   * Autocomplétion officielle `api-adresse.data.gouv.fr` sans clé API ni carte bancaire.
   * Précision par numéro de rue, coordonnées GPS et code INSEE.

2. **Diagnostic des Risques Immédiats (Géorisques)** :
   * Exposition au retrait-gonflement des argiles (RGA / sécheresse).
   * Risques de submersion marine, crues et ruissellements (Gaspar).
   * Zonage sismique et potentiel radon.
   * Historique des arrêtés de catastrophe naturelle (CatNat) de la commune.

3. **Projections Climatiques Météo-France (Climadiag Commune)** :
   * Horizons 2030 (+2°C), 2050 (+2,7°C) et 2100 (+4°C).
   * Évolution des journées caniculaires (> 35°C) et nuits tropicales (> 20°C).
   * Évolution des températures estivales, du gel et de la pluviométrie.

4. **Maison 3D Interactive (Spline)** :
   * Modèle 3D immersif pour inspecter visuellement les points de vulnérabilité du bâti.
   * Questionnaire par éléments (sols, menuiseries, chauffage, toitures, fondations).

5. **Plan d'Actions & 19 Fiches Travaux BTP** :
   * Recommandations techniques certifiées (batardeaux, clapets, surélévation, étanchéité).
   * Fiches détaillées consultables en direct.
   * Export et impression du Bilan Expert officiel signé Météo-Climat Pro.

---

## 🛠️ Démarrage Local

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement (port 5173)
npm run dev

# Build de production
npm run build
```

---

## ☁️ Déploiement Vercel en 1 clic

Le projet est configuré nativement pour Vercel via `vercel.json` :
1. Créez un dépôt GitHub et poussez le dossier `climat-habitat`.
2. Connectez le dépôt sur Vercel.
3. Le déploiement est automatique en quelques secondes !
