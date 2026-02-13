import { INFO_DETAILS } from '../constants';
import { FinanceTabProps } from '../types';
import InfoLabel from './InfoLabel';
import InfoTooltip from './InfoTooltip';

export default function FinanceTab({ advancedKPIs, formatNumber, formatCurrency }: FinanceTabProps) {
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
