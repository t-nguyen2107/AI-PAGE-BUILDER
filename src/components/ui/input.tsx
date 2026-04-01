'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full h-9 px-3 text-sm rounded-lg
          bg-surface-low text-on-surface
          placeholder:text-on-surface-outline
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40
          border border-outline-variant
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150
          ${className}
        `}
        {...props}
      />
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, id, className = '', ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`
          w-full px-3 py-2 text-sm rounded-lg min-h-[60px] resize-y
          bg-surface-low text-on-surface
          placeholder:text-on-surface-outline
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40
          border border-outline-variant
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150
          ${className}
        `}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, id, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`
          w-full h-9 px-3 text-sm rounded-lg
          bg-surface-low text-on-surface
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40
          border border-outline-variant
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
