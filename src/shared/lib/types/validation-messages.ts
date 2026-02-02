export interface AuthValidationMessages {
  email: {
    required: string
    invalid: string
  }
  password: {
    required: string
    minLength: string
    maxLength: string
    uppercase: string
    lowercase: string
    number: string
  }
  name: {
    required: string
    minLength: string
    maxLength: string
  }
  docNumber: {
    required: string
    minLength: (min: number) => string
    maxLength: (max: number) => string
    invalid: (label: string) => string
  }
  confirmPassword: {
    required: string
    mismatch: string
  }
  docType: {
    mismatch: (expected: string, country: string) => string
  }
}
