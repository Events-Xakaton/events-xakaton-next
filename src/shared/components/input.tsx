'use client';

import type { FC, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/input.css';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
};

export const Input: FC<Props> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn(fullWidth && 'form-input--full-width', className)}>
      {label && (
        <label htmlFor={inputId} className="form-input__label">
          {label}
          {props.required && (
            <span className="form-input__required-mark">*</span>
          )}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'form-input__field',
          error ? 'form-input__field--error' : 'form-input__field--default',
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error
            ? `${inputId}-error`
            : helperText
              ? `${inputId}-helper`
              : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="form-input__error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="form-input__helper">
          {helperText}
        </p>
      )}
    </div>
  );
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
};

export const Textarea: FC<TextareaProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  id,
  rows = 4,
  ...props
}) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn(fullWidth && 'form-input--full-width', className)}>
      {label && (
        <label htmlFor={textareaId} className="form-input__label">
          {label}
          {props.required && (
            <span className="form-input__required-mark">*</span>
          )}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          'form-input__field',
          error ? 'form-input__field--error' : 'form-input__field--default',
          'resize-none',
        )}
        aria-invalid={error ? 'true' : 'false'}
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
        <p
          id={`${textareaId}-error`}
          className="form-input__error"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${textareaId}-helper`} className="form-input__helper">
          {helperText}
        </p>
      )}
    </div>
  );
};

type SelectProps = InputHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
};

export const Select: FC<SelectProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  options,
  className,
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn(fullWidth && 'form-input--full-width', className)}>
      {label && (
        <label htmlFor={selectId} className="form-input__label">
          {label}
          {props.required && (
            <span className="form-input__required-mark">*</span>
          )}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'form-input__field',
          'cursor-pointer',
          error ? 'form-input__field--error' : 'form-input__field--default',
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error
            ? `${selectId}-error`
            : helperText
              ? `${selectId}-helper`
              : undefined
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
        <p id={`${selectId}-error`} className="form-input__error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="form-input__helper">
          {helperText}
        </p>
      )}
    </div>
  );
};
