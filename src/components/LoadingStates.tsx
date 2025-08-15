import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'gray' | 'white';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    gray: 'text-gray-600',
    white: 'text-white',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({
  isLoading,
  children,
  disabled,
  className = '',
  onClick,
  type = 'button',
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center px-4 py-2 border border-transparent
        text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 
        hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors ${className}
      `}
    >
      {isLoading && (
        <LoadingSpinner size="sm" color="white" className="mr-2" />
      )}
      {children}
    </button>
  );
}

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export function Skeleton({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = false 
}: SkeletonProps) {
  return (
    <div
      className={`
        bg-gray-200 animate-pulse ${width} ${height} 
        ${rounded ? 'rounded-full' : 'rounded'} ${className}
      `}
      aria-hidden="true"
    />
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}: TableSkeletonProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* Header skeleton */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={`header-${index}`} height="h-5" />
            ))}
          </div>
        </div>
        
        {/* Rows skeleton */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="px-6 py-4">
              <div className="grid grid-cols-4 gap-4 items-center">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton 
                    key={`cell-${rowIndex}-${colIndex}`} 
                    height="h-4"
                    width={colIndex === 0 ? 'w-3/4' : 'w-full'}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className = '' }: CardSkeletonProps) {
  return (
    <div className={`bg-white shadow-sm rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton width="w-12" height="h-12" rounded />
          <div className="space-y-2 flex-1">
            <Skeleton width="w-1/2" height="h-5" />
            <Skeleton width="w-1/4" height="h-4" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton height="h-4" />
          <Skeleton width="w-3/4" height="h-4" />
          <Skeleton width="w-1/2" height="h-4" />
        </div>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...', 
  className = '' 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={`
      fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
      transition-opacity duration-200 ${className}
    `}>
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="flex items-center space-x-3">
          <LoadingSpinner size="lg" />
          <div>
            <p className="text-lg font-medium text-gray-900">{message}</p>
            <p className="text-sm text-gray-500">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Progressive loading wrapper
interface ProgressiveLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export function ProgressiveLoader({ 
  children, 
  fallback, 
  delay = 200 
}: ProgressiveLoaderProps) {
  const [showFallback, setShowFallback] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Lazy loading wrapper with intersection observer
interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export function LazyLoader({
  children,
  fallback = <Skeleton height="h-32" />,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
}: LazyLoaderProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, hasLoaded]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
}