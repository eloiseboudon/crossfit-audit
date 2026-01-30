import {
  ArrowLeft,
  Award,
  BarChart3,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getAudit,
  listAnswers,
  replaceRecommendations,
  upsertKpis,
  upsertScores
} from '../lib/api';
import {
  calculateAdvancedFinancialKPIs,
  calculateKPIs,
  calculateScores,
  generateRecommendations
} from '../lib/calculations';
import { getAnswerValue } from '../lib/extractData';
import { Answer, Audit } from '../lib/types';

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
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // KPIs de base et avancés
  const [kpis, setKpis] = useState<any>(null);
  const [advancedFinancialKPIs, setAdvancedFinancialKPIs] = useState<any>(null);
  const [missingEssentialFields, setMissingEssentialFields] = useState<string[]>([]);
  const [keyRatios, setKeyRatios] = useState<any>(null);

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
  };

  /**
   * Calcule tous les KPIs (basiques + avancés)
   * Sauvegarde dans SQLite pour traçabilité
   */
  const calculateAll = async (answersData: Answer[]) => {
    setCalculating(true);
    try {
      // === KPIs DE BASE ===
      const calculatedKPIs = calculateKPIs(answersData);
      setKpis(calculatedKPIs);

      const essentialQuestions: Array<{
        block: string;
        code?: string;
        codes?: string[];
        label: string;
      }> = [
        { block: 'identite_legale', code: 'raison_sociale', label: 'Raison sociale' },
        { block: 'identite_legale', code: 'annee_ouverture', label: 'Année d’ouverture' },
        { block: 'infrastructure_detaillee', code: 'surface_crossfit', label: 'Surface CrossFit' },
        { block: 'capacite_occupation', code: 'capacite_max_cours', label: 'Capacité max cours' },
        { block: 'infrastructure_detaillee', code: 'nb_places_parking', label: 'Places de parking' },
        { block: 'produits_exploitation', code: 'ca_abonnements_mensuels', label: 'CA abonnements mensuels' },
        { block: 'charges_exploitation', code: 'loyer_mensuel_ht', label: 'Loyer mensuel HT' },
        { block: 'charges_exploitation', code: 'electricite_annuel', label: 'Électricité annuelle' },
        { block: 'charges_exploitation', code: 'salaires_bruts_coachs', label: 'Salaires bruts coachs' },
        { block: 'charges_exploitation', code: 'charges_sociales_patronales', label: 'Charges sociales patronales' },
        { block: 'resultat_tresorerie', code: 'tresorerie_actuelle', label: 'Trésorerie actuelle' },
        { block: 'resultat_tresorerie', code: 'emprunts_capital_restant', label: 'Emprunts - capital restant' },
        { block: 'resultat_tresorerie', code: 'echeance_mensuelle_emprunts', label: 'Échéance mensuelle emprunts' },
        { block: 'structure_base', code: 'nb_membres_actifs_total', label: 'Membres actifs total' },
        { block: 'structure_base', code: 'nb_membres_illimite', label: 'Membres illimités' },
        { block: 'tarification_detaillee', code: 'prix_illimite_sans_engagement', label: 'Prix illimité sans engagement' },
        { block: 'acquisition_conversion', code: 'nb_essais_mois_actuel', label: 'Essais mois actuel' },
        { block: 'acquisition_conversion', code: 'nb_conversions_mois_actuel', label: 'Conversions mois actuel' },
        { block: 'retention_churn', code: 'nb_resiliations_mois_actuel', label: 'Résiliations mois actuel' },
        { block: 'retention_churn', code: 'duree_moyenne_adhesion', label: 'Durée moyenne adhésion' },
        {
          block: 'structure_planning',
          codes: ['nb_cours_lundi', 'nb_cours_mardi', 'nb_cours_mercredi', 'nb_cours_jeudi', 'nb_cours_vendredi'],
          label: 'Volume semaine (lundi à vendredi)'
        },
        { block: 'capacite_occupation', code: 'participants_moyen_cours', label: 'Participants moyens' },
        { block: 'capacite_occupation', code: 'nb_cours_complets_semaine', label: 'Cours complets semaine' },
        { block: 'structure_equipe', code: 'nb_total_coachs', label: 'Total coachs' },
        { block: 'remuneration', code: 'remuneration_coach_temps_plein', label: 'Rémunération coach temps plein' }
      ];

      const isAnswered = (value: unknown) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== null && value !== undefined && value !== '';
      };

      const getRawAnswer = (blockCode: string, questionCode: string) =>
        answersData.find((answer) => answer.block_code === blockCode && answer.question_code === questionCode)?.value;

      const missingFields = essentialQuestions
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

const INFO_DETAILS = {
  score_global:
    'Score global = somme pondérée des scores Finance (30%), Commercial & rétention (35%) et Organisation & pilotage (35%).\nDonnées: réponses de l\'audit sur chaque pilier.',
  score_finance:
    'Score Finance = 40% marge EBITDA + 20% ratio loyer/CA + 20% masse salariale/CA + 20% CA/m².\nLes sous-scores sont déterminés via les seuils internes.',
  score_clientele:
    'Score Commercial & rétention = 40% % de CA récurrent + 35% ARPM + 25% churn mensuel.\nBasé sur les données membres et revenus.',
  score_exploitation:
    'Score Organisation & pilotage = 60% taux d\'occupation global + 40% taux de conversion essai.\nBasé sur capacités et funnel.',
  ca_total_12m:
    'Somme des revenus annuels (abonnements, drop-in, PT, merchandising, autres).\nDonnées: bloc Finance > Revenus.',
  arpm:
    'ARPM = CA total annuel / 12 / nombre de membres actifs.\nDonnées: CA total + membres actifs.',
  marge_ebitda:
    'Marge EBITDA = EBITDA / CA total × 100.\nEBITDA = CA total - (charges totales hors amortissements, provisions et frais financiers).',
  churn_mensuel:
    'Churn mensuel = résiliations mensuelles / membres actifs × 100.\nDonnées: bloc Rétention & churn.',
  ca_abonnements:
    'Somme des revenus abonnements mensuels, trimestriels, semestriels et annuels.',
  pct_ca_abonnements:
    '% CA abonnements = CA abonnements / CA total × 100.',
  ca_drop_in:
    'Revenus drop-in = cartes 10/20 + séances unitaires.\nDonnées: bloc Produits/Exploitation.',
  pct_ca_drop_in:
    '% CA drop-in = CA drop-in / CA total × 100.',
  ca_personal_training:
    'Revenus Personal Training saisis dans l\'audit (coaching individuel).',
  ca_merchandising:
    'Revenus merchandising = vêtements + accessoires.',
  ebitda:
    'EBITDA calculé à partir du CA et des charges d\'exploitation (hors amortissements, provisions, frais financiers).',
  marge_ebitda_pct:
    'Marge EBITDA = EBITDA / CA total × 100.',
  resultat_net:
    'Résultat net = CA total - charges totales (incluant amortissements, provisions, frais financiers).',
  marge_nette_pct:
    'Marge nette = résultat net / CA total × 100.',
  marge_brute_pct:
    'Marge brute = (CA total - charges directes) / CA total × 100.\nCalculée à partir des charges déclarées.',
  ratio_loyer_ca_pct:
    'Ratio loyer/CA = loyer annuel / CA total × 100.',
  ratio_masse_salariale_ca_pct:
    'Ratio masse salariale/CA = masse salariale annuelle / CA total × 100.',
  ratio_marketing_ca_pct:
    'Ratio marketing/CA = dépenses marketing annuelles / CA total × 100.',
  ca_par_m2:
    'CA par m² = CA total annuel / surface totale (m²).',
  membres_actifs_total:
    'Nombre total de membres actifs saisi dans l\'audit.',
  membres_illimites:
    'Nombre de membres avec abonnement illimité saisi.',
  membres_limites:
    'Nombre de membres avec abonnement limité (2-3x/sem) saisi.',
  membres_premium:
    'Nombre de membres avec offre premium saisi.',
  leads_mois:
    'Leads mensuels saisis (demandes entrantes).',
  essais_gratuits_mois:
    'Essais gratuits mensuels saisis.',
  taux_conversion_lead_essai_pct:
    'Conversion lead → essai = essais gratuits / leads × 100 (ou taux saisi).',
  nouveaux_membres_mois:
    'Nouveaux membres mensuels (conversions essai → abonné) saisis.',
  taux_conversion_essai_membre_pct:
    'Conversion essai → membre = conversions essai / essais × 100.',
  cac_moyen:
    'CAC moyen = coût d\'acquisition moyen saisi.',
  ltv_moyen:
    'LTV estimée = ARPM × ancienneté moyenne (mois).',
  ratio_ltv_cac:
    'Ratio LTV/CAC = LTV estimée / CAC.',
  temps_retour_cac_mois:
    'Payback CAC = CAC / revenu mensuel moyen par membre (ARPM).',
  taux_retention_mensuel_pct:
    'Rétention mensuelle = 100% - churn mensuel (ou taux de renouvellement saisi).',
  taux_churn_mensuel_pct:
    'Churn mensuel = résiliations mensuelles / membres actifs × 100.',
  anciennete_moyenne_mois:
    'Ancienneté moyenne des membres (mois) saisie.',
  nps_score:
    'NPS = % promoteurs - % détracteurs (saisi dans l\'audit).',
  creneaux_semaine:
    'Nombre de créneaux par semaine saisi.',
  heures_ouverture_semaine:
    'Nombre d\'heures d\'ouverture hebdomadaires saisi.',
  seances_mois:
    'Séances mensuelles estimées à partir des créneaux hebdomadaires.',
  surface_totale_m2:
    'Surface totale déclarée (m²).',
  occupation_6h_9h_pct:
    'Taux d\'occupation 6h-9h = participants moyens / capacité × 100.',
  occupation_12h_14h_pct:
    'Taux d\'occupation 12h-14h = participants moyens / capacité × 100.',
  occupation_17h_20h_pct:
    'Taux d\'occupation 17h-20h = participants moyens / capacité × 100.',
  ca_par_seance:
    'CA par séance = CA total / nombre de séances.',
  cout_par_seance:
    'Coût par séance = charges totales / nombre de séances.',
  marge_par_seance:
    'Marge par séance = CA par séance - coût par séance.',
  ca_par_heure_ouverture:
    'CA par heure d\'ouverture = CA total / heures d\'ouverture annuelles.',
  nombre_coaches:
    'Nombre total de coachs saisi.',
  nombre_salaries_temps_plein:
    'Nombre de salariés temps plein saisi.',
  nombre_salaries_temps_partiel:
    'Nombre de salariés temps partiel saisi.',
  nombre_auto_entrepreneurs:
    'Nombre d\'auto-entrepreneurs/freelances saisi.',
  coaches_cf_l1:
    'Nombre de coachs certifiés CF Level 1 saisi.',
  coaches_cf_l2:
    'Nombre de coachs certifiés CF Level 2 saisi.',
  coaches_cf_l3:
    'Nombre de coachs certifiés CF Level 3 saisi.',
  coaches_cf_l4:
    'Nombre de coachs certifiés CF Level 4 saisi.',
  score_qualifications_moyen:
    'Score moyen de qualifications calculé à partir du niveau de certifications.',
  masse_salariale_annuelle:
    'Masse salariale annuelle totale saisie.',
  cout_moyen_coach_annuel:
    'Coût moyen par coach = masse salariale annuelle / nombre de coachs.',
  ca_par_coach_annuel:
    'CA par coach = CA total annuel / nombre de coachs.',
  nps_coaching:
    'NPS coaching saisi (promoteurs - détracteurs).',
  taux_satisfaction_membres_coaching_pct:
    'Satisfaction membres coaching (%) saisie.',
  taux_turnover_annuel_pct:
    'Turnover annuel = départs annuels / effectif moyen × 100.',
  stabilite_equipe_score:
    'Score de stabilité équipe basé sur l\'ancienneté et le turnover.'
};

function InfoTooltip({ label, details }: { label: string; details: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-tulip-blue/30 text-[10px] font-semibold text-tulip-blue/70 hover:border-tulip-blue/60 hover:text-tulip-blue"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onBlur={() => setOpen(false)}
        aria-label={`Détails du calcul: ${label}`}
      >
        i
      </button>
      {open && (
        <div className="absolute left-1/2 top-6 z-20 w-64 -translate-x-1/2 rounded-md border border-tulip-beige bg-white p-3 text-xs text-tulip-blue/80 shadow-lg whitespace-pre-line">
          {details}
        </div>
      )}
    </span>
  );
}

function InfoLabel({
  label,
  details,
  labelClassName,
  wrapperClassName
}: {
  label: string;
  details: string;
  labelClassName?: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${wrapperClassName ?? ''}`}>
      <span className={labelClassName}>{label}</span>
      <InfoTooltip label={label} details={details} />
    </div>
  );
}

/**
 * Onglet Vue d'ensemble - Score global, KPIs clés, recommandations prioritaires
 */
function OverviewTab({
  scores,
  kpis,
  recommendations,
  scenarios,
  keyRatios,
  missingEssentialFields,
  formatNumber,
  formatCurrency,
  getPriorityColor,
  getEffortIcon
}: any) {
  return (
    <div className="space-y-6">
      {/* Score Global */}
      {scores && (
        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-tulip-blue mb-6 md:mb-8 text-center">
            <span className="flex items-center justify-center gap-2">
              Score Global de Performance
              <InfoTooltip label="Score Global de Performance" details={INFO_DETAILS.score_global} />
            </span>
          </h2>
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-tulip-blue text-sm group-hover:text-tulip-green transition-colors">{score.name}</h3>
                      <InfoTooltip
                        label={`Score ${score.name}`}
                        details={
                          score.code === 'finance'
                            ? INFO_DETAILS.score_finance
                            : score.code === 'clientele'
                              ? INFO_DETAILS.score_clientele
                              : INFO_DETAILS.score_exploitation
                        }
                      />
                    </div>
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
                    <span className={`font-semibold ${score.score >= 80 ? 'text-tulip-green-success' :
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
            <InfoLabel
              label="CA Total"
              details={INFO_DETAILS.ca_total_12m}
              labelClassName="text-xs font-semibold text-tulip-blue/70 uppercase"
              wrapperClassName="mb-2"
            />
            <p className="text-2xl font-bold text-tulip-blue">{formatCurrency(kpis.ca_total_12m)}</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-tulip-blue/5 to-tulip-blue/10 border border-tulip-blue/20 rounded-card">
            <InfoLabel
              label="ARPM"
              details={INFO_DETAILS.arpm}
              labelClassName="text-xs font-semibold text-tulip-blue/70 uppercase"
              wrapperClassName="mb-2"
            />
            <p className="text-2xl font-bold text-tulip-blue">{formatCurrency(kpis.arpm)}</p>
          </div>
          <div className="p-5 bg-tulip-beige/20 border border-tulip-beige rounded-card">
            <InfoLabel
              label="Marge EBITDA"
              details={INFO_DETAILS.marge_ebitda}
              labelClassName="text-xs font-semibold text-tulip-blue/70 uppercase"
              wrapperClassName="mb-2"
            />
            <p className="text-2xl font-bold text-tulip-blue">{formatNumber(kpis.marge_ebitda, 1)}%</p>
          </div>
          <div className="p-5 bg-tulip-beige/20 border border-tulip-beige rounded-card">
            <InfoLabel
              label="Taux Churn"
              details={INFO_DETAILS.churn_mensuel}
              labelClassName="text-xs font-semibold text-tulip-blue/70 uppercase"
              wrapperClassName="mb-2"
            />
            <p className="text-2xl font-bold text-tulip-blue">{formatNumber(kpis.churn_mensuel, 1)}%</p>
          </div>
        </div>
      </div>

      {/* Ratios clés calculables */}
      {kpis && keyRatios && (
        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
            <h2 className="text-xl font-bold text-tulip-blue">📊 Ratios clés calculables</h2>
            <span className="text-xs font-medium text-tulip-blue/70 bg-tulip-beige/40 px-3 py-1 rounded-full">
              Basé sur les 25 questions essentielles
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="p-4 border border-tulip-beige/50 rounded-card bg-tulip-beige/10">
              <p className="text-xs text-tulip-blue/70 uppercase">Revenu moyen par membre</p>
              <p className="text-lg font-bold text-tulip-blue">{formatCurrency(keyRatios?.revenuePerMember ?? 0)}</p>
              <p className="text-xs text-tulip-blue/60 mt-1">CA mensuel / Nb membres</p>
            </div>
            <div className="p-4 border border-tulip-beige/50 rounded-card bg-tulip-beige/10">
              <p className="text-xs text-tulip-blue/70 uppercase">Revenu par m²</p>
              <p className="text-lg font-bold text-tulip-blue">{formatCurrency(keyRatios?.revenuePerM2 ?? 0)}</p>
              <p className="text-xs text-tulip-blue/60 mt-1">CA mensuel / Surface</p>
            </div>
            <div className="p-4 border border-tulip-beige/50 rounded-card bg-tulip-beige/10">
              <p className="text-xs text-tulip-blue/70 uppercase">Taux d’occupation</p>
              <p className="text-lg font-bold text-tulip-blue">{formatNumber(keyRatios?.occupancyRate ?? 0, 1)}%</p>
              <p className="text-xs text-tulip-blue/60 mt-1">Participants moyens / Capacité max</p>
            </div>
            <div className="p-4 border border-tulip-beige/50 rounded-card bg-tulip-beige/10">
              <p className="text-xs text-tulip-blue/70 uppercase">Taux de conversion</p>
              <p className="text-lg font-bold text-tulip-blue">{formatNumber(keyRatios?.conversionRate ?? 0, 1)}%</p>
              <p className="text-xs text-tulip-blue/60 mt-1">Conversions / Essais</p>
            </div>
            <div className="p-4 border border-tulip-beige/50 rounded-card bg-tulip-beige/10">
              <p className="text-xs text-tulip-blue/70 uppercase">Churn mensuel</p>
              <p className="text-lg font-bold text-tulip-blue">{formatNumber(keyRatios?.churnRate ?? 0, 1)}%</p>
              <p className="text-xs text-tulip-blue/60 mt-1">Résiliations / Nb membres actifs</p>
            </div>
            <div className="p-4 border border-tulip-beige/50 rounded-card bg-tulip-beige/10">
              <p className="text-xs text-tulip-blue/70 uppercase">Ratio coach/membre</p>
              <p className="text-lg font-bold text-tulip-blue">
                {formatNumber(keyRatios?.membersPerCoach ?? 0, 1)} membres/coach
              </p>
              <p className="text-xs text-tulip-blue/60 mt-1">Nb membres / Nb coachs</p>
            </div>
            <div className="p-4 border border-tulip-beige/50 rounded-card bg-tulip-beige/10">
              <p className="text-xs text-tulip-blue/70 uppercase">Masse salariale / CA</p>
              <p className="text-lg font-bold text-tulip-blue">{formatNumber(keyRatios?.payrollToRevenue ?? 0, 1)}%</p>
              <p className="text-xs text-tulip-blue/60 mt-1">Salaires + charges / CA annuel</p>
            </div>
            <div className="p-4 border border-tulip-beige/50 rounded-card bg-tulip-beige/10">
              <p className="text-xs text-tulip-blue/70 uppercase">Loyer / CA</p>
              <p className="text-lg font-bold text-tulip-blue">{formatNumber(keyRatios?.rentToRevenue ?? 0, 1)}%</p>
              <p className="text-xs text-tulip-blue/60 mt-1">Loyer mensuel / CA mensuel</p>
            </div>
            <div className="p-4 border border-tulip-beige/50 rounded-card bg-tulip-beige/10">
              <p className="text-xs text-tulip-blue/70 uppercase">Trésorerie en mois</p>
              <p className="text-lg font-bold text-tulip-blue">{formatNumber(keyRatios?.cashMonths ?? 0, 1)} mois</p>
              <p className="text-xs text-tulip-blue/60 mt-1">Trésorerie / CA mensuel moyen</p>
            </div>
          </div>
        </div>
      )}

      {kpis && !keyRatios && missingEssentialFields?.length > 0 && (
        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
          <h2 className="text-xl font-bold text-tulip-blue mb-2">📊 Ratios clés calculables</h2>
          <p className="text-sm text-tulip-blue/70">
            Renseignez les 25 questions essentielles pour afficher ces ratios. Il manque encore{' '}
            <span className="font-semibold text-tulip-blue">{missingEssentialFields.length}</span> champ(s).
          </p>
        </div>
      )}

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
                  className={`relative p-6 rounded-card border-2 transition-all ${isRecommended
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
              <InfoLabel
                label="CA Abonnements"
                details={INFO_DETAILS.ca_abonnements}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-lg font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_abonnements)}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-tulip-green">
                <span>{formatNumber(advancedKPIs.pct_ca_abonnements, 1)}%</span>
                <InfoTooltip label="% CA abonnements" details={INFO_DETAILS.pct_ca_abonnements} />
              </div>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CA Drop-in"
                details={INFO_DETAILS.ca_drop_in}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-lg font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_drop_in)}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-tulip-green">
                <span>{formatNumber(advancedKPIs.pct_ca_drop_in, 1)}%</span>
                <InfoTooltip label="% CA drop-in" details={INFO_DETAILS.pct_ca_drop_in} />
              </div>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CA Personal Training"
                details={INFO_DETAILS.ca_personal_training}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-lg font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_personal_training)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CA Merchandising"
                details={INFO_DETAILS.ca_merchandising}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-lg font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_merchandising)}</p>
            </div>
          </div>
        </div>

        {/* Marges et rentabilité */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Marges & Rentabilité</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-tulip-green/10 to-white border border-tulip-green/20 rounded-card">
              <InfoLabel
                label="EBITDA"
                details={INFO_DETAILS.ebitda}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-2"
              />
              <p className="text-2xl font-bold text-tulip-green">{formatCurrency(advancedKPIs.ebitda)}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-tulip-blue/70">
                <span>Marge: {formatNumber(advancedKPIs.marge_ebitda_pct, 1)}%</span>
                <InfoTooltip label="Marge EBITDA" details={INFO_DETAILS.marge_ebitda_pct} />
              </div>
            </div>
            <div className="p-5 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Résultat Net"
                details={INFO_DETAILS.resultat_net}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-2"
              />
              <p className="text-2xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.resultat_net)}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-tulip-blue/70">
                <span>Marge: {formatNumber(advancedKPIs.marge_nette_pct, 1)}%</span>
                <InfoTooltip label="Marge nette" details={INFO_DETAILS.marge_nette_pct} />
              </div>
            </div>
            <div className="p-5 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Marge Brute"
                details={INFO_DETAILS.marge_brute_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-2"
              />
              <p className="text-2xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.marge_brute_pct, 1)}%</p>
            </div>
          </div>
        </div>

        {/* Ratios de structure de coûts */}
        <div>
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Structure de Coûts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Ratio Loyer/CA"
                details={INFO_DETAILS.ratio_loyer_ca_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ratio_loyer_ca_pct, 1)}%</p>
              <p className="text-xs text-tulip-blue/50 mt-1">Cible: &lt;20%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Ratio MS/CA"
                details={INFO_DETAILS.ratio_masse_salariale_ca_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ratio_masse_salariale_ca_pct, 1)}%</p>
              <p className="text-xs text-tulip-blue/50 mt-1">Cible: 30-40%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Ratio Marketing/CA"
                details={INFO_DETAILS.ratio_marketing_ca_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ratio_marketing_ca_pct, 1)}%</p>
              <p className="text-xs text-tulip-blue/50 mt-1">Cible: 5-10%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CA par m²"
                details={INFO_DETAILS.ca_par_m2}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
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
              <InfoLabel
                label="Membres Actifs"
                details={INFO_DETAILS.membres_actifs_total}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-2xl font-bold text-tulip-green">{formatNumber(advancedKPIs.membres_actifs_total)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Illimités"
                details={INFO_DETAILS.membres_illimites}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.membres_illimites)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Limités"
                details={INFO_DETAILS.membres_limites}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.membres_limites)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Premium"
                details={INFO_DETAILS.membres_premium}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.membres_premium)}</p>
            </div>
          </div>
        </div>

        {/* Funnel d'acquisition */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Funnel d'Acquisition</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Leads/mois"
                details={INFO_DETAILS.leads_mois}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-2"
              />
              <p className="text-2xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.leads_mois)}</p>
            </div>
            <div className="p-5 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Essais/mois"
                details={INFO_DETAILS.essais_gratuits_mois}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-2"
              />
              <p className="text-2xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.essais_gratuits_mois)}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-tulip-green">
                <span>Conv: {formatNumber(advancedKPIs.taux_conversion_lead_essai_pct, 0)}%</span>
                <InfoTooltip label="Conversion lead → essai" details={INFO_DETAILS.taux_conversion_lead_essai_pct} />
              </div>
            </div>
            <div className="p-5 bg-tulip-green/10 rounded-card">
              <InfoLabel
                label="Nouveaux/mois"
                details={INFO_DETAILS.nouveaux_membres_mois}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-2"
              />
              <p className="text-2xl font-bold text-tulip-green">{formatNumber(advancedKPIs.nouveaux_membres_mois)}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-tulip-green">
                <span>Conv: {formatNumber(advancedKPIs.taux_conversion_essai_membre_pct, 0)}%</span>
                <InfoTooltip label="Conversion essai → membre" details={INFO_DETAILS.taux_conversion_essai_membre_pct} />
              </div>
            </div>
          </div>
        </div>

        {/* Économie unitaire */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Économie Unitaire</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CAC"
                details={INFO_DETAILS.cac_moyen}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.cac_moyen)}</p>
            </div>
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <InfoLabel
                label="LTV"
                details={INFO_DETAILS.ltv_moyen}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-green">{formatCurrency(advancedKPIs.ltv_moyen)}</p>
            </div>
            <div className="p-4 bg-tulip-blue/10 rounded-card">
              <InfoLabel
                label="Ratio LTV/CAC"
                details={INFO_DETAILS.ratio_ltv_cac}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ratio_ltv_cac, 1)}</p>
              <p className="text-xs text-tulip-blue/50 mt-1">Cible: &gt;3</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Payback CAC"
                details={INFO_DETAILS.temps_retour_cac_mois}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.temps_retour_cac_mois, 0)} mois</p>
            </div>
          </div>
        </div>

        {/* Rétention & Churn */}
        <div>
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Rétention & Churn</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <InfoLabel
                label="Rétention Mensuelle"
                details={INFO_DETAILS.taux_retention_mensuel_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-green">{formatNumber(advancedKPIs.taux_retention_mensuel_pct, 1)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Churn Mensuel"
                details={INFO_DETAILS.taux_churn_mensuel_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.taux_churn_mensuel_pct, 1)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Ancienneté Moyenne"
                details={INFO_DETAILS.anciennete_moyenne_mois}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.anciennete_moyenne_mois, 0)} mois</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="NPS Score"
                details={INFO_DETAILS.nps_score}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
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
              <InfoLabel
                label="Créneaux/semaine"
                details={INFO_DETAILS.creneaux_semaine}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.creneaux_semaine)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Heures Ouverture/sem"
                details={INFO_DETAILS.heures_ouverture_semaine}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.heures_ouverture_semaine)} h</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Séances/mois"
                details={INFO_DETAILS.seances_mois}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.seances_mois, 0)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Surface Totale"
                details={INFO_DETAILS.surface_totale_m2}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.surface_totale_m2)} m²</p>
            </div>
          </div>
        </div>

        {/* Occupation par tranche horaire */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Taux d'Occupation par Tranche Horaire</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="6h-9h (Early Morning)"
                details={INFO_DETAILS.occupation_6h_9h_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.occupation_6h_9h_pct, 0)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="12h-14h (Midi)"
                details={INFO_DETAILS.occupation_12h_14h_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.occupation_12h_14h_pct, 0)}%</p>
            </div>
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <InfoLabel
                label="17h-20h (Peak)"
                details={INFO_DETAILS.occupation_17h_20h_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-green">{formatNumber(advancedKPIs.occupation_17h_20h_pct, 0)}%</p>
            </div>
          </div>
        </div>

        {/* Productivité */}
        <div>
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Productivité</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CA/séance"
                details={INFO_DETAILS.ca_par_seance}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_par_seance)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Coût/séance"
                details={INFO_DETAILS.cout_par_seance}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.cout_par_seance)}</p>
            </div>
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <InfoLabel
                label="Marge/séance"
                details={INFO_DETAILS.marge_par_seance}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-green">{formatCurrency(advancedKPIs.marge_par_seance)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CA/heure ouverture"
                details={INFO_DETAILS.ca_par_heure_ouverture}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
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
              <InfoLabel
                label="Total Coaches"
                details={INFO_DETAILS.nombre_coaches}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-2xl font-bold text-tulip-green">{formatNumber(advancedKPIs.nombre_coaches)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Temps Plein"
                details={INFO_DETAILS.nombre_salaries_temps_plein}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.nombre_salaries_temps_plein)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Temps Partiel"
                details={INFO_DETAILS.nombre_salaries_temps_partiel}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.nombre_salaries_temps_partiel)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Auto-entrepreneurs"
                details={INFO_DETAILS.nombre_auto_entrepreneurs}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.nombre_auto_entrepreneurs)}</p>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Certifications CrossFit</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CF-L1"
                details={INFO_DETAILS.coaches_cf_l1}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.coaches_cf_l1)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CF-L2"
                details={INFO_DETAILS.coaches_cf_l2}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.coaches_cf_l2)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CF-L3"
                details={INFO_DETAILS.coaches_cf_l3}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.coaches_cf_l3)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CF-L4"
                details={INFO_DETAILS.coaches_cf_l4}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.coaches_cf_l4)}</p>
            </div>
            <div className="p-4 bg-tulip-blue/10 rounded-card">
              <InfoLabel
                label="Score Qualif."
                details={INFO_DETAILS.score_qualifications_moyen}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.score_qualifications_moyen, 0)}/100</p>
            </div>
          </div>
        </div>

        {/* Coûts RH */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Coûts RH</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Masse Salariale/an"
                details={INFO_DETAILS.masse_salariale_annuelle}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.masse_salariale_annuelle)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Coût Moyen/coach"
                details={INFO_DETAILS.cout_moyen_coach_annuel}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.cout_moyen_coach_annuel)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Ratio MS/CA"
                details={INFO_DETAILS.ratio_masse_salariale_ca_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.ratio_masse_salariale_ca_pct, 1)}%</p>
              <p className="text-xs text-tulip-blue/50 mt-1">Cible: 30-40%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="CA/coach/an"
                details={INFO_DETAILS.ca_par_coach_annuel}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatCurrency(advancedKPIs.ca_par_coach_annuel)}</p>
            </div>
          </div>
        </div>

        {/* Qualité et Performance */}
        <div>
          <h3 className="text-lg font-semibold text-tulip-blue mb-4">Qualité & Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-tulip-green/10 rounded-card">
              <InfoLabel
                label="NPS Coaching"
                details={INFO_DETAILS.nps_coaching}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-green">{formatNumber(advancedKPIs.nps_coaching, 0)}</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Satisfaction Membres"
                details={INFO_DETAILS.taux_satisfaction_membres_coaching_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.taux_satisfaction_membres_coaching_pct, 0)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Turnover/an"
                details={INFO_DETAILS.taux_turnover_annuel_pct}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.taux_turnover_annuel_pct, 0)}%</p>
            </div>
            <div className="p-4 bg-tulip-beige/20 rounded-card">
              <InfoLabel
                label="Stabilité Équipe"
                details={INFO_DETAILS.stabilite_equipe_score}
                labelClassName="text-xs text-tulip-blue/70"
                wrapperClassName="mb-1"
              />
              <p className="text-xl font-bold text-tulip-blue">{formatNumber(advancedKPIs.stabilite_equipe_score, 0)}/100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
