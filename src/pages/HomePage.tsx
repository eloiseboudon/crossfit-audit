import { Activity, Calendar, Dumbbell, Edit, Filter, Plus, Target, Trash2, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createAudit, listAudits, listGyms, deleteAudit as removeAudit, deleteGym as removeGym } from '../lib/api';
import { Audit, Gym } from '../lib/types';

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

  const stats = {
    totalGyms: gyms.length,
    totalAudits: audits.length,
    auditsInProgress: audits.filter(a => a.status === 'en_cours' || a.status === 'brouillon').length,
    auditsCompleted: audits.filter(a => a.status === 'finalise').length,
  };

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
    const styles = {
      brouillon: 'bg-[#CCBB90]/10 text-[#CCBB90] border-[#CCBB90]/30',
      en_cours: 'bg-[#E89F5C]/10 text-[#E89F5C] border-[#E89F5C]/30',
      finalise: 'bg-[#7FA99B]/10 text-[#7FA99B] border-[#7FA99B]/30',
      archive: 'bg-gray-400/10 text-gray-500 border-gray-400/30'
    };
    const labels = {
      brouillon: 'Brouillon',
      en_cours: 'En cours',
      finalise: 'Finalisé',
      archive: 'Archivé'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#48737F]"></div>
          <Zap className="w-6 h-6 text-[#CCBB90] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 md:px-0">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Salles */}
        <div className="relative group bg-white border-l-4 border-[#48737F] rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="stat-icon absolute top-5 right-5 text-5xl opacity-5">🏋️</div>
          <div className="relative">
            <p className="text-[#48737F] text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Salles</p>
            <p className="text-5xl font-bold text-[#48737F]">{stats.totalGyms}</p>
          </div>
        </div>

        {/* Audits Total */}
        <div className="relative group bg-white border-l-4 border-[#CCBB90] rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="stat-icon absolute top-5 right-5 text-5xl opacity-5">📊</div>
          <div className="relative">
            <p className="text-[#CCBB90] text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Audits Total</p>
            <p className="text-5xl font-bold text-[#48737F]">{stats.totalAudits}</p>
          </div>
        </div>

        {/* En Cours */}
        <div className="relative group bg-white border-l-4 border-[#E89F5C] rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="stat-icon absolute top-5 right-5 text-5xl opacity-5">📈</div>
          <div className="relative">
            <p className="text-[#E89F5C] text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">En Cours</p>
            <p className="text-5xl font-bold text-[#48737F]">{stats.auditsInProgress}</p>
          </div>
        </div>

        {/* Finalisés */}
        <div className="relative group bg-white border-l-4 border-[#7FA99B] rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="stat-icon absolute top-5 right-5 text-5xl opacity-5">✓</div>
          <div className="relative">
            <p className="text-[#7FA99B] text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Finalisés</p>
            <p className="text-5xl font-bold text-[#48737F]">{stats.auditsCompleted}</p>
          </div>
        </div>
      </div>

      {/* Salles de CrossFit Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border-b-2 border-[#DAD7CD]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b-2 border-[#DAD7CD]">
          <div>
            <h2 className="text-2xl font-semibold text-[#48737F] mb-1">Salles de CrossFit</h2>
            <p className="text-[#CCBB90] text-sm">Gérez vos salles et créez des audits</p>
          </div>
          <button
            onClick={() => onNavigate('gym-form')}
            className="flex items-center justify-center space-x-2 px-5 py-3 bg-[#48737F] text-[#DAD7CD] rounded-lg hover:bg-[#3A5C66] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle salle</span>
          </button>
        </div>

        {gyms.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-5 opacity-20">🏋️</div>
            <h3 className="text-xl font-semibold text-[#48737F] mb-3">Commencez votre premier audit</h3>
            <p className="text-[#CCBB90] mb-8 max-w-md mx-auto">
              Ajoutez une salle de CrossFit pour démarrer l'analyse et découvrir les opportunités d'optimisation
            </p>
            <button
              onClick={() => onNavigate('gym-form')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#CCBB90] text-[#48737F] rounded-lg hover:bg-[#B8A780] transition-all shadow-md hover:shadow-lg font-semibold"
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
                  className="group p-5 bg-white border-2 border-[#DAD7CD] rounded-xl hover:border-[#48737F] hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-[#CCBB90] flex items-center justify-center shrink-0">
                          <Dumbbell className="w-5 h-5 text-[#48737F]" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[#48737F] text-lg truncate">
                            {gym.name}
                          </h3>
                        </div>
                      </div>
                      {gym.city && (
                        <p className="text-sm text-[#CCBB90] ml-13 truncate">{gym.city}</p>
                      )}
                      {gym.contact_name && (
                        <p className="text-xs text-[#48737F] opacity-60 ml-13 mt-1 truncate">{gym.contact_name}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => onNavigate('gym-form', gym.id)}
                        className="p-2 text-[#48737F] hover:bg-[#48737F]/10 rounded-lg transition-all"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGym(gym.id)}
                        className="p-2 text-[#48737F] hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {gymAudits.length > 0 && lastAudit && (
                    <div className="mb-4 p-3 bg-[#DAD7CD]/30 rounded-lg border border-[#DAD7CD]">
                      <div className="flex items-center justify-between text-xs text-[#48737F] mb-2 font-medium">
                        <span>Dernier audit</span>
                        <span className="font-bold">{Math.round(lastAudit.completion_percentage)}%</span>
                      </div>
                      <div className="w-full bg-[#DAD7CD] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#48737F] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${lastAudit.completion_percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#CCBB90] mt-2">
                        {gymAudits.length} audit{gymAudits.length > 1 ? 's' : ''} au total
                      </p>
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      try {
                        const data = await createAudit({
                          gym_id: gym.id,
                          status: 'brouillon',
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
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#48737F] text-white rounded-lg hover:bg-[#3A5C66] transition-all shadow-sm hover:shadow-md font-semibold"
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
      <div className="bg-white rounded-xl shadow-md p-6 border-b-2 border-[#DAD7CD]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b-2 border-[#DAD7CD]">
          <div>
            <h2 className="text-2xl font-semibold text-[#48737F] mb-1">Tous les Audits</h2>
            <p className="text-[#CCBB90] text-sm">Historique et suivi de vos audits</p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#CCBB90]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-[#DAD7CD] rounded-lg text-sm text-[#48737F] focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white hover:border-[#48737F] transition-colors"
            >
              <option value="all">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="en_cours">En cours</option>
              <option value="finalise">Finalisé</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
        </div>

        {filteredAudits.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-5 opacity-20">📊</div>
            <h3 className="text-xl font-semibold text-[#48737F] mb-3">
              {filterStatus === 'all' ? 'Aucun audit créé' : 'Aucun audit avec ce statut'}
            </h3>
            <p className="text-[#CCBB90]">
              {filterStatus === 'all'
                ? 'Créez une salle pour commencer votre premier audit'
                : 'Modifiez vos filtres pour voir d\'autres audits'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAudits.map((audit) => {
              const isFinalized = audit.status === 'finalise';
              return (
                <div
                  key={audit.id}
                  className="group p-5 bg-white border-2 border-[#DAD7CD] rounded-xl hover:border-[#48737F] hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isFinalized
                          ? 'bg-[#7FA99B]/20'
                          : 'bg-[#E89F5C]/20'
                        }`}>
                        {isFinalized ? (
                          <Target className="w-6 h-6 text-[#7FA99B]" strokeWidth={2} />
                        ) : (
                          <Activity className="w-6 h-6 text-[#E89F5C]" strokeWidth={2} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#48737F] text-lg truncate">
                          {audit.gym?.name || 'Salle inconnue'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {getStatusBadge(audit.status)}
                          <span className="text-xs text-[#CCBB90] hidden sm:inline">•</span>
                          <div className="flex items-center space-x-1 text-xs text-[#CCBB90]">
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
                      <div className="flex items-center justify-between text-xs text-[#48737F] mb-2 font-medium">
                        <span>Progression</span>
                        <span className="font-bold">{Math.round(audit.completion_percentage)}%</span>
                      </div>
                      <div className="w-full bg-[#DAD7CD] rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${isFinalized
                              ? 'bg-[#7FA99B]'
                              : 'bg-[#E89F5C]'
                            }`}
                          style={{ width: `${audit.completion_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#DAD7CD]">
                      {isFinalized && (
                        <button
                          onClick={() => onNavigate('dashboard', undefined, audit.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-[#7FA99B] text-white rounded-lg hover:bg-[#6A9084] transition-all font-semibold"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Diagnostic</span>
                        </button>
                      )}
                      <button
                        onClick={() => onNavigate('audit-form', undefined, audit.id)}
                        className="p-2 text-[#48737F] hover:bg-[#48737F]/10 rounded-lg transition-all"
                        title="Modifier l'audit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteAudit(audit.id)}
                        className="p-2 text-[#48737F] hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
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
