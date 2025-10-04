import React from 'react';
import { XMarkIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, UserIcon, CalendarIcon, DocumentTextIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const ApplicationDetailsModal = ({ isOpen, onClose, application }) => {
  if (!isOpen || !application) return null;

  // Helper function to safely get nested properties
  const getNestedValue = (obj, path, defaultValue = 'N/A') => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
  };

  // Determine application type and get appropriate data
  const isMarriage = application.type === 'marriage';
  
  // Get contact details based on application type
  const getContactDetails = () => {
    if (isMarriage) {
      return {
        address: getNestedValue(application, 'addressDetails.address'),
        mobile: getNestedValue(application, 'addressDetails.mobileNumber'),
        email: getNestedValue(application, 'addressDetails.email'),
        pincode: getNestedValue(application, 'addressDetails.pincode'),
        district: getNestedValue(application, 'addressDetails.district'),
        state: getNestedValue(application, 'addressDetails.state')
      };
    } else {
      return {
        address: getNestedValue(application, 'contactDetails.address'),
        mobile: getNestedValue(application, 'contactDetails.mobile'),
        email: getNestedValue(application, 'contactDetails.email'),
        pincode: getNestedValue(application, 'contactDetails.pincode'),
        district: getNestedValue(application, 'contactDetails.district'),
        state: getNestedValue(application, 'contactDetails.state')
      };
    }
  };

  // Get personal details based on application type
  const getPersonalDetails = () => {
    if (isMarriage) {
      return {
        husbandName: getNestedValue(application, 'coupleDetails.husbandName'),
        wifeName: getNestedValue(application, 'coupleDetails.wifeName'),
        husbandAadhaar: getNestedValue(application, 'coupleDetails.husbandAadhaar'),
        wifeAadhaar: getNestedValue(application, 'coupleDetails.wifeAadhaar'),
        husbandCaste: getNestedValue(application, 'coupleDetails.husbandCaste'),
        wifeCaste: getNestedValue(application, 'coupleDetails.wifeCaste'),
        marriageDate: getNestedValue(application, 'coupleDetails.marriageDate'),
        marriageCertificateNumber: getNestedValue(application, 'coupleDetails.marriageCertificateNumber')
      };
    } else {
      return {
        fullName: getNestedValue(application, 'personalDetails.fullName'),
        aadhaarNumber: getNestedValue(application, 'personalDetails.aadhaarNumber'),
        casteCategory: getNestedValue(application, 'personalDetails.casteCategory'),
        dateOfBirth: getNestedValue(application, 'personalDetails.dateOfBirth'),
        gender: getNestedValue(application, 'personalDetails.gender')
      };
    }
  };

  // Get bank details based on application type
  const getBankDetails = () => {
    if (isMarriage) {
      return {
        accountHolderName: getNestedValue(application, 'bankDetails.accountHolderName'),
        accountNumber: getNestedValue(application, 'bankDetails.accountNumber'),
        ifscCode: getNestedValue(application, 'bankDetails.ifscCode'),
        bankName: getNestedValue(application, 'bankDetails.bankName'),
        jointAccount: getNestedValue(application, 'bankDetails.jointAccount') ? 'Yes' : 'No'
      };
    } else {
      return {
        accountHolderName: getNestedValue(application, 'bankDetails.accountHolderName'),
        accountNumber: getNestedValue(application, 'bankDetails.accountNumber'),
        ifscCode: getNestedValue(application, 'bankDetails.ifscCode'),
        bankName: getNestedValue(application, 'bankDetails.bankName')
      };
    }
  };

  // Get incident details for victim applications
  const getIncidentDetails = () => {
    if (isMarriage) return null;
    
    return {
      type: getNestedValue(application, 'incidentDetails.type'),
      date: getNestedValue(application, 'incidentDetails.date'),
      time: getNestedValue(application, 'incidentDetails.time'),
      location: getNestedValue(application, 'incidentDetails.location'),
      description: getNestedValue(application, 'incidentDetails.description'),
      policeStation: getNestedValue(application, 'incidentDetails.policeStation'),
      firNumber: getNestedValue(application, 'incidentDetails.firNumber')
    };
  };

  const contactDetails = getContactDetails();
  const personalDetails = getPersonalDetails();
  const bankDetails = getBankDetails();
  const incidentDetails = getIncidentDetails();

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      disbursed: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Application Details
            </h2>
            <p className="text-gray-600 mt-1">
              {application.applicationId} • 
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                {application.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Application Type */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-lg font-semibold text-blue-800">
                {isMarriage ? 'Inter-Caste Marriage Application' : 'Victim Compensation Application'}
              </span>
            </div>
          </div>

          {/* Personal Details */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 text-gray-600 mr-2" />
              {isMarriage ? 'Couple Details' : 'Personal Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isMarriage ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Husband Name</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.husbandName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Wife Name</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.wifeName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Husband Aadhaar</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.husbandAadhaar}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Wife Aadhaar</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.wifeAadhaar}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Husband Caste</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.husbandCaste}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Wife Caste</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.wifeCaste}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marriage Date</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.marriageDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marriage Certificate No.</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.marriageCertificateNumber}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.aadhaarNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Caste Category</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.casteCategory}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.dateOfBirth}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="mt-1 text-sm text-gray-900">{personalDetails.gender}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 text-gray-600 mr-2" />
              Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">{contactDetails.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <PhoneIcon className="w-4 h-4 text-gray-500 mr-2" />
                  {contactDetails.mobile}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <EnvelopeIcon className="w-4 h-4 text-gray-500 mr-2" />
                  {contactDetails.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <p className="mt-1 text-sm text-gray-900">{contactDetails.pincode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">District</label>
                <p className="mt-1 text-sm text-gray-900">{contactDetails.district}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <p className="mt-1 text-sm text-gray-900">{contactDetails.state}</p>
              </div>
            </div>
          </div>

          {/* Incident Details (Only for Victim Applications) */}
          {!isMarriage && incidentDetails && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-600 mr-2" />
                Incident Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Incident Type</label>
                  <p className="mt-1 text-sm text-gray-900">{incidentDetails.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Incident Date</label>
                  <p className="mt-1 text-sm text-gray-900">{incidentDetails.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Incident Time</label>
                  <p className="mt-1 text-sm text-gray-900">{incidentDetails.time}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{incidentDetails.location}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{incidentDetails.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Police Station</label>
                  <p className="mt-1 text-sm text-gray-900">{incidentDetails.policeStation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">FIR Number</label>
                  <p className="mt-1 text-sm text-gray-900">{incidentDetails.firNumber}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Details */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BanknotesIcon className="w-5 h-5 text-gray-600 mr-2" />
              Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                <p className="mt-1 text-sm text-gray-900">{bankDetails.accountHolderName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <p className="mt-1 text-sm text-gray-900">{bankDetails.accountNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                <p className="mt-1 text-sm text-gray-900">{bankDetails.ifscCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <p className="mt-1 text-sm text-gray-900">{bankDetails.bankName}</p>
              </div>
              {isMarriage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Joint Account</label>
                  <p className="mt-1 text-sm text-gray-900">{bankDetails.jointAccount}</p>
                </div>
              )}
            </div>
          </div>

          {/* Amount and Dates */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-lg font-semibold text-green-600">₹{application.amount?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Applied On</label>
                <p className="mt-1 text-sm text-gray-900">
                  {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
                  {application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;