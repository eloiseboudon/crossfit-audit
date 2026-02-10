import { useEffect, useState } from 'react';

interface VersionInfo {
  app: string;
  db: { version: string; appliedAt: string } | null;
}

export default function VersionBadge() {
  const [open, setOpen] = useState(false);
  const [apiVersion, setApiVersion] = useState<VersionInfo | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch('/api/version')
      .then((r) => r.json())
      .then(setApiVersion)
      .catch(() => setApiVersion(null));
  }, [open]);

  return (
    <div className="fixed bottom-2 right-2 z-50">
      {open && (
        <div className="mb-2 bg-black/80 backdrop-blur-sm border border-[#4F7A7E]/40 rounded-lg p-3 text-xs text-[#F4F3EE] shadow-lg min-w-[200px]">
          <div className="flex justify-between mb-2">
            <span className="text-[#D6C7A1] font-semibold">Versions</span>
            <button onClick={() => setOpen(false)} className="text-[#D6C7A1]/60 hover:text-[#F4F3EE]">
              &times;
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#D6C7A1]/80">Front</span>
              <span>{__APP_VERSION__}</span>
            </div>
            {apiVersion ? (
              <>
                <div className="flex justify-between">
                  <span className="text-[#D6C7A1]/80">API</span>
                  <span>{apiVersion.app}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D6C7A1]/80">DB</span>
                  <span className="text-right">{apiVersion.db?.version ?? 'n/a'}</span>
                </div>
              </>
            ) : (
              <div className="text-[#D6C7A1]/60">Chargement...</div>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="text-[10px] text-[#D6C7A1]/50 hover:text-[#D6C7A1] transition-colors"
      >
        v{__APP_VERSION__}
      </button>
    </div>
  );
}
