'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/client/csrf';
import LoadingSpinner from '@/components/LoadingSpinner';

const PASSWORD_REQUIREMENTS = [
  {
    label: 'Must be at least 8 characters',
    test: (value) => value.length >= 8,
  },
  {
    label: 'Must have an uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    label: 'Must have a lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    label: 'Must have a number',
    test: (value) => /\d/.test(value),
  },
  {
    label: 'Must have a special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

const PASSWORD_ERROR_MESSAGE =
  'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.';

const passwordMeetsRequirements = (value) =>
  PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value));

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const passwordChecks = PASSWORD_REQUIREMENTS.map((requirement) => ({
    label: requirement.label,
    met: requirement.test(formData.password),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordMeetsRequirements(formData.password)) {
      setError(PASSWORD_ERROR_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sign up failed');
      }

      router.refresh();
      router.push('/profile');
    } catch (err) {
      setError(err.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 flex items-center justify-center px-4 py-12 text-slate-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Sign Up</h1>

        <p className="text-gray-600 mb-6 text-center">
          Create an account to save your reports and track their status updates.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              autoComplete="new-password"
              title={PASSWORD_ERROR_MESSAGE}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2 space-y-0.5">
              {passwordChecks.map((requirement) => (
                <p
                  key={requirement.label}
                  className={`text-xs font-medium transition ${
                    requirement.met
                      ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                      : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                  }`}
                >
                  {requirement.label}
                </p>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Creating account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
