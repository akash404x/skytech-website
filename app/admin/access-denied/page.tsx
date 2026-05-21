'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDenied() {
  const router = useRouter();

  return (
    <div className="tech-loading-screen">
      <div className="tech-glass-panel mx-4 w-full max-w-md rounded-2xl p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>

          <p className="mb-6 text-gray-600">
            You don&apos;t have permission to access this page. This area is restricted to administrators only.
          </p>

          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="tech-btn-primary flex w-full items-center justify-center px-4 py-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Go to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
