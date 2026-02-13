import { INFO_DETAILS } from '../constants';
import { OperationsTabProps } from '../types';
import InfoLabel from './InfoLabel';

export default function OperationsTab({ advancedKPIs, formatNumber, formatCurrency }: OperationsTabProps) {
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
