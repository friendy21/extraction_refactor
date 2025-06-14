// components/setup/setup-layout.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface SetupLayoutProps {
  children: React.ReactNode;
}

const steps = [
  { id: 'organization', name: 'Organization', path: '/setup/organization' },
  { id: 'connection', name: 'Connection', path: '/setup/connection' },
  { id: 'employees', name: 'Employees', path: '/setup/employees' },
  { id: 'data', name: 'Data', path: '/setup/data' },
  { id: 'anonymization', name: 'Anonymization', path: '/setup/anonymization' },
  { id: 'review', name: 'Review', path: '/setup/review' },
];

export default function SetupLayout({ children }: SetupLayoutProps) {
  const pathname = usePathname();

  const getCurrentStepIndex = () => {
    const currentStep = steps.findIndex(step => step.path === pathname);
    return currentStep >= 0 ? currentStep : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Glynac</h1>
              <span className="ml-2 text-sm text-gray-500">Admin Setup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <nav aria-label="Progress">
              <ol className="flex items-center justify-center space-x-8">
                {steps.map((step, index) => (
                  <li key={step.id} className="flex items-center">
                    {/* Step Circle */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                          flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium
                          ${index < currentStepIndex
                            ? 'bg-green-600 text-white'
                            : index === currentStepIndex
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                          }
                        `}
                      >
                        {index < currentStepIndex ? (
                          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`mt-2 text-sm font-medium ${index === currentStepIndex ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}