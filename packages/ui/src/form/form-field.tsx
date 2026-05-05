import { cn } from '../cn'
import { Input } from '../input'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  className?: string
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  required,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={name} className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
