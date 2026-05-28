import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightElement,
  className,
  id,
  name,
  ...props
}: InputProps) {
  const fieldId = id ?? name ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {leftIcon}
          </span>
        )}

        <input
          id={fieldId}
          name={name}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${fieldId}-error`
              : hint
              ? `${fieldId}-hint`
              : undefined
          }
          className={cn(
            'w-full rounded-xl border bg-white text-sm text-gray-900 placeholder-gray-400',
            'px-3 py-2.5 transition-colors',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            leftIcon ? 'pl-10' : undefined,
            rightElement ? 'pr-10' : undefined,
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-300 hover:border-gray-400 focus:ring-indigo-500',
            className,
          )}
          {...props}
        />

        {rightElement && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </span>
        )}
      </div>

      {error && (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="flex items-center gap-1 text-xs text-red-600"
        >
          <svg
            className="h-3.5 w-3.5 shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 3a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 4zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
