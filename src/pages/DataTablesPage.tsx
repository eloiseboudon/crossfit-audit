import { AlertTriangle, Database, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDataTable, listDataTables } from '../lib/api';
import type { DataTableData, DataTableSummary } from '../lib/types';

const formatTime = (date: Date | null) => {
  if (!date) return 'Jamais';
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

export default function DataTablesPage() {
  const [tables, setTables] = useState<DataTableSummary[]>([]);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<DataTableData | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Charge la liste des tables et sélectionne la première disponible si nécessaire.
  const loadTables = useCallback(async () => {
    setLoadingTables(true);
    setError(null);
    try {
      const data = await listDataTables();
      setTables(data);
      setActiveTable((current) => {
        if (current && data.some((table) => table.name === current)) {
          return current;
        }
        return data[0]?.name ?? null;
      });
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les tables');
    } finally {
      setLoadingTables(false);
    }
  }, []);

  // Charge les lignes pour la table sélectionnée.
  const loadTableData = useCallback(async (tableName: string) => {
    setLoadingData(true);
    setError(null);
    try {
      const data = await getDataTable(tableName);
      setTableData(data);
      setLastRefresh(new Date());
    } catch (err) {
      setTableData(null);
      setError(err instanceof Error ? err.message : 'Impossible de charger la table');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    void loadTables();
  }, [loadTables]);

  useEffect(() => {
    if (activeTable) {
      void loadTableData(activeTable);
    } else {
      setTableData(null);
    }
  }, [activeTable, loadTableData]);

  const columns = useMemo(() => tableData?.columns ?? [], [tableData]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-tulip-blue flex items-center gap-2">
            <Database className="w-6 h-6" />
            Données en direct
          </h2>
          <p className="text-sm text-slate-500">
            Accédez aux tables SQLite et visualisez leur contenu en temps réel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">Dernier rafraîchissement : {formatTime(lastRefresh)}</div>
          <button
            type="button"
            onClick={() => {
              void loadTables();
              if (activeTable) {
                void loadTableData(activeTable);
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[#4F7A7E]/30 px-3 py-2 text-sm font-semibold text-tulip-blue hover:bg-[#4F7A7E]/10"
          >
            <RefreshCcw className="w-4 h-4" />
            Rafraîchir
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <section className="rounded-2xl border border-[#4F7A7E]/20 bg-white/70 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-tulip-blue">Tables ({tables.length})</h3>
            {loadingTables && <span className="text-xs text-slate-400">Chargement...</span>}
          </div>
          <div className="space-y-2">
            {tables.length === 0 && !loadingTables && (
              <p className="text-sm text-slate-400">Aucune table disponible.</p>
            )}
            {tables.map((table) => (
              <button
                key={table.name}
                type="button"
                onClick={() => setActiveTable(table.name)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  activeTable === table.name
                    ? 'border-[#4F7A7E] bg-[#4F7A7E]/10 text-tulip-blue'
                    : 'border-transparent hover:border-[#4F7A7E]/30 hover:bg-[#4F7A7E]/5 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{table.name}</span>
                  <span className="text-xs text-slate-400">{table.rowCount} lignes</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#4F7A7E]/20 bg-white/70 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-tulip-blue">
                {tableData ? `Table : ${tableData.name}` : 'Sélectionnez une table'}
              </h3>
              {tableData && (
                <p className="text-xs text-slate-400">{tableData.rowCount} lignes</p>
              )}
            </div>
            {loadingData && <span className="text-xs text-slate-400">Chargement...</span>}
          </div>

          {!tableData && !loadingData && (
            <div className="text-sm text-slate-400">Sélectionnez une table pour afficher son contenu.</div>
          )}

          {tableData && (
            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-[#4F7A7E]/20">
                    {columns.map((column) => (
                      <th key={column} className="px-3 py-2 font-semibold text-tulip-blue whitespace-nowrap">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length || 1} className="px-3 py-4 text-sm text-slate-400">
                        Aucun contenu pour cette table.
                      </td>
                    </tr>
                  ) : (
                    tableData.rows.map((row, index) => (
                      <tr key={`${tableData.name}-${index}`} className="border-b border-slate-100">
                        {columns.map((column) => (
                          <td key={column} className="px-3 py-2 text-slate-600 whitespace-nowrap">
                            {row[column] === null || row[column] === undefined
                              ? '-'
                              : String(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
