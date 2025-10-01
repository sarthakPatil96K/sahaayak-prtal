import React, { useState } from 'react';
import { ExclamationTriangleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const GrievanceRedressal = () => {
  const [grievance, setGrievance] = useState({
    applicationId: '',
    type: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Grievance submitted successfully! You will receive updates via SMS.');
    // Reset form
    setGrievance({
      applicationId: '',
      type: '',
      description: '',
      priority: 'medium'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Grievance Redressal</h1>
          <p className="text-xl text-gray-600">Report issues with your application or process</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application ID *
                </label>
                <input
                  type="text"
                  value={grievance.applicationId}
                  onChange={(e) => setGrievance({...grievance, applicationId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your application ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grievance Type *
                </label>
                <select
                  value={grievance.type}
                  onChange={(e) => setGrievance({...grievance, type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select type</option>
                  <option value="delay">Application Delay</option>
                  <option value="verification">Document Verification Issue</option>
                  <option value="payment">Payment/DBT Issue</option>
                  <option value="officer">Officer Responsiveness</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex space-x-4">
                  {['low', 'medium', 'high'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value={level}
                        checked={grievance.priority === level}
                        onChange={(e) => setGrievance({...grievance, priority: e.target.value})}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={grievance.description}
                  onChange={(e) => setGrievance({...grievance, description: e.target.value})}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Please describe your grievance in detail..."
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Your grievance will be addressed within 7 working days. 
                    You can track the status using your Application ID.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Submit Grievance
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GrievanceRedressal;