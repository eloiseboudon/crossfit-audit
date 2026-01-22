import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  Users,
  Clock,
  Award,
  BarChart3,
  FileText
} from 'lucide-react';
import {
  getAudit,
  listAnswers,
  listMarketBenchmarks,
  replaceRecommendations,
  upsertKpis,
  upsertScores
} from '../lib/api';
import { Audit, Answer, MarketBenchmark } from '../lib/types';
import {
  calculateKPIs,
  calculateScores,
  generateRecommendations,
  calculateAdvancedFinancialKPIs
} from '../lib/calculations';

/**
 * Props du composant Dashboard
 */
interface DashboardProps {
  auditId: string;
  onBack: () => void;
}

/**
 * Type pour les onglets du dashboard
 * 5 onglets principaux pour organiser l'analyse
 */
type TabType = 'overview' | 'finance' | 'clientele' | 'operations' | 'rh';

/**
 * Dashboard principal - Affichage de l'analyse complète en onglets
 *
 * Structure:
 * - Vue d'ensemble: Score global + KPIs clés
 * - Finance: Analyse financière détaillée (CA, charges, marges)
 * - Clientèle: Acquisition, rétention, satisfaction
 * - Opérations: Planning, occupation, productivité
 * - RH & Coaching: Équipe, certifications, qualité
 *
 * @param auditId - ID de l'audit à afficher
 * @param onBack - Callback pour retour à la liste
 */
export default function Dashboard({ auditId, onBack }: DashboardProps) {
  // État principal
  const [audit, setAudit] = useState<Audit | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [benchmarks, setBenchmarks] = useState<MarketBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // KPIs de base et avancés
  const [kpis, setKpis] = useState<any>(null);
  const [advancedFinancialKPIs, setAdvancedFinancialKPIs] = useState<any>(null);

  // Scores et recommandations
  const [scores, setScores] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);

  // Onglet actif
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, [auditId]);

  /**
   * Charge les données de l'audit depuis l'API SQLite
   */
  const loadData = async () => {
    setLoading(true);
    try {
      // Charger l'audit
      const auditData = await getAudit(auditId, true);

      // Charger les réponses
      const answersData = await listAnswers(auditId);

      // Charger les benchmarks
      const benchmarksData = await listMarketBenchmarks();

      setAudit(auditData);
      setAnswers(answersData || []);
      setBenchmarks(benchmarksData || []);

      // Calculer les KPIs si des réponses existent
      if (answersData && answersData.length > 0) {
        await calculateAll(answersData, benchmarksData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcule tous les KPIs (basiques + avancés)
   * Sauvegarde dans SQLite pour traçabilité
   */
  const calculateAll = async (answersData: Answer[], benchmarksData: MarketBenchmark[]) => {
    setCalculating(true);
    try {
      // === KPIs DE BASE ===
      const calculatedKPIs = calculateKPIs(answersData);
      setKpis(calculatedKPIs);

      // Sauvegarder les KPIs de base
      const kpisToUpsert = Object.entries(calculatedKPIs).map(([key, value]) => ({
        audit_id: auditId,
        kpi_code: key,
        value: value as number,
        unit: key.includes('ratio') || key.includes('pourcent') || key.includes('mensuel') ||
              key.includes('conversion') || key.includes('occupation') || key.includes('marge') ? '%' : '€',
        computed_at: new Date().toISOString()
      }));
      await upsertKpis(kpisToUpsert);

      // === KPIs AVANCÉS ===
      const advFinKPIs = calculateAdvancedFinancialKPIs(calculatedKPIs, answersData);
      setAdvancedFinancialKPIs(advFinKPIs);

      // === SCORES ET RECOMMANDATIONS ===
      const { scores: calculatedScores, globalScore } = calculateScores(calculatedKPIs, benchmarksData);
      setScores({ scores: calculatedScores, globalScore });

      // Sauvegarder les scores
      const scoresToUpsert = calculatedScores.map((score) => ({
        audit_id: auditId,
        pillar_code: score.code,
        pillar_name: score.name,
        score: score.score,
        weight: score.weight,
        computed_at: new Date().toISOString(),
        details: score.details
      }));
      await upsertScores(scoresToUpsert);

      // Générer les recommandations
      const generatedRecommendations = generateRecommendations(calculatedKPIs, answersData, benchmarksData);
      setRecommendations(generatedRecommendations);

      // Sauvegarder les recommandations
      const recsToInsert = generatedRecommendations.map((rec) => ({
        audit_id: auditId,
        rec_code: rec.rec_code,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        expected_impact_eur: rec.expected_impact_eur,
        effort_level: rec.effort_level,
        confidence: rec.confidence,
        category: rec.category,
        computed_at: new Date().toISOString()
      }));
      await replaceRecommendations(auditId, recsToInsert);

      setScenarios([]);
    } catch (error) {
      console.error('Error calculating:', error);
    } finally {
      setCalculating(false);
    }
  };

  // === FONCTIONS DE FORMATAGE ===

  const formatNumber = (value: number, decimals = 0) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-tulip-red/10 text-tulip-red';
      case 'P2': return 'bg-orange-100 text-orange-700';
      case 'P3': return 'bg-tulip-blue/10 text-tulip-blue';
      default: return 'bg-tulip-beige text-tulip-blue/70';
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'S': return '🟢';
      case 'M': return '🟡';
      case 'L': return '🔴';
      default: return '';
    }
  };

  // === ÉTATS DE CHARGEMENT ===

  if (loading || calculating) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tulip-green mb-4"></div>
        <p className="text-tulip-blue/70">{calculating ? 'Calcul en cours...' : 'Chargement...'}</p>
      </div>
    );
  }

  if (!audit || !kpis) {
    return (
      <div className="text-center py-12">
        <p className="text-tulip-blue/70">Données insuffisantes pour générer le diagnostic</p>
        <button onClick={onBack} className="mt-4 text-tulip-blue hover:underline">
          Retour
        </button>
      </div>
    );
  }

  // === DÉFINITION DES ONGLETS ===

  const tabs = [
    { key: 'overview' as TabType, label: 'Vue d\'ensemble', icon: BarChart3 },
    { key: 'finance' as TabType, label: 'Finance', icon: DollarSign },
    { key: 'clientele' as TabType, label: 'Clientèle', icon: Users },
    { key: 'operations' as TabType, label: 'Opérations', icon: Clock },
    { key: 'rh' as TabType, label: 'RH & Coaching', icon: Award }
  ];

  // === RENDU PRINCIPAL ===

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-tulip-blue to-tulip-green text-white rounded-card shadow-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/20 rounded-card transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold truncate">
                Diagnostic - {audit.gym?.name}
              </h1>
              <p className="text-white/80 text-xs md:text-sm mt-1">
                Analyse complète niveau consultant expert
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-card px-3 md:px-4 py-2 shrink-0">
            <p className="text-xs text-white/80">Date d'analyse</p>
            <p className="text-xs md:text-sm font-semibold">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-card font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-tulip-blue to-tulip-green text-white shadow-md'
                    : 'bg-tulip-beige/20 text-tulip-blue hover:bg-tulip-beige/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-screen">
        {activeTab === 'overview' && (
          <OverviewTab
            scores={scores}
            kpis={kpis}
            recommendations={recommendations}
            scenarios={scenarios}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
            getPriorityColor={getPriorityColor}
            getEffortIcon={getEffortIcon}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceTab
            kpis={kpis}
            advancedKPIs={advancedFinancialKPIs}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'clientele' && (
          <ClienteleTab
            kpis={kpis}
            advancedKPIs={null}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'operations' && (
          <OperationsTab
            kpis={kpis}
            advancedKPIs={null}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'rh' && (
          <RHTab
            advancedKPIs={null}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ONGLET 1: VUE D'ENSEMBLE
// ============================================================================

/**
 * Onglet Vue d'ensemble - Score global, KPIs clés, recommandations prioritaires
 */
function OverviewTab({ scores, kpis, recommendations, scenarios, formatNumber, formatCurrency, getPriorityColor, getEffortIcon }: any) {
  return (
    <div className="space-y-6">
      {/* Score Global */}
      {scores && (
        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-tulip-blue mb-6 md:mb-8 text-center">Score Global de Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-center">
            {/* Score circulaire */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                <svg className="transform -rotate-90 w-48 h-48 md:w-56 md:h-56">
                  <circle cx="112" cy="112" r="100" stroke="#E8E2D5" strokeWidth="20" fill="none" />
                  <circle
                    cx="112"
                    cy="112"
                    r="100"
                    stroke="url(#gradient)"
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 100}`}
                    strokeDashoffset={`${2 * Math.PI * 100 * (1 - scores.globalScore / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4F7A7E" />
                      <stop offset="100%" stopColor="#8FB339" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-tulip-blue to-tulip-green bg-clip-text text-transparent">
                      {formatNumber(scores.globalScore, 0)}
                    </div>
                    <div className="text-sm text-tulip-blue/70 font-medium mt-1">/ 100</div>
                    <div className="text-xs text-tulip-blue/50 mt-2">
                      {scores.globalScore >= 80 ? 'Excellent' :
                       scores.globalScore >= 60 ? 'Bon' :
                       scores.globalScore >= 40 ? 'Moyen' : 'À améliorer'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scores par pilier */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {scores.scores.map((score: any) => (
                <div key={score.code} className="group p-5 bg-gradient-to-br from-tulip-beige/10 to-white border-2 border-tulip-beige rounded-card hover:border-tulip-green/40 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-tulip-blue text-sm group-hover:text-tulip-green transition-colors">{score.name}</h3>
                    <span className="text-2xl font-bold bg-gradient-to-r from-tulip-blue to-tulip-green bg-clip-text text-transparent">
                      {formatNumber(score.score, 0)}
                    </span>
                  </div>
                  <div className="w-full bg-tulip-beige rounded-full h-3 overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-tulip-green to-tulip-green-success h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${score.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-tulip-blue/70">Poids: {formatNumber(score.weight * 100, 0)}%</span>
                    <span className={`font-semibold ${
                      score.score >= 80 ? 'text-tulip-green-success' :
                      score.score >= 60 ? 'text-tulip-green' :
                      score.score >= 40 ? 'text-orange-500' : 'text-tulip-red'
                    }`}>
                      {score.score >= 80 ? '✓ Excellent' :
                       score.score >= 60 ? '→ Bon' :
                       score.score >= 40 ? '⚠ Moyen' : '✗ Faible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPIs Clés */}
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
        <h2 className="text-xl font-bold text-tulip-blue mb-6">Indicateurs Clés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-gradient-to-br from-tulip-green/5 to-tulip-green/10 border border-tulip-green/20 rounded-card">
            <p className="text-xs font-semibold text-tulip-blue/70 uppercase mb-2">CA Total</p>
            <p className="text-2xl font-bold text-tulip-blue">{formatCurrency(kpis.ca_total_12m)}</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-tulip-blue/5 to-tulip-blue/10 border border-tulip-blue/20 rounded-card">
            <p className="text-xs font-semibold text-tulip-blue/70 uppercase mb-2">ARPM</p>
            <p className="text-2xl font-bold text-tulip-blue">{formatCurrency(kpis.arpm)}</p>
          </div>
          <div className="p-5 bg-tulip-beige/20 border border-tulip-beige rounded-card">
            <p className="text-xs font-semibold text-tulip-blue/70 uppercase mb-2">Marge EBITDA</p>
            <p className="text-2xl font-bold text-tulip-blue">{formatNumber(kpis.marge_ebitda, 1)}%</p>
          </div>
          <div className="p-5 bg-tulip-beige/20 border border-tulip-beige rounded-card">
            <p className="text-xs font-semibold text-tulip-blue/70 uppercase mb-2">Taux Churn</p>
            <p className="text-2xl font-bold text-tulip-blue">{formatNumber(kpis.churn_mensuel, 1)}%</p>
          </div>
        </div>
      </div>

      {/* Recommandations Top 5 */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
          <h2 className="text-xl font-bold text-tulip-blue mb-6">Recommandations Prioritaires</h2>
          <div className="space-y-4">
            {recommendations.slice(0, 5).map((rec: any, index: number) => (
              <div key={index} className="p-5 border border-tulip-beige rounded-card hover:border-tulip-green/30 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    <span className="text-lg">{getEffortIcon(rec.effort_level)}</span>
                    <h3 className="font-semibold text-tulip-blue">{rec.title}</h3>
                  </div>
                  {rec.expected_impact_eur && (
                    <span className="text-tulip-green-success font-semibold whitespace-nowrap ml-4">
                      +{formatCurrency(rec.expected_impact_eur)}/an
                    </span>
                  )}
                </div>
                <p className="text-sm text-tulip-blue/70 leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scénarios de gain */}
      {scenarios.length > 0 && (
        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
          <h2 className="text-xl font-bold text-tulip-blue mb-2">Scénarios de Croissance Potentielle</h2>
          <p className="text-sm text-tulip-blue/70 mb-6">
            Estimations basées sur l'application des recommandations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenarios.map((scenario: any, index: number) => {
              const isRecommended = index === 1;
              return (
                <div
                  key={index}
                  className={`relative p-6 rounded-card border-2 transition-all ${
                    isRecommended
                      ? 'border-tulip-green bg-gradient-to-br from-tulip-green/5 to-tulip-green/10 shadow-lg'
                      : 'border-tulip-beige/50 bg-white'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-tulip-green text-white text-xs font-bold px-3 py-1 rounded-full">
                        ⭐ RECOMMANDÉ
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <h3 className={`font-bold mb-2 ${isRecommended ? 'text-tulip-green text-lg' : 'text-tulip-blue'}`}>
                      {scenario.name}
                    </h3>
                  </div>
                  <div className="bg-white rounded-card p-4 shadow-sm">
                    <p className="text-xs text-tulip-blue/70 mb-2 text-center">Gain annuel</p>
                    <p className="text-3xl font-bold text-center text-tulip-green-success">
                      {formatCurrency(scenario.total_gain_annuel)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ONGLET 2: FINANCE
// ============================================================================

function FinanceTab({ kpis, advancedKPIs, formatNumber, formatCurrency }: any) {
  if (!advancedKPIs) {
    return (
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-8">
        <h2 className="text-xl font-bold text-tulip-blue mb-4">Analyse Financière</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Données financières manquantes</h3>
              <p className="text-sm text-amber-800 mb-3">
                Pour obtenir un diagnostic financier complet, complétez les informations suivantes dans l'audit :
              </p>
              <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
                <li>Chiffre d'affaires détaillé (abonnements, drop-in, etc.)</li>
                <li>Charges fixes et variables</li>
                <li>Masse salariale annuelle</li>
                <li>Loyer et charges d'exploitation</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Comment améliorer ce diagnostic</h3>
          <p className="text-sm text-blue-800">
            Retournez dans le formulaire d'audit et remplissez la section "Finance" (Bloc 2) avec vos données financières.
            Même des estimations vous permettront d'obtenir des recommandations personnalisées.
          </p>
        </div>
      </div>
    );
  }

  const dataQuality = advancedKPIs.data_quality_score || 0;
  const hasLowQuality = dataQuality < 70;

  return (
    <div className="space-y-6">
      {hasLowQuality && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-amber-600">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 text-sm mb-1">Diagnostic partiel</h3>
              <p className="text-xs text-amber-800">
                Complétez vos données financières pour un diagnostic plus précis (qualité actuelle : {Math.round(dataQuality)}%)
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
        <h2 className="text-xl font-bold text-tulip-blue mb-6">Analyse Financière Détaillée</h2>

        {/* Chiffre d'affaires */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Structure du Chiffre d'Affaires</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CA Abonnements</p>
              <p className="text-lg font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_abonnements)}</p>
              <p className="text-xs text-tulip-green mt-1">{formatNumber(advancedKPIs.pct_ca_abonnements, 1)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CA Drop-in</p>
              <p className="text-lg font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_drop_in)}</p>
              <p className="text-xs text-tulip-green mt-1">{formatNumber(advancedKPIs.pct_ca_drop_in, 1)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CA Personal Training</p>
              <p className="text-lg font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_personal_training)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CA Merchandising</p>
              <p className="text-lg font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_merchandising)}</p>
            </div>
          </div>
        </div>

        {/* Marges et rentabilité */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Marges & Rentabilité</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-tulip-green/10 to-white border border-tulip-green/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-2">EBITDA</p>
              <p className="text-2xl font-bold text-tulip-green">{formatCurrency(advancedKPIs.ebitda)}</p>
              <p className="text-xs text-tulip-blue/70 mt-2">Marge: {formatNumber(advancedKPIs.marge_ebitda_pct, 1)}%</p>
            </div>
            <div className="p-5 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-2">Résultat Net</p>
              <p className="text-2xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.resultat_net)}</p>
              <p className="text-xs text-tulip-blue/70 mt-2">Marge: {formatNumber(advancedKPIs.marge_nette_pct, 1)}%</p>
            </div>
            <div className="p-5 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-2">Marge Brute</p>
              <p className="text-2xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.marge_brute_pct, 1)}%</p>
            </div>
          </div>
        </div>

        {/* Ratios de structure de coûts */}
        <div>
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Structure de Coûts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Ratio Loyer/CA</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ratio_loyer_ca_pct, 1)}%</p>
              <p className="text-xs text-tulip-blue/50 mt-1">Cible: &lt;20%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Ratio MS/CA</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ratio_masse_salariale_ca_pct, 1)}%</p>
              <p className="text-xs text-tulip-blue/50 mt-1">Cible: 30-40%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Ratio Marketing/CA</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ratio_marketing_ca_pct, 1)}%</p>
              <p className="text-xs text-tulip-blue/50 mt-1">Cible: 5-10%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CA par m²</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ca_par_m2, 0)} €</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ONGLET 3: CLIENTÈLE
// ============================================================================

function ClienteleTab({ kpis, advancedKPIs, formatNumber, formatCurrency }: any) {
  if (!advancedKPIs) {
    return (
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-8">
        <h2 className="text-xl font-bold text-tulip-blue mb-4">Analyse Clientèle</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Données clientèle manquantes</h3>
              <p className="text-sm text-amber-800 mb-3">
                Pour obtenir un diagnostic clientèle complet, complétez les informations suivantes dans l'audit :
              </p>
              <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
                <li>Nombre de membres actifs</li>
                <li>Répartition par type d'abonnement</li>
                <li>Taux de conversion et d'acquisition</li>
                <li>Taux de churn et rétention</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Comment améliorer ce diagnostic</h3>
          <p className="text-sm text-blue-800">
            Retournez dans le formulaire d'audit et remplissez la section "Clientèle" (Bloc 3) avec vos données membres.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
        <h2 className="text-xl font-bold text-tulip-blue mb-6">Analyse Clientèle & Commercial</h2>

        {/* Base membres */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Base Membres</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Membres Actifs</p>
              <p className="text-2xl font-bold text-tulip-green">{formatNumber(advancedKPIs.membres_actifs_total)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Illimités</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.membres_illimites)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Limités</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.membres_limites)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Premium</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.membres_premium)}</p>
            </div>
          </div>
        </div>

        {/* Funnel d'acquisition */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Funnel d'Acquisition</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-2">Leads/mois</p>
              <p className="text-2xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.leads_mois)}</p>
            </div>
            <div className="p-5 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-2">Essais/mois</p>
              <p className="text-2xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.essais_gratuits_mois)}</p>
              <p className="text-xs text-tulip-green mt-1">Conv: {formatNumber(advancedKPIs.taux_conversion_lead_essai_pct, 0)}%</p>
            </div>
            <div className="p-5 bg-tulip-green/10 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-2">Nouveaux/mois</p>
              <p className="text-2xl font-bold text-tulip-green">{formatNumber(advancedKPIs.nouveaux_membres_mois)}</p>
              <p className="text-xs text-tulip-green mt-1">Conv: {formatNumber(advancedKPIs.taux_conversion_essai_membre_pct, 0)}%</p>
            </div>
          </div>
        </div>

        {/* Économie unitaire */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Économie Unitaire</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CAC</p>
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.cac_moyen)}</p>
            </div>
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">LTV</p>
              <p className="text-xl font-bold text-tulip-green">{formatCurrency(advancedKPIs.ltv_moyen)}</p>
            </div>
            <div className="p-4 bg-tulip-blue/10 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Ratio LTV/CAC</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ratio_ltv_cac, 1)}</p>
              <p className="text-xs text-tulip-blue/50 mt-1">Cible: &gt;3</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Payback CAC</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.temps_retour_cac_mois, 0)} mois</p>
            </div>
          </div>
        </div>

        {/* Rétention & Churn */}
        <div>
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Rétention & Churn</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Rétention Mensuelle</p>
              <p className="text-xl font-bold text-tulip-green">{formatNumber(advancedKPIs.taux_retention_mensuel_pct, 1)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Churn Mensuel</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.taux_churn_mensuel_pct, 1)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Ancienneté Moyenne</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.anciennete_moyenne_mois, 0)} mois</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">NPS Score</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.nps_score, 0)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ONGLET 4: OPÉRATIONS
// ============================================================================

function OperationsTab({ kpis, advancedKPIs, formatNumber, formatCurrency }: any) {
  if (!advancedKPIs) {
    return (
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-8">
        <h2 className="text-xl font-bold text-tulip-blue mb-4">Analyse Opérationnelle</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Données opérationnelles manquantes</h3>
              <p className="text-sm text-amber-800 mb-3">
                Pour obtenir un diagnostic opérationnel complet, complétez les informations suivantes dans l'audit :
              </p>
              <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
                <li>Surface totale et capacité des installations</li>
                <li>Planning et nombre de créneaux</li>
                <li>Taux d'occupation et utilisation</li>
                <li>Équipements disponibles</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Comment améliorer ce diagnostic</h3>
          <p className="text-sm text-blue-800">
            Retournez dans le formulaire d'audit et remplissez la section "Opérations" (Bloc 4) avec vos données d'exploitation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
        <h2 className="text-xl font-bold text-tulip-blue mb-6">Analyse Opérationnelle</h2>

        {/* Planning & Volume */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Planning & Volume</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Créneaux/semaine</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.creneaux_semaine)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Heures Ouverture/sem</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.heures_ouverture_semaine)} h</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Séances/mois</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.seances_mois, 0)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Surface Totale</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.surface_totale_m2)} m²</p>
            </div>
          </div>
        </div>

        {/* Occupation par tranche horaire */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Taux d'Occupation par Tranche Horaire</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">6h-9h (Early Morning)</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.occupation_6h_9h_pct, 0)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">12h-14h (Midi)</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.occupation_12h_14h_pct, 0)}%</p>
            </div>
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">17h-20h (Peak)</p>
              <p className="text-xl font-bold text-tulip-green">{formatNumber(advancedKPIs.occupation_17h_20h_pct, 0)}%</p>
            </div>
          </div>
        </div>

        {/* Productivité */}
        <div>
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Productivité</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CA/séance</p>
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_par_seance)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Coût/séance</p>
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.cout_par_seance)}</p>
            </div>
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Marge/séance</p>
              <p className="text-xl font-bold text-tulip-green">{formatCurrency(advancedKPIs.marge_par_seance)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CA/heure ouverture</p>
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_par_heure_ouverture)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ONGLET 5: RH & COACHING
// ============================================================================

function RHTab({ advancedKPIs, formatNumber, formatCurrency }: any) {
  if (!advancedKPIs) {
    return (
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-8">
        <h2 className="text-xl font-bold text-tulip-blue mb-4">Analyse RH & Coaching</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Données RH manquantes</h3>
              <p className="text-sm text-amber-800 mb-3">
                Pour obtenir un diagnostic RH complet, complétez les informations suivantes dans l'audit :
              </p>
              <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
                <li>Nombre de coaches et structure d'équipe</li>
                <li>Masse salariale et rémunérations</li>
                <li>Heures de coaching et productivité</li>
                <li>Formation et développement</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Comment améliorer ce diagnostic</h3>
          <p className="text-sm text-blue-800">
            Retournez dans le formulaire d'audit et remplissez la section "RH & Coaching" (Bloc 5) avec vos données équipe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
        <h2 className="text-xl font-bold text-tulip-blue mb-6">Analyse RH & Coaching</h2>

        {/* Structure équipe */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Structure de l'Équipe</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Total Coaches</p>
              <p className="text-2xl font-bold text-tulip-green">{formatNumber(advancedKPIs.nombre_coaches)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Temps Plein</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.nombre_salaries_temps_plein)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Temps Partiel</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.nombre_salaries_temps_partiel)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Auto-entrepreneurs</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.nombre_auto_entrepreneurs)}</p>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Certifications CrossFit</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CF-L1</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.coaches_cf_l1)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CF-L2</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.coaches_cf_l2)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CF-L3</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.coaches_cf_l3)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CF-L4</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.coaches_cf_l4)}</p>
            </div>
            <div className="p-4 bg-tulip-blue/10 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Score Qualif.</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.score_qualifications_moyen, 0)}/100</p>
            </div>
          </div>
        </div>

        {/* Coûts RH */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Coûts RH</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Masse Salariale/an</p>
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.masse_salariale_annuelle)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Coût Moyen/coach</p>
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.cout_moyen_coach_annuel)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Ratio MS/CA</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ratio_masse_salariale_ca_pct, 1)}%</p>
              <p className="text-xs text-tulip-blue/50 mt-1">Cible: 30-40%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">CA/coach/an</p>
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_par_coach_annuel)}</p>
            </div>
          </div>
        </div>

        {/* Qualité et Performance */}
        <div>
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Qualité & Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">NPS Coaching</p>
              <p className="text-xl font-bold text-tulip-green">{formatNumber(advancedKPIs.nps_coaching, 0)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Satisfaction Membres</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.taux_satisfaction_membres_coaching_pct, 0)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Turnover/an</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.taux_turnover_annuel_pct, 0)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <p className="text-xs text-tulip-blue/70 mb-1">Stabilité Équipe</p>
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.stabilite_equipe_score, 0)}/100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
