import { Dumbbell, Home, LogOut, Settings, Zap } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from './lib/auth';
import AuditForm from './pages/AuditForm';
import AuthPage from './pages/AuthPage';
import CompetitorsPage from './pages/CompetitorsPage';
import Dashboard from './pages/Dashboard';
import GymForm from './pages/GymForm';
import HomePage from './pages/HomePage';
import MarketZonesPage from './pages/MarketZonesPage';
import OffersPage from './pages/OffersPage';
import SettingsPage from './pages/SettingsPage';

/**
 * Type des vues disponibles dans l'application
 * - home: Page d'accueil avec liste des salles/audits
 * - gym-form: Formulaire de création/édition de salle
 * - audit-form: Formulaire d'audit (questionnaire)
 * - dashboard: Dashboard de résultats d'audit
 * - settings: Paramètres et benchmarks
 * - zones: Gestion des zones de marché
 * - competitors: Gestion des concurrents (nécessite gymId)
 * - offers: Gestion des offres commerciales (nécessite gymId)
 */
type View = 'home' | 'gym-form' | 'audit-form' | 'dashboard' | 'settings' | 'zones' | 'competitors' | 'offers';

interface NavigationState {
  view: View;
  gymId?: string;
  auditId?: string;
}

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [nav, setNav] = useState<NavigationState>({ view: 'home' });

  const navigate = (view: View, gymId?: string, auditId?: string) => {
    setNav({ view, gymId, auditId });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tulip-beige-light via-white to-tulip-beige/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-tulip-blue to-tulip-green rounded-2xl mb-4 shadow-lg animate-pulse">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <p className="text-tulip-blue font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderView = () => {
    switch (nav.view) {
      case 'home':
        return <HomePage onNavigate={navigate} />;

      case 'gym-form':
        return <GymForm gymId={nav.gymId} onBack={() => navigate('home')} />;

      case 'audit-form':
        return (
          <AuditForm
            auditId={nav.auditId}
            onBack={() => navigate('home')}
            onViewDashboard={(auditId) => navigate('dashboard', undefined, auditId)}
          />
        );

      case 'dashboard':
        return (
          <Dashboard
            auditId={nav.auditId!}
            onBack={() => navigate('audit-form', undefined, nav.auditId)}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            onBack={() => navigate('home')}
            onNavigateToZones={() => navigate('zones')}
          />
        );

      case 'zones':
        return <MarketZonesPage onBack={() => navigate('settings')} />;

      case 'competitors':
        if (!nav.gymId) {
          console.error('[App] Competitors page requires gymId');
          return <HomePage onNavigate={navigate} />;
        }
        return (
          <CompetitorsPage
            gymId={nav.gymId}
            onBack={() => navigate('home')}
          />
        );

      case 'offers':
        if (!nav.gymId) {
          console.error('[App] Offers page requires gymId');
          return <HomePage onNavigate={navigate} />;
        }
        return (
          <OffersPage
            gymId={nav.gymId}
            onBack={() => navigate('home')}
          />
        );

      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-black/40 backdrop-blur-md border-b border-[#4F7A7E]/30 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div>
                {/* <Dumbbell className="w-6 h-6 text-[#F4F3EE]" strokeWidth={2.5} /> */}
                <img
                  src="Logo.audit.tulip.svg"
                  alt="Logo Tulip Conseil"
                  height="80"
                  width="80"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#F4F3EE] glow-text-teal flex items-center gap-2">
                  CrossFit <span className="text-[#4F7A7E]">AUDIT</span>
                  <Zap className="w-5 h-5 text-[#D6C7A1]" />
                </h1>
                <p className="text-xs text-[#D6C7A1]/80 tracking-wide">Analyse de la performance</p>
                <p className="text-sm font-bold text-[#F4F3EE] glow-text-teal font-poppins">Par Tulip Conseil</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('home')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${nav.view === 'home'
                  ? 'bg-[#4F7A7E] text-[#F4F3EE] glow-teal'
                  : 'text-[#D6C7A1] hover:text-[#F4F3EE] hover:bg-[#4F7A7E]/20 border border-transparent hover:border-[#4F7A7E]/30'
                  }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Accueil</span>
              </button>
              <button
                onClick={() => navigate('settings')}
                className={`p-2 rounded-lg text-sm font-semibold transition-all duration-300 ${nav.view === 'settings'
                  ? 'bg-[#4F7A7E] text-[#F4F3EE] glow-teal'
                  : 'text-[#D6C7A1] hover:text-[#F4F3EE] hover:bg-[#4F7A7E]/20 border border-transparent hover:border-[#4F7A7E]/30'
                  }`}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-sm font-semibold transition-all duration-300 text-tulip-red hover:text-white hover:bg-tulip-red/90 border border-transparent hover:border-tulip-red/50"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}
