import React from "react";
import { cn } from "../utils/cn";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  required?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, label, required, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className={cn(
              "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
              error && "border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <label className="text-sm font-medium text-gray-700">
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </label>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";