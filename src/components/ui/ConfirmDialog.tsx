import { useState, ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
  icon?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
  icon,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    warning: {
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    },
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className={`${styles.iconBg} rounded-full p-3`}>
              {icon || (
                <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${styles.button}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing confirm dialog state
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<ConfirmDialogProps>>({});

  const show = (dialogConfig: Partial<ConfirmDialogProps>) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  };

  const hide = () => {
    setIsOpen(false);
    setTimeout(() => setConfig({}), 300); // Clear after animation
  };

  return {
    isOpen,
    show,
    hide,
    config,
  };
}
