'use client';

import { useEffect } from 'react';

type LoadingOverlayProps = {
  open: boolean;
  text?: string;
  children?: React.ReactNode;
};

export default function LoadingOverlay({
  open,
  text = 'Cargando...',
  children,
}: LoadingOverlayProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {children ?? (
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        )}

        <p className="text-sm tracking-wide text-neutral-300">{text}</p>
      </div>
    </div>
  );
}
