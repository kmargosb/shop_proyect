import type { ReactNode } from 'react';

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export default function Section({ children, className = '' }: SectionProps) {
  return (
    <section className={`border-t border-white/10 py-24 md:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}
