'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedCount, setSeedCount] = useState(10000);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSeed = async () => {
    setIsSeeding(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/seed-large', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: seedCount }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || `Successfully seeded ${data.count} advocates`);
      } else {
        setError(data.error || 'Failed to seed database');
      }
    } catch (err) {
      setError('Network error: Failed to connect to seed endpoint');
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSmallSeed = async () => {
    setIsSeeding(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Successfully seeded default advocates');
      } else {
        setError(data.error || 'Failed to seed database');
      }
    } catch (err) {
      setError('Network error: Failed to connect to seed endpoint');
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Database Seeding</h2>
        
        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Large seeding operations may take several minutes to complete.</p>
                <p>This will add data to your existing database without clearing it first.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Small Seed Section */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-medium mb-3">Small Dataset (16 advocates)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Seed the database with the default 16 advocates for testing.
          </p>
          <button
            onClick={handleSmallSeed}
            disabled={isSeeding}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSeeding ? 'Seeding...' : 'Seed Small Dataset'}
          </button>
        </div>

        {/* Large Seed Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Large Dataset</h3>
          <p className="text-sm text-gray-600 mb-4">
            Generate and seed a large number of random advocates for performance testing.
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <label htmlFor="seedCount" className="text-sm font-medium text-gray-700">
              Number of advocates:
            </label>
            <input
              id="seedCount"
              type="number"
              min="1"
              max="100000"
              value={seedCount}
              onChange={(e) => setSeedCount(parseInt(e.target.value) || 1)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSeeding}
            />
            <span className="text-sm text-gray-500">(Max: 100,000)</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSeedCount(1000)}
              disabled={isSeeding}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              1K
            </button>
            <button
              onClick={() => setSeedCount(5000)}
              disabled={isSeeding}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              5K
            </button>
            <button
              onClick={() => setSeedCount(10000)}
              disabled={isSeeding}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              10K
            </button>
            <button
              onClick={() => setSeedCount(25000)}
              disabled={isSeeding}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              25K
            </button>
            <button
              onClick={() => setSeedCount(50000)}
              disabled={isSeeding}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              50K
            </button>
          </div>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSeeding ? `Seeding ${seedCount} advocates...` : `Seed ${seedCount} Advocates`}
          </button>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {isSeeding && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-blue-800">Seeding in progress... This may take a few minutes for large datasets.</p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Admin Features */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="space-y-2">
          <a href="/" className="block text-blue-600 hover:underline">
            → View Advocates List
          </a>
          <a href="/api/advocates" className="block text-blue-600 hover:underline">
            → API Endpoint (GET /api/advocates)
          </a>
          <a href="/api/seed" className="block text-blue-600 hover:underline">
            → Small Seed Endpoint (POST /api/seed)
          </a>
          <a href="/api/seed-large" className="block text-blue-600 hover:underline">
            → Large Seed Endpoint (POST /api/seed-large)
          </a>
        </div>
      </div>
    </div>
  );
}