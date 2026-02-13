import {
  AdvancedClientKPIs,
  AdvancedFinancialKPIs,
  AdvancedHRKPIs,
  AdvancedOperationalKPIs,
  CalculatedKPIs,
  PillarScore,
  RecommendationOutput
} from '../../lib/types';

export interface FormatUtils {
  formatNumber: (value: number, decimals?: number) => string;
  formatCurrency: (value: number) => string;
}

export interface FinancialHealthScore {
  score: number;
  rentabilite: { score: number; marge_ebitda_score: number; marge_nette_score: number };
  tresorerie: { score: number; jours_tresorerie_score: number; ratio_liquidite_score: number };
  structure: { score: number; ratio_loyer_score: number; ratio_ms_score: number; ratio_endettement_score: number };
}

export interface KeyRatios {
  revenuePerMember: number;
  revenuePerM2: number;
  occupancyRate: number;
  conversionRate: number;
  churnRate: number;
  membersPerCoach: number;
  payrollToRevenue: number;
  rentToRevenue: number;
  cashMonths: number;
}

export interface Scores {
  scores: PillarScore[];
  globalScore: number;
}

export interface Scenario {
  name: string;
  total_gain_annuel: number;
}

export interface OverviewTabProps extends FormatUtils {
  scores: Scores | null;
  kpis: CalculatedKPIs;
  recommendations: RecommendationOutput[];
  scenarios: Scenario[];
  keyRatios: KeyRatios | null;
  missingEssentialFields: string[];
  financialHealthScore: FinancialHealthScore | null;
  getPriorityColor: (priority: string) => string;
  getEffortIcon: (effort: string) => string;
}

export interface FinanceTabProps extends FormatUtils {
  kpis: CalculatedKPIs;
  advancedKPIs: AdvancedFinancialKPIs | null;
}

export interface ClienteleTabProps extends FormatUtils {
  kpis: CalculatedKPIs;
  advancedKPIs: AdvancedClientKPIs | null;
}

export interface OperationsTabProps extends FormatUtils {
  kpis: CalculatedKPIs;
  advancedKPIs: AdvancedOperationalKPIs | null;
}

export interface RHTabProps extends FormatUtils {
  advancedKPIs: AdvancedHRKPIs | null;
}
