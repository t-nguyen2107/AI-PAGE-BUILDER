'use client';

import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'email' | 'number';
  monospace?: boolean;
  className?: string;
  id?: string;
}

/**
 * Shared labeled text field with consistent styling.
 * Uses design system tokens for colors and focus ring.
 */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  monospace = false,
  className,
  id,
}: FieldProps) {
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="text-xs text-on-surface-variant font-medium block mb-1.5"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full text-sm border border-outline-variant rounded-lg px-3 py-2',
          'bg-surface-lowest text-on-surface',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40',
          'placeholder:text-on-surface-outline',
          'transition-colors duration-150',
          monospace && 'font-mono'
        )}
        placeholder={placeholder}
      />
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  monospace?: boolean;
  minRows?: number;
  className?: string;
  id?: string;
}

/**
 * Shared labeled textarea field.
 */
export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  monospace = false,
  minRows = 4,
  className,
  id,
}: TextAreaFieldProps) {
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="text-xs text-on-surface-variant font-medium block mb-1.5"
      >
        {label}
      </label>
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full text-sm border border-outline-variant rounded-lg px-3 py-2.5',
          'bg-surface-lowest text-on-surface',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40',
          'placeholder:text-on-surface-outline',
          'transition-colors duration-150 resize-y',
          monospace && 'font-mono'
        )}
        placeholder={placeholder}
        rows={minRows}
      />
    </div>
  );
}
