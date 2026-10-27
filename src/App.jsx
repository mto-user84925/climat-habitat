import React, { useState } from 'react';
import Header from './components/Header';
import HeroSearch from './components/HeroSearch';
import ClimateQuiz from './components/ClimateQuiz';
import Dashboard from './components/Dashboard';
import { fetchGeorisquesData, fetchClimadiagData } from './services/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState(0); // 0: Search, 1: Quiz Sensibilisation, 2: Bilan Dashboard
  const [addressData, setAddressData] = useState(null);
  const [georisques, setGeorisques] = useState(null);
  const [climadiag, setClimadiag] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // When an address is selected from BAN
  const handleSelectAddress = async (selectedAddress) => {
    setAddressData(selectedAddress);
    setIsLoading(true);

    const [lon, lat] = selectedAddress.coordinates;
    const insee = selectedAddress.citycode;

    try {
      // Parallel fetch: Georisques (current risks) + Climadiag (2050 projections)
      const [geoRes, climaRes] = await Promise.allSettled([
        fetchGeorisquesData(lon, lat, insee),
        fetchClimadiagData(insee)
      ]);

      setGeorisques(geoRes.status === 'fulfilled' ? geoRes.value : null);
      setClimadiag(climaRes.status === 'fulfilled' ? climaRes.value : null);
      setStep(1); // Go to Quiz Sensibilisation
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishQuiz = (result) => {
    setQuizResult(result);
    setStep(2); // Go to Final Dashboard
  };

  const handleReset = () => {
    setStep(0);
    setAddressData(null);
    setGeorisques(null);
    setClimadiag(null);
    setQuizResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020b3b] text-slate-100 selection:bg-brand-accent selection:text-white">
      
      {/* Header */}
      <Header onReset={handleReset} currentStep={step} />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-[#020b3b]/85 backdrop-blur-md flex flex-col items-center justify-center text-white">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <img 
                src="/logo_meteo_climat_pro.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain absolute inset-0 m-auto" 
              />
            </div>
            <h3 className="text-lg font-bold mt-4 tracking-tight">
              Analyse territoriale de votre adresse...
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm text-center">
              Interrogation des bases officielles Géorisques & Météo-France Climadiag 2050.
            </p>
          </div>
        )}

        {/* Step 0: Hero Search */}
        {step === 0 && (
          <HeroSearch onSelectAddress={handleSelectAddress} />
        )}

        {/* Step 1: Quiz Sensibilisation & Connaissances Climat */}
        {step === 1 && addressData && (
          <ClimateQuiz
            addressData={addressData}
            onFinishQuiz={handleFinishQuiz}
          />
        )}

        {/* Step 2: Final Comprehensive Dashboard */}
        {step === 2 && addressData && (
          <Dashboard
            addressData={addressData}
            georisques={georisques}
            climadiag={climadiag}
            quizResult={quizResult}
            onRestart={handleReset}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="no-print border-t border-white/10 py-6 px-4 text-center text-xs text-slate-400 bg-black/20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo_meteo_climat_pro.png" alt="Météo-Climat Pro" className="h-6 w-auto object-contain" />
            <span className="font-semibold text-slate-300">ClimatHabitat</span>
            <span>— Réalisé par Météo-Climat Pro</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Données souveraines : Base Adresse Nationale • Géorisques • Météo-France Climadiag Commune
          </div>
        </div>
      </footer>

    </div>
  );
}
