import { useState, useEffect } from 'react';
import { Plus, Dumbbell, FileBarChart, Edit, Trash2, Calendar, TrendingUp, Filter, Activity, Target, Zap } from 'lucide-react';
import { createAudit, deleteAudit as removeAudit, deleteGym as removeGym, listAudits, listGyms } from '../lib/api';
import { Gym, Audit } from '../lib/types';

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
      brouillon: 'bg-[#D6C7A1]/20 text-[#D6C7A1] border-[#D6C7A1]/30',
      en_cours: 'bg-[#4F7A7E]/20 text-[#4F7A7E] border-[#4F7A7E]/30 glow-beige',
      finalise: 'bg-[#6FBF73]/20 text-[#6FBF73] border-[#6FBF73]/30',
      archive: 'bg-gray-700/30 text-gray-400 border-gray-600/30'
    };
    const labels = {
      brouillon: 'Brouillon',
      en_cours: 'En cours',
      finalise: 'Finalisé',
      archive: 'Archivé'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4F7A7E] glow-teal"></div>
          <Zap className="w-6 h-6 text-[#D6C7A1] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="relative group bg-gradient-to-br from-black/60 to-black/40 border-2 border-[#4F7A7E]/30 rounded-xl shadow-lg p-4 md:p-6 overflow-hidden hover:border-[#4F7A7E] transition-all duration-300 glow-teal">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F7A7E]/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[#D6C7A1] text-xs md:text-sm font-semibold uppercase tracking-wider">Salles</p>
              <p className="text-3xl md:text-4xl font-bold mt-2 text-[#F4F3EE] glow-text-teal">{stats.totalGyms}</p>
            </div>
            <div className="bg-[#4F7A7E]/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <Dumbbell className="w-8 h-8 md:w-10 md:h-10 text-[#4F7A7E]" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="relative group bg-gradient-to-br from-black/60 to-black/40 border-2 border-[#D6C7A1]/30 rounded-xl shadow-lg p-4 md:p-6 overflow-hidden hover:border-[#D6C7A1] transition-all duration-300 glow-beige">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D6C7A1]/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[#D6C7A1] text-xs md:text-sm font-semibold uppercase tracking-wider">Audits Total</p>
              <p className="text-3xl md:text-4xl font-bold mt-2 text-[#F4F3EE] glow-text-beige">{stats.totalAudits}</p>
            </div>
            <div className="bg-[#D6C7A1]/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <FileBarChart className="w-8 h-8 md:w-10 md:h-10 text-[#D6C7A1]" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="relative group bg-gradient-to-br from-black/60 to-black/40 border-2 border-orange-500/30 rounded-xl shadow-lg p-4 md:p-6 overflow-hidden hover:border-orange-500 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-xs md:text-sm font-semibold uppercase tracking-wider">En Cours</p>
              <p className="text-3xl md:text-4xl font-bold mt-2 text-[#F4F3EE]">{stats.auditsInProgress}</p>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <Activity className="w-8 h-8 md:w-10 md:h-10 text-orange-500" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="relative group bg-gradient-to-br from-black/60 to-black/40 border-2 border-[#6FBF73]/30 rounded-xl shadow-lg p-4 md:p-6 overflow-hidden hover:border-[#6FBF73] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#6FBF73]/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[#6FBF73] text-xs md:text-sm font-semibold uppercase tracking-wider">Finalisés</p>
              <p className="text-3xl md:text-4xl font-bold mt-2 text-[#F4F3EE]">{stats.auditsCompleted}</p>
            </div>
            <div className="bg-[#6FBF73]/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 md:w-10 md:h-10 text-[#6FBF73]" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-xl shadow-xl border-2 border-[#4F7A7E]/30 p-4 md:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F4F3EE] glow-text-teal flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-[#4F7A7E]" />
              Salles de CrossFit
            </h2>
            <p className="text-[#D6C7A1]/80 text-xs md:text-sm mt-1 ml-8">Gérez vos salles et créez des audits</p>
          </div>
          <button
            onClick={() => onNavigate('gym-form')}
            className="flex items-center justify-center space-x-2 px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-[#4F7A7E] to-[#4F7A7E]/80 text-[#F4F3EE] rounded-lg hover:glow-teal transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base font-semibold border border-[#4F7A7E]/50"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span>Nouvelle salle</span>
          </button>
        </div>

        {gyms.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-[#4F7A7E]/10 to-[#D6C7A1]/5 rounded-xl border-2 border-dashed border-[#4F7A7E]/30">
            <div className="bg-[#4F7A7E]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 glow-teal">
              <Dumbbell className="w-10 h-10 text-[#4F7A7E]" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-[#F4F3EE] mb-2 glow-text-teal">Commencez votre premier audit</h3>
            <p className="text-[#D6C7A1]/80 mb-6 max-w-md mx-auto">
              Ajoutez une salle de CrossFit pour démarrer l'analyse et découvrir les opportunités d'optimisation
            </p>
            <button
              onClick={() => onNavigate('gym-form')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#4F7A7E] to-[#4F7A7E]/80 text-[#F4F3EE] rounded-lg hover:glow-teal transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold border border-[#4F7A7E]/50"
            >
              <Plus className="w-5 h-5" />
              <span>Créer votre première salle</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {gyms.map((gym) => {
              const gymAudits = audits.filter(a => a.gym_id === gym.id);
              const lastAudit = gymAudits[0];
              return (
                <div
                  key={gym.id}
                  className="group p-4 md:p-5 bg-gradient-to-br from-black/50 to-black/30 border-2 border-[#D6C7A1]/20 rounded-xl hover:border-[#4F7A7E]/50 hover:glow-beige transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#4F7A7E]/20 flex items-center justify-center shrink-0 border border-[#4F7A7E]/30">
                          <Dumbbell className="w-4 h-4 md:w-5 md:h-5 text-[#4F7A7E]" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#F4F3EE] text-base md:text-lg group-hover:text-[#4F7A7E] transition-colors truncate">
                            {gym.name}
                          </h3>
                        </div>
                      </div>
                      {gym.city && (
                        <p className="text-xs md:text-sm text-[#D6C7A1]/70 ml-10 md:ml-12 truncate">{gym.city}</p>
                      )}
                      {gym.contact_name && (
                        <p className="text-xs text-[#D6C7A1]/60 ml-10 md:ml-12 mt-1 truncate">{gym.contact_name}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => onNavigate('gym-form', gym.id)}
                        className="p-1.5 md:p-2 text-[#D6C7A1]/60 hover:text-[#4F7A7E] hover:bg-[#4F7A7E]/10 rounded-lg transition-all border border-transparent hover:border-[#4F7A7E]/30"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <button
                        onClick={() => deleteGym(gym.id)}
                        className="p-1.5 md:p-2 text-[#D6C7A1]/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>

                  {gymAudits.length > 0 && lastAudit && (
                    <div className="mb-4 p-3 bg-[#4F7A7E]/10 rounded-lg border border-[#4F7A7E]/20">
                      <div className="flex items-center justify-between text-xs text-[#D6C7A1] mb-2">
                        <span>Dernier audit</span>
                        <span className="font-bold">{Math.round(lastAudit.completion_percentage)}%</span>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#4F7A7E] to-[#6FBF73] h-2 rounded-full transition-all duration-500 glow-teal"
                          style={{ width: `${lastAudit.completion_percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#D6C7A1]/60 mt-2">
                        {gymAudits.length} audit{gymAudits.length > 1 ? 's' : ''} au total
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        createAudit({
                          gym_id: gym.id,
                          status: 'brouillon',
                          audit_date_start: new Date().toISOString().split('T')[0]
                        }).then((data) => {
                          if (data) {
                            onNavigate('audit-form', undefined, data.id);
                          }
                        });
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4F7A7E] to-[#4F7A7E]/80 text-[#F4F3EE] rounded-lg hover:glow-teal transition-all shadow-md hover:shadow-lg text-sm font-semibold border border-[#4F7A7E]/50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nouvel audit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-xl shadow-xl border-2 border-[#D6C7A1]/30 p-4 md:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F4F3EE] glow-text-beige flex items-center gap-2">
              <FileBarChart className="w-6 h-6 text-[#D6C7A1]" />
              Tous les Audits
            </h2>
            <p className="text-[#D6C7A1]/80 text-xs md:text-sm mt-1 ml-8">Historique et suivi de vos audits</p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#D6C7A1]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 md:px-4 py-2 border-2 border-[#D6C7A1]/30 rounded-lg text-xs md:text-sm text-[#F4F3EE] focus:ring-2 focus:ring-[#4F7A7E] focus:border-[#4F7A7E] bg-black/40 backdrop-blur-sm hover:border-[#D6C7A1]/50 transition-colors"
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
          <div className="text-center py-16 bg-gradient-to-br from-[#D6C7A1]/10 to-[#4F7A7E]/5 rounded-xl border-2 border-dashed border-[#D6C7A1]/30">
            <div className="bg-[#D6C7A1]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 glow-beige">
              <FileBarChart className="w-10 h-10 text-[#D6C7A1]" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-[#F4F3EE] mb-2">
              {filterStatus === 'all' ? 'Aucun audit créé' : 'Aucun audit avec ce statut'}
            </h3>
            <p className="text-[#D6C7A1]/70">
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
                  className="group p-4 md:p-5 bg-gradient-to-br from-black/50 to-black/30 border-2 border-[#4F7A7E]/20 rounded-xl hover:border-[#D6C7A1]/50 hover:glow-teal transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 border-2 ${
                        isFinalized
                          ? 'bg-[#6FBF73]/10 border-[#6FBF73]/30'
                          : 'bg-orange-500/10 border-orange-500/30'
                      }`}>
                        {isFinalized ? (
                          <Target className="w-5 h-5 md:w-6 md:h-6 text-[#6FBF73]" strokeWidth={2} />
                        ) : (
                          <Activity className="w-5 h-5 md:w-6 md:h-6 text-orange-500" strokeWidth={2} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#F4F3EE] text-base md:text-lg group-hover:text-[#4F7A7E] transition-colors truncate">
                          {audit.gym?.name || 'Salle inconnue'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {getStatusBadge(audit.status)}
                          <span className="text-xs text-[#D6C7A1]/50 hidden sm:inline">•</span>
                          <div className="flex items-center space-x-1 text-xs text-[#D6C7A1]/70">
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
                      <div className="flex items-center justify-between text-xs text-[#D6C7A1] mb-2">
                        <span className="font-semibold">Progression</span>
                        <span className="font-bold text-[#4F7A7E]">{Math.round(audit.completion_percentage)}%</span>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-2 md:h-2.5 overflow-hidden border border-[#4F7A7E]/20">
                        <div
                          className={`h-2 md:h-2.5 rounded-full transition-all duration-500 ${
                            isFinalized
                              ? 'bg-gradient-to-r from-[#6FBF73] to-[#4F7A7E]'
                              : 'bg-gradient-to-r from-orange-500 to-[#4F7A7E]'
                          }`}
                          style={{ width: `${audit.completion_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#D6C7A1]/20">
                      {isFinalized && (
                        <button
                          onClick={() => onNavigate('dashboard', undefined, audit.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-gradient-to-r from-[#6FBF73] to-[#4F7A7E] text-[#F4F3EE] rounded-lg hover:shadow-lg hover:shadow-[#6FBF73]/20 transition-all text-xs md:text-sm font-semibold border border-[#6FBF73]/50"
                        >
                          <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>Diagnostic</span>
                        </button>
                      )}
                      <button
                        onClick={() => onNavigate('audit-form', undefined, audit.id)}
                        className="p-2 text-[#D6C7A1]/70 hover:text-[#4F7A7E] hover:bg-[#4F7A7E]/10 rounded-lg transition-all border border-transparent hover:border-[#4F7A7E]/30"
                        title="Modifier l'audit"
                      >
                        <Edit className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button
                        onClick={() => deleteAudit(audit.id)}
                        className="p-2 text-[#D6C7A1]/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                        title="Supprimer l'audit"
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
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
