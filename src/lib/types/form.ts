export interface FormFieldError {
  message: string;
  type: string;
}

export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, FormFieldError>;
}

export interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}