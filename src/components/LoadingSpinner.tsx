// src/components/LoadingSpinner.tsx
import React, { CSSProperties } from 'react';

interface LoadingSpinnerProps {
  /**
   * If true, the spinner will act as a fixed, full-screen overlay.
   * Defaults to `false`.
   */
  fullScreen?: boolean;
  /**
   * Defines the size of the spinner.
   * 'sm' (small), 'md' (medium), 'lg' (large).
   * Defaults to 'md'.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional Tailwind CSS classes or custom classes to apply to the spinner's container.
   */
  className?: string;
}

/**
 * A versatile loading spinner component that can be used inline or as a full-screen overlay.
 * It uses Tailwind CSS for styling.
 *
 * @param {LoadingSpinnerProps} props - The props for the LoadingSpinner component.
 */
export default function LoadingSpinner({ 
  fullScreen = false, 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) {
  // Define Tailwind CSS classes for different spinner sizes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  // Base classes for the spinner itself (the spinning circle)
  // Assumes 'border-primary' is a Tailwind color utility or custom color defined in your tailwind.config.js
  const spinnerCircleClasses = `animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`; 
  // Changed border-primary to border-blue-500 for a default visible color if 'primary' isn't configured in Tailwind.
  // If 'border-primary' works in your setup, feel free to revert it.

  if (fullScreen) {
    // Styles for the full-screen overlay container
    const fullScreenOverlayStyles: CSSProperties = {
      position: 'fixed', // Fixed to the viewport
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center', // Center horizontally
      alignItems: 'center',     // Center vertically
      backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white background
      zIndex: 9999, // Ensures the spinner is on top of other content
    };

    return (
      <div 
        style={fullScreenOverlayStyles}
        className={`loading-spinner-fullscreen-container ${className}`} // Add a specific class and pass through custom classes
      >
        <div className={`loading-spinner-circle ${spinnerCircleClasses}`} />
      </div>
    );
  }

  // Styles for an inline spinner (not full screen)
  return (
    <div 
      className={`flex justify-center items-center loading-spinner-inline-container ${className}`} // Flex to center the spinner within its parent, and custom classes
    >
      <div className={`loading-spinner-circle ${spinnerCircleClasses}`} />
    </div>
  );
}