/**
 * Input Component
 *
 * Accessible form inputs with mobile-friendly sizing.
 * Minimum 44px height for touch targets.
 */

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const baseClasses = `
      w-full px-4 py-2.5
      min-h-[44px]
      bg-neutral-900 border border-neutral-700
      text-white placeholder:text-neutral-500
      rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const errorClasses = error
      ? "border-red-500 focus:ring-red-500"
      : "hover:border-neutral-600";

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <div className={cn(widthClass, className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-300 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(baseClasses, errorClasses)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * Textarea Component
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = false, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const baseClasses = `
      w-full px-4 py-2.5
      bg-neutral-900 border border-neutral-700
      text-white placeholder:text-neutral-500
      rounded-lg
      resize-none
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const errorClasses = error
      ? "border-red-500 focus:ring-red-500"
      : "hover:border-neutral-600";

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <div className={cn(widthClass, className)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-neutral-300 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(baseClasses, errorClasses)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

/**
 * Select Component
 */
export interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helperText, fullWidth = false, options, className, id, ...props },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const baseClasses = `
      w-full px-4 py-2.5
      min-h-[44px]
      bg-neutral-900 border border-neutral-700
      text-white
      rounded-lg
      cursor-pointer
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const errorClasses = error
      ? "border-red-500 focus:ring-red-500"
      : "hover:border-neutral-600";

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <div className={cn(widthClass, className)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-300 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(baseClasses, errorClasses)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
