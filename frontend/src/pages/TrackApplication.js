import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { MagnifyingGlassIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const TrackApplication = () => {
  const [trackingId, setTrackingId] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError('');
    setApplication(null);

    try {
      // Smart Endpoint Detection: Determines the API endpoint based on ID prefix.
      const idUpper = trackingId.toUpperCase();
      let endpoint = '';
      let appType = '';

      if (idUpper.startsWith('MAR')) {
  endpoint = `${API_BASE_URL}/intercaste-marriage/${trackingId}`;
        appType = 'marriage';
      } else if (idUpper.startsWith('VIC')) {
  endpoint = `${API_BASE_URL}/applications/${trackingId}`;
        appType = 'victim';
      } else {
        throw new Error("Invalid Application ID format. It should start with 'VIC' or 'MAR'.");
      }

      console.log(`🔍 Tracking ${appType} application at: ${endpoint}`);

      const response = await fetch(endpoint);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Application not found or server error.`);
      }
      
      if (result.success && result.data) {
        setApplication({ ...result.data, type: appType });
      } else {
        setError(result.message || 'Application data could not be retrieved.');
      }
    } catch (error) {
      console.error('Tracking error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSteps = (app) => {
    if (!app) return [];

    const baseSteps = [
      { name: 'Application Submitted', status: 'completed', date: new Date(app.createdAt).toLocaleDateString(), description: 'Your application has been received.' },
    ];

    const processingSteps = [];
    app.processingHistory?.forEach(historyItem => {
        if (historyItem.status === 'pending') return;
        processingSteps.push({
            name: `Status: ${historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1)}`,
            status: 'completed',
            date: new Date(historyItem.timestamp).toLocaleDateString(),
            description: historyItem.comments || `Application moved to ${historyItem.status}.`
        });
    });

    const finalSteps = [...baseSteps, ...processingSteps];
    
    if (app.status !== 'approved' && app.status !== 'rejected' && app.status !== 'disbursed') {
        finalSteps.push({
            name: 'In Progress',
            status: 'current',
            date: 'Pending',
            description: 'Application is currently being processed by an officer.'
        });
    }

    return finalSteps;
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-5 h-5" />;
      case 'current': return <ClockIcon className="w-5 h-5" />;
      default: return <XCircleIcon className="w-5 h-5" />;
    }
  };
  
  const getApplicationStatusColor = (status) => {
    const config = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      disbursed: 'bg-purple-100 text-purple-800',
    };
    return config[status] || 'bg-gray-100 text-gray-800';
  };
  
  const steps = application ? generateSteps(application) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Application</h1>
          <p className="text-xl text-gray-600">Enter your application ID to check the status.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">Application ID</label>
              <div className="relative">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input type="text" id="trackingId" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="e.g., VIC... or MAR..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={loading || !trackingId.trim()} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <MagnifyingGlassIcon className="w-5 h-5" />
                {loading ? 'Tracking...' : 'Track Application'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <XCircleIcon className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Tracking Failed</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {application && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Application #{application.applicationId}</h2>
                  <p className="text-gray-600 mt-1">
                    {application.type === 'marriage'
                      ? `${application.coupleDetails.husbandName} & ${application.coupleDetails.wifeName}`
                      : application.personalDetails.fullName
                    }
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getApplicationStatusColor(application.status)}`}>
                    {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(application.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₹{(application.amount || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Application Progress</h3>
              {steps.length > 0 ? (
                steps.map((step) => (
                  <div key={step.name} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${step.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{step.name}</h3>
                        <span className="text-sm text-gray-500">{step.date}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No progress information available.</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {application.type === 'marriage' ? (
                <>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Couple Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Husband:</strong> {application.coupleDetails.husbandName} ({application.coupleDetails.husbandCaste})</p>
                      <p><strong>Wife:</strong> {application.coupleDetails.wifeName} ({application.coupleDetails.wifeCaste})</p>
                      <p><strong>Marriage Date:</strong> {new Date(application.coupleDetails.marriageDate).toLocaleDateString()}</p>
                      <p><strong>Certificate No:</strong> {application.coupleDetails.marriageCertificateNumber}</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Mobile:</strong> {application.addressDetails.mobileNumber}</p>
                      <p><strong>State:</strong> {application.addressDetails.state}</p>
                      <p><strong>District:</strong> {application.addressDetails.district}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Applicant Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {application.personalDetails.fullName}</p>
                      <p><strong>Aadhaar:</strong> {application.personalDetails.aadhaarNumber}</p>
                      <p><strong>Mobile:</strong> {application.personalDetails.mobileNumber}</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Incident Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {application.incidentDetails.type}</p>
                      <p><strong>Date:</strong> {new Date(application.incidentDetails.date).toLocaleDateString()}</p>
                      <p><strong>Description:</strong> {application.incidentDetails.description}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

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

        {trackingId && !application && !loading && !error && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Searching...</h3>
            <p className="text-gray-500 text-sm mt-2">
              If no results appear, please check your application ID and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackApplication;