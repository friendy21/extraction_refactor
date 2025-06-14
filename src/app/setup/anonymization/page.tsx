'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SetupLayout from '@/components/setup/setup-layout';
import { useRunAnonymization, useGetEmployees } from '@/hooks/api';

export default function AnonymizationSetupPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [anonymizationComplete, setAnonymizationComplete] = useState(false);
  
  const router = useRouter();
  const { data: employeesData } = useGetEmployees();
  const runAnonymizationMutation = useRunAnonymization();

  const employees = employeesData?.data || [];
  const includedEmployees = employees.filter(emp => emp.status === 'included');

  const handleRunAnonymization = async () => {
    try {
      await runAnonymizationMutation.mutateAsync();
      setAnonymizationComplete(true);
    } catch (error) {
      console.error('Failed to run anonymization:', error);
    }
  };

  const handleContinue = () => {
    router.push('/setup/review');
  };

  const handleBack = () => {
    router.push('/setup/data');
  };

  const sampleData = {
    before: {
      from: "John Smith <john.smith@company.com>",
      to: "Sarah Williams <sarah.williams@company.com>",
      subject: "Project Update - Q3 Roadmap",
      content: "Hi Sarah, I wanted to follow up on our discussion yesterday about the Q3 roadmap. David mentioned that we need to prioritize the mobile app features, but I think we should focus on the API improvements first. Let's discuss this with Michael and Emma during tomorrow's meeting. Thanks, John"
    },
    after: {
      from: "User1024 <user1024@anonymous.glynac>",
      to: "User1036 <user1036@anonymous.glynac>",
      subject: "Project Update - Q3 Roadmap",
      content: "Hi User1036, I wanted to follow up on our discussion yesterday about the Q3 roadmap. User1042 mentioned that we need to prioritize"
    },
    chat: {
      before: [
        { name: "Robert Johnson", message: "Have you reviewed the design proposal from the marketing team?" },
        { name: "Jane Doe", message: "Yes, I've looked at it. I think we need to discuss it with Emily before proceeding." },
        { name: "Robert Johnson", message: "Good idea. I'll set up a meeting with Emily and the team for tomorrow." }
      ],
      after: [
        { name: "User1052", message: "Have you reviewed the design proposal from the marketing team?" },
        { name: "User1041", message: "Yes, I've looked at it. I think we need to discuss it with User1038 before proceeding." },
        { name: "User1052", message: "Good idea. I'll set up a meeting with User1038 and the team for tomorrow." }
      ]
    }
  };

  return (
    <SetupLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">PII Anonymization</h1>
          <p className="text-lg text-gray-600">
            Protect employee privacy by anonymizing personal identifiable information.
          </p>
        </div>

        {/* How Anonymization Works */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How Anonymization Works</h2>
          <p className="text-gray-600 mb-6">
            Glynac uses a secure anonymization process to protect employee privacy while maintaining data analysis integrity.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Automatic Identity Protection</h3>
              <p className="text-sm text-gray-600">
                All names, email addresses, and other personally identifiable information are automatically replaced with anonymous IDs by the system.
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">One-Click Anonymization</h3>
              <p className="text-sm text-gray-600">
                With a single action, you can trigger Glynac's powerful anonymization engine to process all collected data, ensuring complete employee privacy protection.
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Secure Analysis</h3>
              <p className="text-sm text-gray-600">
                The Glynac analysis engine only processes the anonymized data, ensuring complete employee privacy throughout all analysis phases.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Anonymization */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Preview Anonymization</h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
          <p className="text-gray-600">See how your data will look after anonymization.</p>

          {showPreview && (
            <div className="mt-6 space-y-6">
              {/* Email Sample */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Sample Email Before Anonymization</h4>
                <div className="bg-gray-50 p-4 rounded border text-sm space-y-2">
                  <div><strong>From:</strong> {sampleData.before.from}</div>
                  <div><strong>To:</strong> {sampleData.before.to}</div>
                  <div><strong>Subject:</strong> {sampleData.before.subject}</div>
                  <div className="pt-2 border-t">
                    <div className="text-gray-700">{sampleData.before.content}</div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Same Email After Anonymization</h4>
                <div className="bg-green-50 p-4 rounded border text-sm space-y-2">
                  <div><strong>From:</strong> <span className="text-green-700">{sampleData.after.from}</span></div>
                  <div><strong>To:</strong> <span className="text-green-700">{sampleData.after.to}</span></div>
                  <div><strong>Subject:</strong> {sampleData.after.subject}</div>
                  <div className="pt-2 border-t">
                    <div className="text-gray-700">{sampleData.after.content}</div>
                  </div>
                </div>
              </div>

              {/* Chat Sample */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Sample Chat Before Anonymization</h4>
                  <div className="space-y-3">
                    {sampleData.chat.before.map((msg, idx) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded">
                        <div className="font-medium text-blue-900">{msg.name}</div>
                        <div className="text-gray-700 text-sm mt-1">{msg.message}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Same Chat After Anonymization</h4>
                  <div className="space-y-3">
                    {sampleData.chat.after.map((msg, idx) => (
                      <div key={idx} className="bg-green-50 p-3 rounded">
                        <div className="font-medium text-green-700">{msg.name}</div>
                        <div className="text-gray-700 text-sm mt-1">{msg.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Run Anonymization */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Run Anonymization</h2>
            <button
              onClick={handleRunAnonymization}
              disabled={runAnonymizationMutation.isPending || anonymizationComplete}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {runAnonymizationMutation.isPending ? 'Running...' : anonymizationComplete ? 'Completed' : 'Run Anonymization'}
            </button>
          </div>
          <p className="text-gray-600 mb-4">Start the anonymization process for all collected data.</p>

          {anonymizationComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 font-medium">
                  ✓ Anonymization complete! All personal identifiable information has been secured.
                </span>
              </div>
            </div>
          )}

          {/* Anonymization Summary */}
          {anonymizationComplete && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Anonymization Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{includedEmployees.length}</div>
                  <div className="text-sm text-gray-600">employees anonymized</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">78,432</div>
                  <div className="text-sm text-gray-600">emails processed</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">121,548</div>
                  <div className="text-sm text-gray-600">chat messages anonymized</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">10,762</div>
                  <div className="text-sm text-gray-600">meetings processed</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">43,684</div>
                  <div className="text-sm text-gray-600">file accesses anonymized</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Assurance */}
        {anonymizationComplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Privacy Assurance</h3>
            <p className="text-blue-800">
              All personal identifiable information has been anonymized. The Glynac analysis engine will only process 
              anonymized data to ensure employee privacy.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            ← Back
          </button>
          
          <button
            type="button"
            onClick={handleContinue}
            disabled={!anonymizationComplete}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </SetupLayout>
  );
}