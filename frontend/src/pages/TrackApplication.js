import React, { useState } from 'react';
import { MagnifyingGlassIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const TrackApplication = () => {
  const [trackingId, setTrackingId] = useState('');
  const [application, setApplication] = useState(null);

  // Mock application data
  const mockApplication = {
    id: 'APP2024001',
    status: 'approved',
    applicantName: 'Ramesh Kumar',
    incidentType: 'Discrimination',
    submittedDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    amount: 50000,
    steps: [
      { name: 'Application Submitted', status: 'completed', date: '2024-01-15', description: 'Your application has been received' },
      { name: 'Document Verification', status: 'completed', date: '2024-01-16', description: 'Documents verified successfully' },
      { name: 'Officer Review', status: 'completed', date: '2024-01-18', description: 'Application approved by officer' },
      { name: 'DBT Processing', status: 'completed', date: '2024-01-20', description: 'Amount transferred to your account' },
      { name: 'Completed', status: 'current', date: '2024-01-20', description: 'Process completed successfully' }
    ]
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingId) {
      // In real app, this would be an API call
      setApplication(mockApplication);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-5 h-5" />;
      case 'current': return <ClockIcon className="w-5 h-5" />;
      case 'pending': return <ClockIcon className="w-5 h-5" />;
      default: return <XCircleIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Application</h1>
          <p className="text-xl text-gray-600">Enter your application ID to check the status</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                Application ID
              </label>
              <div className="relative">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  id="trackingId"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your application ID (e.g., APP2024001)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                Track Application
              </button>
            </div>
          </form>
        </div>

        {/* Application Status */}
        {application && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Application Header */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Application #{application.id}</h2>
                  <p className="text-gray-600 mt-1">{application.applicantName} • {application.incidentType}</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="font-medium">{application.submittedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{application.lastUpdated}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₹{application.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-8">
              {application.steps.map((step, index) => (
                <div key={step.name} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${
                        step.status === 'completed' || step.status === 'current' ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </h3>
                      <span className="text-sm text-gray-500">{step.date}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-700">
                If you have any questions about your application status, please contact our support team at 
                <span className="font-semibold"> 1800-1234-5678</span> or email 
                <span className="font-semibold"> support@sahaayak.gov.in</span>
              </p>
            </div>
          </div>
        )}

        {/* No Application Found */}
        {trackingId && !application && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Application Not Found</h3>
            <p className="text-gray-600">
              No application found with ID: <span className="font-mono">{trackingId}</span>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please check your application ID and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackApplication;