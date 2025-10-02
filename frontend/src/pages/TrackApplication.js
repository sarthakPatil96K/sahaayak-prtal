import React, { useState } from 'react';
import { MagnifyingGlassIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const TrackApplication = () => {
  const [trackingId, setTrackingId] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (trackingId) {
      try {
        setLoading(true);
        setError('');
        setApplication(null);

        const trackButton = e.target.querySelector('button[type="submit"]');
        const originalText = trackButton.textContent;
        trackButton.textContent = 'Tracking...';
        trackButton.disabled = true;

        console.log('🔍 Tracking application:', trackingId);

        // API call to get application by ID
        const response = await fetch(`http://localhost:8080/api/applications/${trackingId}`);
        
        console.log('📨 Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📨 Response data:', result);
          
          if (result.success && result.data) {
            setApplication(result.data);
          } else {
            setError(`Application not found: ${result.message || 'Unknown error'}`);
            setApplication(null);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Tracking error:', error);
        setError(`Error tracking application: ${error.message}`);
        setApplication(null);
      } finally {
        setLoading(false);
        const trackButton = e.target.querySelector('button[type="submit"]');
        if (trackButton) {
          trackButton.textContent = 'Track Application';
          trackButton.disabled = false;
        }
      }
    }
  };

  // Generate steps based on application status - ONLY when application exists
  const generateSteps = (app) => {
    if (!app) return [];
    
    const steps = [
      { 
        name: 'Application Submitted', 
        status: 'completed', 
        date: new Date(app.createdAt).toLocaleDateString(),
        description: 'Your application has been received and is under review'
      }
    ];

    // Add steps based on current status
    switch (app.status) {
      case 'verified':
        steps.push(
          {
            name: 'Document Verification',
            status: 'completed',
            date: new Date(app.updatedAt).toLocaleDateString(),
            description: 'Documents verified successfully'
          },
          {
            name: 'Approval Pending',
            status: 'current',
            date: 'In progress',
            description: 'Waiting for final approval and DBT processing'
          }
        );
        break;
        
      case 'approved':
        steps.push(
          {
            name: 'Document Verification',
            status: 'completed',
            date: new Date(app.updatedAt).toLocaleDateString(),
            description: 'Documents verified successfully'
          },
          {
            name: 'Approval Process',
            status: 'completed',
            date: new Date(app.updatedAt).toLocaleDateString(),
            description: 'Application approved for DBT processing'
          },
          {
            name: 'DBT Processing',
            status: 'current',
            date: 'In progress',
            description: 'Amount transfer to your bank account is being processed'
          }
        );
        break;
        
      case 'rejected':
        steps.push(
          {
            name: 'Application Review',
            status: 'completed',
            date: new Date(app.updatedAt).toLocaleDateString(),
            description: 'Application was reviewed but not approved'
          },
          {
            name: 'Application Rejected',
            status: 'completed',
            date: new Date(app.updatedAt).toLocaleDateString(),
            description: 'Application was not approved'
          }
        );
        break;
        
      default: // pending
        steps.push({
          name: 'Under Review',
          status: 'current',
          date: 'In progress',
          description: 'Your application is being reviewed by our officers'
        });
    }

    return steps;
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

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Only generate steps when application exists
  const steps = application ? generateSteps(application) : [];

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
                  placeholder="Enter your application ID (e.g., VIC1759419567985)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !trackingId.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                {loading ? 'Tracking...' : 'Track Application'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <XCircleIcon className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Application Status */}
        {application && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Application Header */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Application #{application.applicationId}</h2>
                  <p className="text-gray-600 mt-1">
                    {application.personalDetails?.fullName || 
                     (application.coupleDetails ? `${application.coupleDetails.husbandName} & ${application.coupleDetails.wifeName}` : 'N/A')}
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

            {/* Progress Steps */}
            <div className="space-y-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Application Progress</h3>
              {steps.length > 0 ? (
                steps.map((step, index) => (
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
                ))
              ) : (
                <p className="text-gray-500">No progress information available.</p>
              )}
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Details */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Applicant Details</h3>
                {application.personalDetails ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {application.personalDetails.fullName}</p>
                    <p><strong>Aadhaar:</strong> {application.personalDetails.aadhaarNumber}</p>
                    <p><strong>Mobile:</strong> {application.personalDetails.mobileNumber}</p>
                    <p><strong>Email:</strong> {application.personalDetails.email || 'Not provided'}</p>
                    <p><strong>Address:</strong> {application.personalDetails.address}</p>
                    <p><strong>District:</strong> {application.personalDetails.district}</p>
                  </div>
                ) : application.coupleDetails ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Husband:</strong> {application.coupleDetails.husbandName}</p>
                    <p><strong>Wife:</strong> {application.coupleDetails.wifeName}</p>
                    <p><strong>Marriage Date:</strong> {new Date(application.coupleDetails.marriageDate).toLocaleDateString()}</p>
                  </div>
                ) : null}
              </div>

              {/* Incident/Marriage Details */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {application.incidentDetails ? 'Incident Details' : 'Marriage Details'}
                </h3>
                {application.incidentDetails ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Type:</strong> {application.incidentDetails.type}</p>
                    <p><strong>Date:</strong> {new Date(application.incidentDetails.date).toLocaleDateString()}</p>
                    <p><strong>Location:</strong> {application.incidentDetails.location}</p>
                    <p><strong>Description:</strong> {application.incidentDetails.description}</p>
                  </div>
                ) : application.coupleDetails ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Husband Caste:</strong> {application.coupleDetails.husbandCaste}</p>
                    <p><strong>Wife Caste:</strong> {application.coupleDetails.wifeCaste}</p>
                    <p><strong>Certificate No:</strong> {application.coupleDetails.marriageCertificateNumber}</p>
                  </div>
                ) : null}
              </div>
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
        {trackingId && !application && !loading && !error && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Application Not Found</h3>
            <p className="text-gray-600">
              No application found with ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{trackingId}</span>
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