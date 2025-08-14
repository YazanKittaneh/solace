"use client";

import { useEffect, useState } from "react";
import type { Advocate } from "../types/advocate";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/advocates");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch advocates: ${response.statusText}`);
        }
        
        const jsonResponse = await response.json();
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load advocates");
        console.error("Error fetching advocates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocates();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredAdvocates(advocates);
      return;
    }

    const filtered = advocates.filter((advocate) => {
      const searchableText = [
        advocate.firstName,
        advocate.lastName,
        advocate.city,
        advocate.degree,
        ...advocate.specialties,
        advocate.yearsOfExperience.toString()
      ].join(" ").toLowerCase();

      return searchableText.includes(term);
    });

    setFilteredAdvocates(filtered);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Solace Advocates</h1>
        <div className="text-gray-600">Loading advocates...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Solace Advocates</h1>
        <div className="text-red-600">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Solace Advocates</h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <label htmlFor="search" className="block text-sm font-medium mb-2">
          Search Advocates
        </label>
        {searchTerm && (
          <p className="text-sm text-gray-600 mb-2">
            Searching for: <span className="font-semibold">{searchTerm}</span>
          </p>
        )}
        <div className="flex gap-2">
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by name, city, degree, specialties..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            Reset Search
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Found {filteredAdvocates.length} advocate{filteredAdvocates.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filteredAdvocates.length === 0 ? (
        <div className="text-gray-600">No advocates found matching your search.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">First Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Last Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">City</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Degree</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Specialties</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Years of Experience</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdvocates.map((advocate, index) => (
                <tr key={advocate.id || index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{advocate.firstName}</td>
                  <td className="border border-gray-300 px-4 py-2">{advocate.lastName}</td>
                  <td className="border border-gray-300 px-4 py-2">{advocate.city}</td>
                  <td className="border border-gray-300 px-4 py-2">{advocate.degree}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <ul className="list-disc list-inside">
                      {advocate.specialties.map((specialty, idx) => (
                        <li key={idx} className="text-sm">{specialty}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{advocate.yearsOfExperience}</td>
                  <td className="border border-gray-300 px-4 py-2">{advocate.phoneNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}