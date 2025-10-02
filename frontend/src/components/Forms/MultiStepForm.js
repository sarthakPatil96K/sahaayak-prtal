import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  UserCircleIcon, 
  DocumentTextIcon, 
  BanknotesIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Simple API service function - define it directly to avoid import issues
const submitApplication = async (applicationData) => {
  try {
    console.log('📤 Submitting application data to port 8080...', applicationData);

    const response = await fetch('http://localhost:8080/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw new Error('Unable to connect to server. Please check if the backend is running on port 8080.');
  }
};

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalDetails: {
      fullName: '',
      aadhaarNumber: '',
      mobileNumber: '',
      email: '',
      address: '',
      pincode: '',
      state: '',
      district: ''
    },
    incidentDetails: {
      type: '',
      date: '',
      location: '',
      description: '',
      witnesses: '',
      policeComplaint: false,
      complaintNumber: ''
    },
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: '',
      branch: ''
    }
  });

  const steps = [
    { id: 1, name: 'Personal Details', icon: UserCircleIcon, description: 'Basic information' },
    { id: 2, name: 'Incident Details', icon: DocumentTextIcon, description: 'Case information' },
    { id: 3, name: 'Bank Details', icon: BanknotesIcon, description: 'DBT information' },
    { id: 4, name: 'Review & Submit', icon: CheckCircleIcon, description: 'Final confirmation' }
  ];

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
// Add these mock functions to show integration capabilities
const mockAadhaarVerification = async (aadhaarNumber) => {
  // Simulate Aadhaar verification
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        name: 'Verified User',
        dob: '1990-01-01',
        gender: 'M'
      });
    }, 1000);
  });
};

const mockBankVerification = async (accountNumber, ifscCode) => {
  // Simulate bank account verification
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        bankName: 'State Bank of India',
        accountHolderName: formData.personalDetails.fullName,
        ifscValid: true
      });
    }, 1000);
  });
};
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.personalDetails.fullName || !formData.personalDetails.aadhaarNumber) {
          toast.error('Please fill all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.incidentDetails.type || !formData.incidentDetails.date) {
          toast.error('Please provide incident details');
          return false;
        }
        break;
      case 3:
        if (!formData.bankDetails.accountNumber || !formData.bankDetails.ifscCode) {
          toast.error('Please provide bank details');
          return false;
        }
        break;
    }
    return true;
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateStep(currentStep)) {
    return;
  }

  try {
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    console.log('📤 Submitting application data:', formData);

    // API call
    const response = await fetch('http://localhost:8080/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    console.log('📨 Response status:', response.status);
    
    const result = await response.json();
    console.log('📨 Full response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `Server error: ${response.status}`);
    }
    
    if (result.success) {
      // Handle different possible tracking ID locations
      let trackingId;
      if (result.data && result.data.applicationId) {
        trackingId = result.data.applicationId;
      } else if (result.data && result.data.id) {
        trackingId = result.data.id;
      } else if (result.trackingId) {
        trackingId = result.trackingId;
      } else if (result.data && result.data._id) {
        trackingId = result.data._id;
      } else {
        trackingId = 'Unknown ID - Please contact support';
      }
      
      console.log('🆔 Extracted Tracking ID:', trackingId);
      
      alert(`✅ Application submitted successfully!\n\nYour Tracking ID: ${trackingId}\n\nPlease save this ID for future reference.`);
      
      // Reset form
      setCurrentStep(1);
      setFormData({
        personalDetails: {
          fullName: '',
          aadhaarNumber: '',
          mobileNumber: '',
          email: '',
          address: '',
          pincode: '',
          state: '',
          district: ''
        },
        incidentDetails: {
          type: '',
          date: '',
          location: '',
          description: '',
          witnesses: '',
          policeComplaint: false,
          complaintNumber: ''
        },
        bankDetails: {
          accountNumber: '',
          ifscCode: '',
          bankName: '',
          accountHolderName: '',
          branch: ''
        }
      });
    } else {
      alert(`❌ Failed to submit application: ${result.message}`);
    }
  } catch (error) {
    console.error('❌ Submission error:', error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    // Reset button state
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = 'Submit Application';
      submitButton.disabled = false;
    }
  }
};

  const StepIcon = ({ step, currentStep }) => {
    const IconComponent = step.icon;
    return (
      <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 ${
        currentStep >= step.id
          ? 'border-india-saffron bg-india-saffron text-white'
          : 'border-gray-300 text-gray-300'
      } transition-all duration-300`}>
        <IconComponent className="w-6 h-6" />
        {currentStep > step.id && (
          <CheckCircleIcon className="absolute -top-1 -right-1 w-6 h-6 text-green-500 bg-white rounded-full" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <motion.div
                className="h-1 bg-india-saffron"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <StepIcon step={step} currentStep={currentStep} />
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-india-saffron' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.personalDetails.fullName}
                      onChange={(e) => handleInputChange('personalDetails', 'fullName', e.target.value)}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhaar Number *
                    </label>
                    <input
                      type="text"
                      value={formData.personalDetails.aadhaarNumber}
                      onChange={(e) => handleInputChange('personalDetails', 'aadhaarNumber', e.target.value)}
                      className="input-field"
                      placeholder="12-digit Aadhaar number"
                      maxLength="12"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.personalDetails.mobileNumber}
                      onChange={(e) => handleInputChange('personalDetails', 'mobileNumber', e.target.value)}
                      className="input-field"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.personalDetails.email}
                      onChange={(e) => handleInputChange('personalDetails', 'email', e.target.value)}
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complete Address *
                    </label>
                    <textarea
                      value={formData.personalDetails.address}
                      onChange={(e) => handleInputChange('personalDetails', 'address', e.target.value)}
                      className="input-field"
                      rows="3"
                      placeholder="Enter your complete residential address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={formData.personalDetails.pincode}
                      onChange={(e) => handleInputChange('personalDetails', 'pincode', e.target.value)}
                      className="input-field"
                      placeholder="6-digit pincode"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      value={formData.personalDetails.district}
                      onChange={(e) => handleInputChange('personalDetails', 'district', e.target.value)}
                      className="input-field"
                      placeholder="Your district"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Incident Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Incident Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type of Incident *
                    </label>
                    <select
                      value={formData.incidentDetails.type}
                      onChange={(e) => handleInputChange('incidentDetails', 'type', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select incident type</option>
                      <option value="discrimination">Discrimination</option>
                      <option value="atrocity">Atrocity</option>
                      <option value="land_rights">Land Rights Violation</option>
                      <option value="employment">Employment Discrimination</option>
                      <option value="education">Education Discrimination</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incident Date *
                    </label>
                    <input
                      type="date"
                      value={formData.incidentDetails.date}
                      onChange={(e) => handleInputChange('incidentDetails', 'date', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incident Location *
                    </label>
                    <input
                      type="text"
                      value={formData.incidentDetails.location}
                      onChange={(e) => handleInputChange('incidentDetails', 'location', e.target.value)}
                      className="input-field"
                      placeholder="Where did the incident occur?"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      value={formData.incidentDetails.description}
                      onChange={(e) => handleInputChange('incidentDetails', 'description', e.target.value)}
                      className="input-field"
                      rows="4"
                      placeholder="Please describe the incident in detail..."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Witnesses (if any)
                    </label>
                    <textarea
                      value={formData.incidentDetails.witnesses}
                      onChange={(e) => handleInputChange('incidentDetails', 'witnesses', e.target.value)}
                      className="input-field"
                      rows="2"
                      placeholder="Names and contact details of witnesses"
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="policeComplaint"
                      checked={formData.incidentDetails.policeComplaint}
                      onChange={(e) => handleInputChange('incidentDetails', 'policeComplaint', e.target.checked)}
                      className="w-4 h-4 text-india-saffron rounded focus:ring-india-saffron"
                    />
                    <label htmlFor="policeComplaint" className="text-sm font-medium text-gray-700">
                      Police complaint filed for this incident
                    </label>
                  </div>
                  
                  {formData.incidentDetails.policeComplaint && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Police Complaint Number
                      </label>
                      <input
                        type="text"
                        value={formData.incidentDetails.complaintNumber}
                        onChange={(e) => handleInputChange('incidentDetails', 'complaintNumber', e.target.value)}
                        className="input-field"
                        placeholder="FIR number or complaint reference"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Bank Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Bank Details for DBT</h3>
                <p className="text-gray-600 mb-6">
                  Provide your bank account details for Direct Benefit Transfer. Ensure details are accurate.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={formData.bankDetails.accountHolderName}
                      onChange={(e) => handleInputChange('bankDetails', 'accountHolderName', e.target.value)}
                      className="input-field"
                      placeholder="As per bank records"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={formData.bankDetails.accountNumber}
                      onChange={(e) => handleInputChange('bankDetails', 'accountNumber', e.target.value)}
                      className="input-field"
                      placeholder="Bank account number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      value={formData.bankDetails.ifscCode}
                      onChange={(e) => handleInputChange('bankDetails', 'ifscCode', e.target.value)}
                      className="input-field"
                      placeholder="11-character IFSC code"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={formData.bankDetails.bankName}
                      onChange={(e) => handleInputChange('bankDetails', 'bankName', e.target.value)}
                      className="input-field"
                      placeholder="Name of your bank"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankDetails.branch}
                      onChange={(e) => handleInputChange('bankDetails', 'branch', e.target.value)}
                      className="input-field"
                      placeholder="Bank branch name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Review Your Application</h3>
                
                <div className="space-y-6">
                  {/* Personal Details Review */}
                  <div className="border rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Full Name:</span> {formData.personalDetails.fullName}</div>
                      <div><span className="font-medium">Aadhaar:</span> {formData.personalDetails.aadhaarNumber}</div>
                      <div><span className="font-medium">Mobile:</span> {formData.personalDetails.mobileNumber}</div>
                      <div><span className="font-medium">Email:</span> {formData.personalDetails.email || 'Not provided'}</div>
                      <div className="md:col-span-2"><span className="font-medium">Address:</span> {formData.personalDetails.address}</div>
                    </div>
                  </div>

                  {/* Incident Details Review */}
                  <div className="border rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Incident Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Type:</span> {formData.incidentDetails.type}</div>
                      <div><span className="font-medium">Date:</span> {formData.incidentDetails.date}</div>
                      <div className="md:col-span-2"><span className="font-medium">Location:</span> {formData.incidentDetails.location}</div>
                      <div className="md:col-span-2"><span className="font-medium">Description:</span> {formData.incidentDetails.description}</div>
                    </div>
                  </div>

                  {/* Bank Details Review */}
                  <div className="border rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Account Holder:</span> {formData.bankDetails.accountHolderName}</div>
                      <div><span className="font-medium">Account Number:</span> {formData.bankDetails.accountNumber}</div>
                      <div><span className="font-medium">IFSC Code:</span> {formData.bankDetails.ifscCode}</div>
                      <div><span className="font-medium">Bank Name:</span> {formData.bankDetails.bankName}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">i</span>
                      </div>
                    </div>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Important Note:</p>
                      <p>Your application will be processed within 15 working days. You will receive SMS updates on your registered mobile number.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Continue to {steps[currentStep].name}
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-300"
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MultiStepForm;