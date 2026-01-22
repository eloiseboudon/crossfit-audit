import { useState, useEffect } from 'react';
import { ArrowLeft, Save, TrendingUp, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MarketBenchmark } from '../lib/types';

interface SettingsPageProps {
  onBack: () => void;
  onNavigateToZones?: () => void; // Navigation vers la page des zones de marché
}

export default function SettingsPage({ onBack, onNavigateToZones }: SettingsPageProps) {
  const [benchmarks, setBenchmarks] = useState<MarketBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBenchmarks();
  }, []);

  const loadBenchmarks = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('market_benchmarks')
        .select('*')
        .order('category', { ascending: true });
      setBenchmarks(data || []);
    } catch (error) {
      console.error('Error loading benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const benchmark of benchmarks) {
        await supabase
          .from('market_benchmarks')
          .update({
            value: benchmark.value,
            updated_at: new Date().toISOString()
          })
          .eq('id', benchmark.id);
      }
      alert('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving benchmarks:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateBenchmark = (id: string, value: number) => {
    setBenchmarks(
      benchmarks.map((b) => (b.id === id ? { ...b, value } : b))
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      pricing: 'Tarification',
      retention: 'Rétention',
      acquisition: 'Acquisition',
      finance: 'Finance',
      exploitation: 'Exploitation'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tulip-green"></div>
      </div>
    );
  }

  const groupedBenchmarks = benchmarks.reduce((acc, benchmark) => {
    const category = benchmark.category || 'autres';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(benchmark);
    return acc;
  }, {} as Record<string, MarketBenchmark[]>);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-tulip-beige/20 rounded-card transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-tulip-blue/70" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-tulip-blue">Paramètres du Marché</h1>
              <p className="text-tulip-blue/70 text-sm mt-1">
                Benchmarks et références pour les calculs
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-tulip-green text-white rounded-card hover:bg-tulip-green/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>

        {/* Section gestion des zones de marché */}
        {onNavigateToZones && (
          <div className="mb-8 p-6 bg-gradient-to-r from-tulip-green/10 to-tulip-blue/10 border border-tulip-green/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-tulip-green text-white rounded-lg">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-tulip-blue">Zones de Marché</h3>
                  <p className="text-sm text-tulip-blue/70 mt-1">
                    Gérer les zones géographiques et leurs fourchettes de prix pour l'analyse concurrentielle
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateToZones}
                className="px-6 py-2 bg-tulip-green text-white rounded-lg hover:bg-tulip-green/90 transition-all font-semibold"
              >
                Gérer les zones
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {Object.entries(groupedBenchmarks).map(([category, categoryBenchmarks]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-tulip-beige">
                <TrendingUp className="w-5 h-5 text-tulip-blue/70" />
                <h2 className="text-lg font-semibold text-tulip-blue">
                  {getCategoryLabel(category)}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {categoryBenchmarks.map((benchmark) => (
                  <div
                    key={benchmark.id}
                    className="p-4 border border-tulip-beige rounded-card hover:border-tulip-beige/70 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <h3 className="font-medium text-tulip-blue mb-1">
                          {benchmark.name}
                        </h3>
                        {benchmark.description && (
                          <p className="text-sm text-tulip-blue/70">
                            {benchmark.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={benchmark.value}
                          onChange={(e) =>
                            updateBenchmark(benchmark.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-3 py-2 border border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-transparent text-right"
                          step="0.1"
                        />
                        {benchmark.unit && (
                          <span className="text-tulip-blue/70 text-sm font-medium min-w-[2rem]">
                            {benchmark.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-tulip-blue/10 border border-tulip-blue/30 rounded-card">
          <h3 className="font-semibold text-tulip-blue mb-2">À propos des benchmarks</h3>
          <p className="text-sm text-tulip-blue/70 leading-relaxed">
            Ces valeurs servent de référence pour les calculs de scoring et de recommandations.
            Ajustez-les en fonction des données réelles de votre marché local pour obtenir
            des diagnostics plus précis.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-tulip-beige">
          <button
            onClick={onBack}
            className="px-6 py-2 text-tulip-blue/70 hover:bg-tulip-beige/20 rounded-card transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-tulip-green text-white rounded-card hover:bg-tulip-green/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
