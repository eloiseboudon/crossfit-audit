import { INFO_DETAILS } from '../constants';
import { ClienteleTabProps } from '../types';
import InfoLabel from './InfoLabel';
import InfoTooltip from './InfoTooltip';

export default function ClienteleTab({ advancedKPIs, formatNumber, formatCurrency }: ClienteleTabProps) {
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
