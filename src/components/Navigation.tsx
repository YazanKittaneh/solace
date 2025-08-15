'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavigationItem {
  href: string;
  label: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Advocates',
    description: 'Browse and search healthcare advocates',
  },
  {
    href: '/admin',
    label: 'Admin',
    description: 'Database management and seeding',
  },
  {
    href: '/api/advocates',
    label: 'API',
    description: 'Access advocate data via API',
  },
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const pathname = usePathname();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav 
      className="bg-white border-b border-gray-200 shadow-sm relative z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link 
              href="/"
              className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              aria-label="Solace home page"
            >
              <div className="h-8 w-8 rounded bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg" aria-hidden="true">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Solace
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      rounded-md px-3 py-2 text-sm font-medium transition-colors
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                      ${isActive
                        ? 'bg-primary-100 text-primary-900 border border-primary-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                    title={item.description}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">
                {isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              </span>
              {/* Hamburger icon */}
              <svg
                className={`h-6 w-6 transition-transform ${
                  isReducedMotion ? '' : 'duration-200'
                } ${isMobileMenuOpen ? 'rotate-45' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`
          md:hidden transition-all ${isReducedMotion ? '' : 'duration-300 ease-in-out'}
          ${isMobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
          }
        `}
        id="mobile-menu"
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="border-t border-gray-200 bg-white px-2 pb-3 pt-2 shadow-lg">
          <div className="space-y-1" role="menu" aria-orientation="vertical">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block rounded-md px-3 py-2 text-base font-medium transition-colors
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    ${isActive
                      ? 'bg-primary-100 text-primary-900 border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div>
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 md:hidden z-40"
          aria-hidden="true"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}