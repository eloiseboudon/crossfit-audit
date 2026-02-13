import { INFO_DETAILS } from '../constants';
import { RHTabProps } from '../types';
import InfoLabel from './InfoLabel';

export default function RHTab({ advancedKPIs, formatNumber, formatCurrency }: RHTabProps) {
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
