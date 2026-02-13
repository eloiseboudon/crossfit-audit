import {
  ArrowLeft,
  Award,
  BarChart3,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  getAudit,
  listAnswers,
  replaceRecommendations,
  upsertKpis,
  upsertScores
} from '../lib/api';
import {
  calculateAdvancedFinancialKPIs,
  calculateAdvancedClientKPIs,
  calculateAdvancedOperationalKPIs,
  calculateAdvancedHRKPIs,
  calculateFinancialHealthScore,
  calculateKPIs,
  calculateScores,
  generateRecommendations
} from '../lib/calculations';
import { essentialQuestionItems } from '../lib/essentialQuestions';
import { getAnswerValue } from '../lib/extractData';
import {
  AdvancedClientKPIs,
  AdvancedFinancialKPIs,
  AdvancedHRKPIs,
  AdvancedOperationalKPIs,
  Answer,
  Audit,
  CalculatedKPIs,
  ConfidenceLevel,
  EffortLevel,
  RecommendationOutput,
  RecommendationPriority
} from '../lib/types';
import ClienteleTab from './dashboard/components/ClienteleTab';
import FinanceTab from './dashboard/components/FinanceTab';
import OperationsTab from './dashboard/components/OperationsTab';
import OverviewTab from './dashboard/components/OverviewTab';
import RHTab from './dashboard/components/RHTab';
import { FinancialHealthScore, KeyRatios, Scores } from './dashboard/types';
import { formatCurrency, formatNumber, getEffortIcon, getPriorityColor } from './dashboard/utils';

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
  const [, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // KPIs de base et avancés
  const [kpis, setKpis] = useState<CalculatedKPIs | null>(null);
  const [advancedFinancialKPIs, setAdvancedFinancialKPIs] = useState<AdvancedFinancialKPIs | null>(null);
  const [advancedClientKPIs, setAdvancedClientKPIs] = useState<AdvancedClientKPIs | null>(null);
  const [advancedOperationalKPIs, setAdvancedOperationalKPIs] = useState<AdvancedOperationalKPIs | null>(null);
  const [advancedHRKPIs, setAdvancedHRKPIs] = useState<AdvancedHRKPIs | null>(null);
  const [financialHealthScore, setFinancialHealthScore] = useState<FinancialHealthScore | null>(null);
  const [missingEssentialFields, setMissingEssentialFields] = useState<string[]>([]);
  const [keyRatios, setKeyRatios] = useState<KeyRatios | null>(null);

  // Scores et recommandations
  const [scores, setScores] = useState<Scores | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationOutput[]>([]);
  const [scenarios, setScenarios] = useState<never[]>([]);

  // Onglet actif
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  /**
   * Calcule tous les KPIs (basiques + avancés)
   * Sauvegarde dans SQLite pour traçabilité
   */
  const calculateAll = useCallback(async (answersData: Answer[]) => {
    setCalculating(true);
    try {
      // === KPIs DE BASE ===
      const calculatedKPIs = calculateKPIs(answersData);
      setKpis(calculatedKPIs);

      const isAnswered = (value: unknown) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== null && value !== undefined && value !== '';
      };

      const getRawAnswer = (blockCode: string, questionCode: string) =>
        answersData.find((answer) => answer.block_code === blockCode && answer.question_code === questionCode)?.value;

      const missingFields = essentialQuestionItems
        .filter((question) => {
          if (question.codes) {
            return question.codes.some((code) => !isAnswered(getRawAnswer(question.block, code)));
          }
          return !isAnswered(getRawAnswer(question.block, question.code ?? ''));
        })
        .map((question) => question.label);

      setMissingEssentialFields(missingFields);

      if (missingFields.length === 0) {
        const caAbonnementsMensuels = getAnswerValue(answersData, 'produits_exploitation', 'ca_abonnements_mensuels', 0);
        const nbMembresActifs = getAnswerValue(answersData, 'structure_base', 'nb_membres_actifs_total', 0);
        const surfaceCrossfit = getAnswerValue(answersData, 'infrastructure_detaillee', 'surface_crossfit', 0);
        const capaciteMaxCours = getAnswerValue(answersData, 'capacite_occupation', 'capacite_max_cours', 0);
        const participantsMoyenCours = getAnswerValue(answersData, 'capacite_occupation', 'participants_moyen_cours', 0);
        const nbEssaisMois = getAnswerValue(answersData, 'acquisition_conversion', 'nb_essais_mois_actuel', 0);
        const nbConversionsMois = getAnswerValue(answersData, 'acquisition_conversion', 'nb_conversions_mois_actuel', 0);
        const nbResiliationsMois = getAnswerValue(answersData, 'retention_churn', 'nb_resiliations_mois_actuel', 0);
        const nbTotalCoachs = getAnswerValue(answersData, 'structure_equipe', 'nb_total_coachs', 0);
        const salairesBrutsCoachs = getAnswerValue(answersData, 'charges_exploitation', 'salaires_bruts_coachs', 0);
        const chargesSocialesPatronales = getAnswerValue(answersData, 'charges_exploitation', 'charges_sociales_patronales', 0);
        const loyerMensuelHt = getAnswerValue(answersData, 'charges_exploitation', 'loyer_mensuel_ht', 0);
        const tresorerieActuelle = getAnswerValue(answersData, 'resultat_tresorerie', 'tresorerie_actuelle', 0);

        const monthlyRevenue = caAbonnementsMensuels;
        const annualRevenueReference = monthlyRevenue * 12;
        const revenuePerMember = nbMembresActifs > 0 ? monthlyRevenue / nbMembresActifs : 0;
        const revenuePerM2 = surfaceCrossfit > 0 ? monthlyRevenue / surfaceCrossfit : 0;
        const occupancyRate = capaciteMaxCours > 0 ? (participantsMoyenCours / capaciteMaxCours) * 100 : 0;
        const conversionRate = nbEssaisMois > 0 ? (nbConversionsMois / nbEssaisMois) * 100 : 0;
        const churnRate = nbMembresActifs > 0 ? (nbResiliationsMois / nbMembresActifs) * 100 : 0;
        const membersPerCoach = nbTotalCoachs > 0 ? nbMembresActifs / nbTotalCoachs : 0;
        const payrollToRevenue = annualRevenueReference > 0
          ? ((salairesBrutsCoachs + chargesSocialesPatronales) / annualRevenueReference) * 100
          : 0;
        const rentToRevenue = monthlyRevenue > 0 ? (loyerMensuelHt / monthlyRevenue) * 100 : 0;
        const cashMonths = monthlyRevenue > 0 ? tresorerieActuelle / monthlyRevenue : 0;

        setKeyRatios({
          revenuePerMember,
          revenuePerM2,
          occupancyRate,
          conversionRate,
          churnRate,
          membersPerCoach,
          payrollToRevenue,
          rentToRevenue,
          cashMonths
        });
      } else {
        setKeyRatios(null);
      }

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

      const advClientKPIs = calculateAdvancedClientKPIs(answersData);
      setAdvancedClientKPIs(advClientKPIs);

      const advOpsKPIs = calculateAdvancedOperationalKPIs(answersData);
      setAdvancedOperationalKPIs(advOpsKPIs);

      const advHRKPIs = calculateAdvancedHRKPIs(answersData);
      setAdvancedHRKPIs(advHRKPIs);

      const healthScore = calculateFinancialHealthScore(advFinKPIs);
      setFinancialHealthScore(healthScore);

      // === SCORES ET RECOMMANDATIONS ===
      const { scores: calculatedScores, globalScore } = calculateScores(calculatedKPIs);
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
      const generatedRecommendations = generateRecommendations(calculatedKPIs, answersData);
      setRecommendations(generatedRecommendations);

      // Sauvegarder les recommandations
      const recsToInsert = generatedRecommendations.map((rec) => ({
        audit_id: auditId,
        rec_code: rec.rec_code,
        title: rec.title,
        description: rec.description,
        priority: rec.priority as RecommendationPriority,
        expected_impact_eur: rec.expected_impact_eur,
        effort_level: rec.effort_level as EffortLevel,
        confidence: rec.confidence as ConfidenceLevel,
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
  }, [auditId]);

  /**
   * Charge les données de l'audit depuis l'API SQLite
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Charger l'audit
      const auditData = await getAudit(auditId, true);

      // Charger les réponses
      const answersData = await listAnswers(auditId);

      setAudit(auditData);
      setAnswers(answersData || []);

      // Calculer les KPIs si des réponses existent
      if (answersData && answersData.length > 0) {
        await calculateAll(answersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [auditId, calculateAll]);

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, [loadData]);

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
                className={`flex items-center space-x-2 px-4 py-3 rounded-card font-medium transition-all ${isActive
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
            keyRatios={keyRatios}
            missingEssentialFields={missingEssentialFields}
            financialHealthScore={financialHealthScore}
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
            advancedKPIs={advancedClientKPIs}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'operations' && (
          <OperationsTab
            kpis={kpis}
            advancedKPIs={advancedOperationalKPIs}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'rh' && (
          <RHTab
            advancedKPIs={advancedHRKPIs}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}
