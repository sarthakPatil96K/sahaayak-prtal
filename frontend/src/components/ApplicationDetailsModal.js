import React from 'react';
import { XMarkIcon, HeartIcon, UserIcon } from '@heroicons/react/24/outline';

const ApplicationDetailsModal = ({ application, isOpen, onClose }) => {
  if (!isOpen || !application) return null;

  // Check if it's a marriage application
  const isMarriageApplication = application.coupleDetails !== undefined;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationTypeBadge = () => {
    const config = isMarriageApplication ? 
      { color: 'bg-pink-100 text-pink-800', label: 'Inter-Caste Marriage' } :
      { color: 'bg-orange-100 text-orange-800', label: 'Victim Compensation' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Application Details - {application.id}
                </h3>
                <div className="flex items-center space-x-2">
                  {getApplicationTypeBadge()}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {application.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Dynamic Content based on Application Type */}
                {isMarriageApplication ? (
                  /* Inter-Caste Marriage Application Details */
                  <>
                    {/* Couple Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <HeartIcon className="w-5 h-5 text-pink-500 mr-2" />
                        Couple Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Husband Name:</span>
                          <p className="text-gray-900">{application.coupleDetails.husbandName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Wife Name:</span>
                          <p className="text-gray-900">{application.coupleDetails.wifeName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Husband Caste:</span>
                          <p className="text-gray-900">{application.coupleDetails.husbandCaste}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Wife Caste:</span>
                          <p className="text-gray-900">{application.coupleDetails.wifeCaste}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Marriage Date:</span>
                          <p className="text-gray-900">{application.coupleDetails.marriageDate}</p>
                        </div>
                        {application.coupleDetails.marriageCertificateNumber && (
                          <div>
                            <span className="font-medium text-gray-700">Certificate No:</span>
                            <p className="text-gray-900">{application.coupleDetails.marriageCertificateNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Address:</span>
                          <p className="text-gray-900">{application.contactDetails.address}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Mobile:</span>
                          <p className="text-gray-900">{application.contactDetails.mobileNumber}</p>
                        </div>
                        {application.contactDetails.email && (
                          <div>
                            <span className="font-medium text-gray-700">Email:</span>
                            <p className="text-gray-900">{application.contactDetails.email}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">District:</span>
                          <p className="text-gray-900">{application.contactDetails.district}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">State:</span>
                          <p className="text-gray-900">{application.contactDetails.state}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Victim Compensation Application Details */
                  <>
                    {/* Personal Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <UserIcon className="w-5 h-5 text-orange-500 mr-2" />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium text-gray-700">Full Name:</span> {application.personalDetails.fullName}</div>
                        <div><span className="font-medium text-gray-700">Aadhaar:</span> {application.personalDetails.aadhaarNumber}</div>
                        <div><span className="font-medium text-gray-700">Mobile:</span> {application.personalDetails.mobileNumber}</div>
                        <div><span className="font-medium text-gray-700">Email:</span> {application.personalDetails.email || 'Not provided'}</div>
                        <div className="md:col-span-2"><span className="font-medium text-gray-700">Address:</span> {application.personalDetails.address}</div>
                      </div>
                    </div>

                    {/* Incident Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Incident Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium text-gray-700">Type:</span> {application.incidentDetails.type}</div>
                        <div><span className="font-medium text-gray-700">Date:</span> {application.incidentDetails.date}</div>
                        <div className="md:col-span-2"><span className="font-medium text-gray-700">Location:</span> {application.incidentDetails.location}</div>
                        <div className="md:col-span-2"><span className="font-medium text-gray-700">Description:</span> {application.incidentDetails.description}</div>
                        {application.incidentDetails.witnesses && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Witnesses:</span>
                            <p className="text-gray-900">{application.incidentDetails.witnesses}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Bank Details (Common for both types) */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Bank Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Account Holder:</span>
                      <p className="text-gray-900">{application.bankDetails.accountHolderName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Account Number:</span>
                      <p className="text-gray-900">{application.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">IFSC Code:</span>
                      <p className="text-gray-900">{application.bankDetails.ifscCode}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Bank Name:</span>
                      <p className="text-gray-900">{application.bankDetails.bankName}</p>
                    </div>
                    {application.bankDetails.branch && (
                      <div>
                        <span className="font-medium text-gray-700">Branch:</span>
                        <p className="text-gray-900">{application.bankDetails.branch}</p>
                      </div>
                    )}
                    {application.bankDetails.jointAccount && (
                      <div>
                        <span className="font-medium text-gray-700">Account Type:</span>
                        <p className="text-gray-900">Joint Account</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Status */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Application Status</h4>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      Amount: ₹{application.amount?.toLocaleString() || (isMarriageApplication ? '2,50,000' : '50,000')}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created: {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;