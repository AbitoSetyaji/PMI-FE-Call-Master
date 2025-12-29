/**
 * Form Error Display Components
 * Reusable components for displaying form validation errors
 */

import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

/**
 * Inline field error message
 */
export function FieldError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      {message}
    </p>
  );
}

interface FormErrorsProps {
  errors: Record<string, { message?: string }>;
}

/**
 * Display all form errors in a summary
 */
export function FormErrorsSummary({ errors }: FormErrorsProps) {
  const errorMessages = Object.values(errors)
    .map((error) => error.message)
    .filter(Boolean);

  if (errorMessages.length === 0) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {errorMessages.map((message, index) => (
              <li key={index} className="text-sm text-red-800">
                {message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface ApiErrorProps {
  error: Error | null;
  className?: string;
}

/**
 * Display API error messages
 */
export function ApiError({ error, className = "" }: ApiErrorProps) {
  if (!error) return null;

  const axiosError = error as { response?: { data?: { detail?: string } } };
  const message =
    axiosError?.response?.data?.detail || error.message || "An error occurred";

  return (
    <div
      className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
          <p className="text-sm text-red-800">{message}</p>
        </div>
      </div>
    </div>
  );
}

interface ValidationErrorProps {
  title?: string;
  message: string;
  className?: string;
}

/**
 * Generic validation error display
 */
export function ValidationError({
  title = "Validation Error",
  message,
  className = "",
}: ValidationErrorProps) {
  return (
    <div
      className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-yellow-800">{message}</p>
        </div>
      </div>
    </div>
  );
}
