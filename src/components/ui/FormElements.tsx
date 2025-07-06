import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  children: React.ReactNode
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export function Input({ label, error, className, fullWidth = true, ...props }: InputProps) {
  const inputClasses = clsx(
    'border border-gray-300 rounded-md px-3 py-2 text-sm',
    'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'disabled:bg-gray-50 disabled:text-gray-500',
    'transition-colors duration-200',
    {
      'w-full': fullWidth,
      'border-red-300 focus:ring-red-500': error,
    },
    className
  )

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
      <input className={inputClasses} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, fullWidth = true, ...props }: TextareaProps) {
  const textareaClasses = clsx(
    'border border-gray-300 rounded-md px-3 py-2 text-sm',
    'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'disabled:bg-gray-50 disabled:text-gray-500',
    'transition-colors duration-200',
    'resize-vertical',
    {
      'w-full': fullWidth,
      'border-red-300 focus:ring-red-500': error,
    },
    className
  )

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
      <textarea className={textareaClasses} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function Select({
  label,
  error,
  className,
  fullWidth = true,
  children,
  ...props
}: SelectProps) {
  const selectClasses = clsx(
    'border border-gray-300 rounded-md px-3 py-2 text-sm',
    'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'disabled:bg-gray-50 disabled:text-gray-500',
    'transition-colors duration-200',
    'bg-white appearance-none',
    "bg-[url(\"data:image/svg+xml;charset=utf-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")]",
    'bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10',
    {
      'w-full': fullWidth,
      'border-red-300 focus:ring-red-500': error,
    },
    className
  )

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
      <select className={selectClasses} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary:
      'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      'w-full': fullWidth,
      'opacity-50 cursor-not-allowed': disabled || loading,
    },
    className
  )

  return (
    <button className={buttonClasses} disabled={disabled || loading} {...props}>
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
