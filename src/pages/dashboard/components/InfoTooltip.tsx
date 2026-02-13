import { useState } from 'react';

export default function InfoTooltip({ label, details }: { label: string; details: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-tulip-blue/30 text-[10px] font-semibold text-tulip-blue/70 hover:border-tulip-blue/60 hover:text-tulip-blue"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onBlur={() => setOpen(false)}
        aria-label={`Détails du calcul: ${label}`}
      >
        i
      </button>
      {open && (
        <div className="absolute left-1/2 top-6 z-20 w-64 -translate-x-1/2 rounded-md border border-tulip-beige bg-white p-3 text-xs text-tulip-blue/80 shadow-lg whitespace-pre-line">
          {details}
        </div>
      )}
    </span>
  );
}
