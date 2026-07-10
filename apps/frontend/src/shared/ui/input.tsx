import * as React from 'react';
import { cn } from '@/shared/lib/utils';

type InputProps = React.ComponentProps<'input'> & {
  label?: string;
  error?: string;
  helper?: string;
  compact?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helper, compact = false, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && !compact && (
          <label className="block text-sm font-medium text-white">{label}</label>
        )}

        <input
          ref={ref}
          type={type}
          className={cn(
            'h-11 w-full rounded-xl border border-white/10 bg-neutral-950 px-4 text-sm text-white transition-all outline-none placeholder:text-neutral-500 focus:border-white/40 focus:ring-2 focus:ring-white/10 disabled:opacity-50 md:h-12',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        {!error && helper && <p className="text-xs text-neutral-500">{helper}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
