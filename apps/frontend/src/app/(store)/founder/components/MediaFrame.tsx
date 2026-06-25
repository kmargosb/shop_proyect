import type { ReactNode } from 'react';

import ScaleReveal from '../../../../shared/ui/ScaleReveal';

type Props = {
  children?: ReactNode;
  aspect?: string;
};

export default function MediaFrame({ children, aspect = 'aspect-video' }: Props) {
  return (
    <ScaleReveal>
      <div
        className={`group overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] transition-all duration-500 hover:border-white/20 ${aspect} `}
      >
        <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.02]">
          {children ?? (
            <div className="flex h-full items-center justify-center text-neutral-600">
              Placeholder
            </div>
          )}
        </div>
      </div>
    </ScaleReveal>
  );
}
