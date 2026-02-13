import { COLOR_HEX } from '../../../lib/constants';
import { PillarScore, RecommendationOutput } from '../../../lib/types';
import { INFO_DETAILS } from '../constants';
import { OverviewTabProps, Scenario } from '../types';
import InfoLabel from './InfoLabel';
import InfoTooltip from './InfoTooltip';

export default function OverviewTab({
  scores,
  kpis,
  recommendations,
  scenarios,
  keyRatios,
  missingEssentialFields,
  financialHealthScore,
  formatNumber,
  formatCurrency,
  getPriorityColor,
  getEffortIcon
}: OverviewTabProps) {
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
                  <circle cx="112" cy="112" r="100" stroke={COLOR_HEX.chartTrack} strokeWidth="20" fill="none" />
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
                      <stop offset="0%" stopColor={COLOR_HEX.chartStart} />
                      <stop offset="100%" stopColor={COLOR_HEX.chartEnd} />
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
              {scores.scores.map((score: PillarScore) => (
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

      {/* Score Santé Financière */}
      {financialHealthScore && (
        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-4 md:p-6">
          <h2 className="text-xl font-bold text-tulip-blue mb-4">Score de Santé Financière</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <div className={`text-5xl font-bold ${
                financialHealthScore.score >= 70 ? 'text-tulip-green-success' :
                financialHealthScore.score >= 50 ? 'text-orange-500' : 'text-tulip-red'
              }`}>
                {formatNumber(financialHealthScore.score, 0)}
                <span className="text-lg text-tulip-blue/50 font-medium">/100</span>
              </div>
              <p className="text-sm text-tulip-blue/70 mt-1">
                {financialHealthScore.score >= 70 ? 'Bonne santé' :
                  financialHealthScore.score >= 50 ? 'Attention requise' : 'Situation critique'}
              </p>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="p-4 bg-tulip-beige/20 rounded-card">
                <p className="text-xs text-tulip-blue/70 uppercase mb-1">Rentabilité</p>
                <p className="text-xl font-bold text-tulip-blue">{formatNumber(financialHealthScore.rentabilite.score, 0)}/40</p>
                <div className="w-full bg-tulip-beige rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-tulip-green to-tulip-green-success h-2 rounded-full" style={{ width: `${(financialHealthScore.rentabilite.score / 40) * 100}%` }} />
                </div>
              </div>
              <div className="p-4 bg-tulip-beige/20 rounded-card">
                <p className="text-xs text-tulip-blue/70 uppercase mb-1">Trésorerie</p>
                <p className="text-xl font-bold text-tulip-blue">{formatNumber(financialHealthScore.tresorerie.score, 0)}/30</p>
                <div className="w-full bg-tulip-beige rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-tulip-green to-tulip-green-success h-2 rounded-full" style={{ width: `${(financialHealthScore.tresorerie.score / 30) * 100}%` }} />
                </div>
              </div>
              <div className="p-4 bg-tulip-beige/20 rounded-card">
                <p className="text-xs text-tulip-blue/70 uppercase mb-1">Structure</p>
                <p className="text-xl font-bold text-tulip-blue">{formatNumber(financialHealthScore.structure.score, 0)}/30</p>
                <div className="w-full bg-tulip-beige rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-tulip-green to-tulip-green-success h-2 rounded-full" style={{ width: `${(financialHealthScore.structure.score / 30) * 100}%` }} />
                </div>
              </div>
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
              <p className="text-xs text-tulip-blue/70 uppercase">Taux d'occupation</p>
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
            {recommendations.slice(0, 5).map((rec: RecommendationOutput, index: number) => (
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
            {scenarios.map((scenario: Scenario, index: number) => {
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
