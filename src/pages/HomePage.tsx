import { Activity, Calendar, Dumbbell, Edit, Filter, Plus, Target, Trash2, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createAudit, listAudits, listGyms, deleteAudit as removeAudit, deleteGym as removeGym } from '../lib/api';
import { AUDIT_STATUS_BADGE_CLASSES, AUDIT_STATUS_LABELS, COLOR_CLASSES } from '../lib/constants';
import { Audit, AuditStatus, Gym } from '../lib/types';

// Type View from App.tsx
type View = 'home' | 'gym-form' | 'audit-form' | 'dashboard' | 'settings' | 'zones' | 'competitors' | 'offers';

interface HomePageProps {
  onNavigate: (view: View, gymId?: string, auditId?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const gymsData = await listGyms();
      const auditsData = await listAudits(true);

      setGyms(gymsData || []);
      setAudits(auditsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // KPIs d'accueil basés sur l'état des audits.
  const stats = {
    totalGyms: gyms.length,
    totalAudits: audits.length,
    auditsInProgress: audits.filter(
      (audit) => audit.status === AuditStatus.IN_PROGRESS || audit.status === AuditStatus.DRAFT
    ).length,
    auditsCompleted: audits.filter((audit) => audit.status === AuditStatus.COMPLETED).length,
  };

  // Filtre métier pour afficher les audits selon leur statut.
  const filteredAudits = filterStatus === 'all'
    ? audits
    : audits.filter(a => a.status === filterStatus);

  const deleteGym = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ? Tous les audits associés seront également supprimés.')) {
      return;
    }
    await removeGym(id);
    loadData();
  };

  const deleteAudit = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet audit ?')) {
      return;
    }
    await removeAudit(id);
    loadData();
  };

  const getStatusBadge = (status: string) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${AUDIT_STATUS_BADGE_CLASSES[status as keyof typeof AUDIT_STATUS_BADGE_CLASSES]}`}
      >
        {AUDIT_STATUS_LABELS[status as keyof typeof AUDIT_STATUS_LABELS]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${COLOR_CLASSES.borderPrimary}`}></div>
          <Zap className={`w-6 h-6 ${COLOR_CLASSES.textSecondary} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 md:px-0">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Salles */}
        <div className={`relative group bg-white border-l-4 ${COLOR_CLASSES.borderPrimary} rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
          <div className="stat-icon absolute top-5 right-5 text-5xl opacity-5">🏋️</div>
          <div className="relative">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 opacity-80 ${COLOR_CLASSES.textPrimary}`}>Salles</p>
            <p className={`text-5xl font-bold ${COLOR_CLASSES.textPrimary}`}>{stats.totalGyms}</p>
          </div>
        </div>

        {/* Audits Total */}
        <div className={`relative group bg-white border-l-4 ${COLOR_CLASSES.borderSecondary} rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
          <div className="stat-icon absolute top-5 right-5 text-5xl opacity-5">📊</div>
          <div className="relative">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 opacity-80 ${COLOR_CLASSES.textSecondary}`}>Audits Total</p>
            <p className={`text-5xl font-bold ${COLOR_CLASSES.textPrimary}`}>{stats.totalAudits}</p>
          </div>
        </div>

        {/* En Cours */}
        <div className={`relative group bg-white border-l-4 ${COLOR_CLASSES.borderAccent} rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
          <div className="stat-icon absolute top-5 right-5 text-5xl opacity-5">📈</div>
          <div className="relative">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 opacity-80 ${COLOR_CLASSES.textAccent}`}>En Cours</p>
            <p className={`text-5xl font-bold ${COLOR_CLASSES.textPrimary}`}>{stats.auditsInProgress}</p>
          </div>
        </div>

        {/* Finalisés */}
        <div className={`relative group bg-white border-l-4 ${COLOR_CLASSES.borderSuccess} rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
          <div className="stat-icon absolute top-5 right-5 text-5xl opacity-5">✓</div>
          <div className="relative">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 opacity-80 ${COLOR_CLASSES.textSuccess}`}>Finalisés</p>
            <p className={`text-5xl font-bold ${COLOR_CLASSES.textPrimary}`}>{stats.auditsCompleted}</p>
          </div>
        </div>
      </div>

      {/* Salles de CrossFit Section */}
      <div className={`bg-white rounded-xl shadow-md p-6 border-b-2 ${COLOR_CLASSES.borderNeutral}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b-2 ${COLOR_CLASSES.borderNeutral}`}>
          <div>
            <h2 className={`text-2xl font-semibold mb-1 ${COLOR_CLASSES.textPrimary}`}>Salles de CrossFit</h2>
            <p className={`text-sm ${COLOR_CLASSES.textSecondary}`}>Gérez vos salles et créez des audits</p>
          </div>
          <button
            onClick={() => onNavigate('gym-form')}
            className={`flex items-center justify-center space-x-2 px-5 py-3 ${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.textNeutral} rounded-lg ${COLOR_CLASSES.hoverBgPrimaryDark} transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-semibold`}
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle salle</span>
          </button>
        </div>

        {gyms.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-5 opacity-20">🏋️</div>
            <h3 className={`text-xl font-semibold mb-3 ${COLOR_CLASSES.textPrimary}`}>Commencez votre premier audit</h3>
            <p className={`mb-8 max-w-md mx-auto ${COLOR_CLASSES.textSecondary}`}>
              Ajoutez une salle de CrossFit pour démarrer l'analyse et découvrir les opportunités d'optimisation
            </p>
            <button
              onClick={() => onNavigate('gym-form')}
              className={`inline-flex items-center space-x-2 px-6 py-3 ${COLOR_CLASSES.bgSecondary} ${COLOR_CLASSES.textPrimary} rounded-lg ${COLOR_CLASSES.hoverBgSecondaryDark} transition-all shadow-md hover:shadow-lg font-semibold`}
            >
              <Plus className="w-5 h-5" />
              <span>Créer votre première salle</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {gyms.map((gym) => {
              const gymAudits = audits.filter(a => a.gym_id === gym.id);
              const lastAudit = gymAudits[0];
              return (
                <div
                  key={gym.id}
                  className={`group p-5 bg-white border-2 ${COLOR_CLASSES.borderNeutral} rounded-xl ${COLOR_CLASSES.hoverBorderPrimary} hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg ${COLOR_CLASSES.bgSecondary} flex items-center justify-center shrink-0`}>
                          <Dumbbell className={`w-5 h-5 ${COLOR_CLASSES.textPrimary}`} strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <h3 className={`font-semibold text-lg truncate ${COLOR_CLASSES.textPrimary}`}>
                            {gym.name}
                          </h3>
                        </div>
                      </div>
                      {gym.city && (
                        <p className={`text-sm ml-13 truncate ${COLOR_CLASSES.textSecondary}`}>{gym.city}</p>
                      )}
                      {gym.contact_name && (
                        <p className={`text-xs opacity-60 ml-13 mt-1 truncate ${COLOR_CLASSES.textPrimary}`}>{gym.contact_name}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => onNavigate('gym-form', gym.id)}
                        className={`p-2 ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.hoverBgPrimary10} rounded-lg transition-all`}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGym(gym.id)}
                        className={`p-2 ${COLOR_CLASSES.textPrimary} hover:bg-red-50 hover:text-red-500 rounded-lg transition-all`}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {gymAudits.length > 0 && lastAudit && (
                    <div className={`mb-4 p-3 ${COLOR_CLASSES.bgNeutral30} rounded-lg border ${COLOR_CLASSES.borderNeutral}`}>
                      <div className={`flex items-center justify-between text-xs mb-2 font-medium ${COLOR_CLASSES.textPrimary}`}>
                        <span>Dernier audit</span>
                        <span className="font-bold">{Math.round(lastAudit.completion_percentage)}%</span>
                      </div>
                      <div className={`w-full ${COLOR_CLASSES.bgNeutral} rounded-full h-2 overflow-hidden`}>
                        <div
                          className={`${COLOR_CLASSES.bgPrimary} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${lastAudit.completion_percentage}%` }}
                        />
                      </div>
                      <p className={`text-xs mt-2 ${COLOR_CLASSES.textSecondary}`}>
                        {gymAudits.length} audit{gymAudits.length > 1 ? 's' : ''} au total
                      </p>
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      try {
                        const data = await createAudit({
                          gym_id: gym.id,
                          status: AuditStatus.DRAFT,
                          audit_date_start: new Date().toISOString().split('T')[0]
                        });
                        if (data) {
                          onNavigate('audit-form', undefined, data.id);
                        }
                      } catch (error) {
                        console.error('Erreur lors de la création de l’audit :', error);
                        alert('Impossible de créer l’audit. Veuillez réessayer.');
                      }
                    }}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 ${COLOR_CLASSES.bgPrimary} text-white rounded-lg ${COLOR_CLASSES.hoverBgPrimaryDark} transition-all shadow-sm hover:shadow-md font-semibold`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouvel audit</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tous les Audits Section */}
      <div className={`bg-white rounded-xl shadow-md p-6 border-b-2 ${COLOR_CLASSES.borderNeutral}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b-2 ${COLOR_CLASSES.borderNeutral}`}>
          <div>
            <h2 className={`text-2xl font-semibold mb-1 ${COLOR_CLASSES.textPrimary}`}>Tous les Audits</h2>
            <p className={`text-sm ${COLOR_CLASSES.textSecondary}`}>Historique et suivi de vos audits</p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className={`w-4 h-4 ${COLOR_CLASSES.textSecondary}`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 border-2 ${COLOR_CLASSES.borderNeutral} rounded-lg text-sm ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.focusRingPrimary} ${COLOR_CLASSES.focusBorderPrimary} bg-white ${COLOR_CLASSES.hoverBorderPrimary} transition-colors`}
            >
              <option value="all">Tous les statuts</option>
              <option value={AuditStatus.DRAFT}>Brouillon</option>
              <option value={AuditStatus.IN_PROGRESS}>En cours</option>
              <option value={AuditStatus.COMPLETED}>Finalisé</option>
              <option value={AuditStatus.ARCHIVED}>Archivé</option>
            </select>
          </div>
        </div>

        {filteredAudits.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-5 opacity-20">📊</div>
            <h3 className={`text-xl font-semibold mb-3 ${COLOR_CLASSES.textPrimary}`}>
              {filterStatus === 'all' ? 'Aucun audit créé' : 'Aucun audit avec ce statut'}
            </h3>
            <p className={COLOR_CLASSES.textSecondary}>
              {filterStatus === 'all'
                ? 'Créez une salle pour commencer votre premier audit'
                : 'Modifiez vos filtres pour voir d\'autres audits'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAudits.map((audit) => {
              const isFinalized = audit.status === AuditStatus.COMPLETED;
              return (
                <div
                  key={audit.id}
                  className={`group p-5 bg-white border-2 ${COLOR_CLASSES.borderNeutral} rounded-xl ${COLOR_CLASSES.hoverBorderPrimary} hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isFinalized
                          ? COLOR_CLASSES.bgSuccess20
                          : COLOR_CLASSES.bgAccent20
                        }`}>
                        {isFinalized ? (
                          <Target className={`w-6 h-6 ${COLOR_CLASSES.textSuccess}`} strokeWidth={2} />
                        ) : (
                          <Activity className={`w-6 h-6 ${COLOR_CLASSES.textAccent}`} strokeWidth={2} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-lg truncate ${COLOR_CLASSES.textPrimary}`}>
                          {audit.gym?.name || 'Salle inconnue'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {getStatusBadge(audit.status)}
                          <span className={`text-xs hidden sm:inline ${COLOR_CLASSES.textSecondary}`}>•</span>
                          <div className={`flex items-center space-x-1 text-xs ${COLOR_CLASSES.textSecondary}`}>
                            <Calendar className="w-3 h-3" />
                            <span>
                              {audit.audit_date_start
                                ? new Date(audit.audit_date_start).toLocaleDateString('fr-FR')
                                : 'Non défini'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className={`flex items-center justify-between text-xs mb-2 font-medium ${COLOR_CLASSES.textPrimary}`}>
                        <span>Progression</span>
                        <span className="font-bold">{Math.round(audit.completion_percentage)}%</span>
                      </div>
                      <div className={`w-full ${COLOR_CLASSES.bgNeutral} rounded-full h-2.5 overflow-hidden`}>
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${isFinalized
                              ? COLOR_CLASSES.bgSuccess
                              : COLOR_CLASSES.bgAccent
                            }`}
                          style={{ width: `${audit.completion_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 pt-2 border-t ${COLOR_CLASSES.borderNeutral}`}>
                      {isFinalized && (
                        <button
                          onClick={() => onNavigate('dashboard', undefined, audit.id)}
                          className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 ${COLOR_CLASSES.bgSuccess} text-white rounded-lg ${COLOR_CLASSES.hoverBgSuccessDark} transition-all font-semibold`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Diagnostic</span>
                        </button>
                      )}
                      <button
                        onClick={() => onNavigate('audit-form', undefined, audit.id)}
                        className={`p-2 ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.hoverBgPrimary10} rounded-lg transition-all`}
                        title="Modifier l'audit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteAudit(audit.id)}
                        className={`p-2 ${COLOR_CLASSES.textPrimary} hover:bg-red-50 hover:text-red-500 rounded-lg transition-all`}
                        title="Supprimer l'audit"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
