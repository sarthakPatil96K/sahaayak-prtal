import React, { useState } from 'react';
import { HeartIcon, UserIcon, DocumentTextIcon, BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const InterCasteMarriage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    coupleDetails: {
      husbandName: '',
      husbandAadhaar: '',
      husbandCaste: '',
      wifeName: '',
      wifeAadhaar: '',
      wifeCaste: '',
      marriageDate: '',
      marriageCertificateNumber: ''
    },
    contactDetails: {
      address: '',
      mobileNumber: '',
      email: '',
      pincode: '',
      district: '',
      state: ''
    },
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: '',
      jointAccount: false
    }
  });

  const steps = [
    { id: 1, name: 'Couple Details', icon: UserIcon, description: 'Spouse information' },
    { id: 2, name: 'Contact Details', icon: DocumentTextIcon, description: 'Address & contact' },
    { id: 3, name: 'Bank Details', icon: BanknotesIcon, description: 'Incentive transfer' },
    { id: 4, name: 'Review & Submit', icon: CheckCircleIcon, description: 'Final confirmation' }
  ];

  const casteCategories = [
    'Scheduled Caste (SC)',
    'Scheduled Tribe (ST)',
    'Other Backward Class (OBC)',
    'General',
    'Other'
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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.coupleDetails.husbandName || !formData.coupleDetails.wifeName || 
            !formData.coupleDetails.marriageDate) {
          alert('Please fill all required fields in couple details');
          return false;
        }
        break;
      case 2:
        if (!formData.contactDetails.address || !formData.contactDetails.mobileNumber) {
          alert('Please fill all required contact details');
          return false;
        }
        break;
      case 3:
        if (!formData.bankDetails.accountNumber || !formData.bankDetails.ifscCode) {
          alert('Please provide bank details for incentive transfer');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/intercaste-marriage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Inter-Caste Marriage Incentive application submitted successfully!\n\nApplication ID: ${result.data.id}\nIncentive Amount: ₹${result.data.amount}\n\nPlease save your Application ID for tracking.`);
        
        // Reset form
        setCurrentStep(1);
        setFormData({
          coupleDetails: {
            husbandName: '',
            husbandAadhaar: '',
            husbandCaste: '',
            wifeName: '',
            wifeAadhaar: '',
            wifeCaste: '',
            marriageDate: '',
            marriageCertificateNumber: ''
          },
          contactDetails: {
            address: '',
            mobileNumber: '',
            email: '',
            pincode: '',
            district: '',
            state: ''
          },
          bankDetails: {
            accountNumber: '',
            ifscCode: '',
            bankName: '',
            accountHolderName: '',
            jointAccount: false
          }
        });
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting application. Please check your connection.');
    }
  };

  const StepIcon = ({ step, currentStep }) => {
    const IconComponent = step.icon;
    return (
      <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 ${
        currentStep >= step.id
          ? 'border-purple-500 bg-purple-500 text-white'
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <HeartIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Inter-Caste Marriage Incentive</h1>
          <p className="text-xl text-gray-600">Apply for financial incentive under the Centrally Sponsored Scheme</p>
          <p className="text-lg text-purple-600 font-semibold mt-2">Incentive Amount: ₹2,50,000</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-1 bg-purple-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <StepIcon step={step} currentStep={currentStep} />
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-purple-500' : 'text-gray-500'
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
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Couple Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Couple Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Husband Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Husband Details</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.coupleDetails.husbandName}
                        onChange={(e) => handleInputChange('coupleDetails', 'husbandName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Husband's full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        value={formData.coupleDetails.husbandAadhaar}
                        onChange={(e) => handleInputChange('coupleDetails', 'husbandAadhaar', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="12-digit Aadhaar"
                        maxLength="12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caste Category *
                      </label>
                      <select
                        value={formData.coupleDetails.husbandCaste}
                        onChange={(e) => handleInputChange('coupleDetails', 'husbandCaste', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select caste</option>
                        {casteCategories.map(caste => (
                          <option key={caste} value={caste}>{caste}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Wife Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Wife Details</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.coupleDetails.wifeName}
                        onChange={(e) => handleInputChange('coupleDetails', 'wifeName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Wife's full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        value={formData.coupleDetails.wifeAadhaar}
                        onChange={(e) => handleInputChange('coupleDetails', 'wifeAadhaar', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="12-digit Aadhaar"
                        maxLength="12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caste Category *
                      </label>
                      <select
                        value={formData.coupleDetails.wifeCaste}
                        onChange={(e) => handleInputChange('coupleDetails', 'wifeCaste', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select caste</option>
                        {casteCategories.map(caste => (
                          <option key={caste} value={caste}>{caste}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Marriage Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marriage Date *
                    </label>
                    <input
                      type="date"
                      value={formData.coupleDetails.marriageDate}
                      onChange={(e) => handleInputChange('coupleDetails', 'marriageDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marriage Certificate Number
                    </label>
                    <input
                      type="text"
                      value={formData.coupleDetails.marriageCertificateNumber}
                      onChange={(e) => handleInputChange('coupleDetails', 'marriageCertificateNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Certificate number"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Residential Address *
                    </label>
                    <textarea
                      value={formData.contactDetails.address}
                      onChange={(e) => handleInputChange('contactDetails', 'address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                      placeholder="Complete residential address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.contactDetails.mobileNumber}
                      onChange={(e) => handleInputChange('contactDetails', 'mobileNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.contactDetails.email}
                      onChange={(e) => handleInputChange('contactDetails', 'email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={formData.contactDetails.pincode}
                      onChange={(e) => handleInputChange('contactDetails', 'pincode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="6-digit pincode"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      value={formData.contactDetails.district}
                      onChange={(e) => handleInputChange('contactDetails', 'district', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="District name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Bank Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Bank Details for Incentive Transfer</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={formData.bankDetails.accountHolderName}
                      onChange={(e) => handleInputChange('bankDetails', 'accountHolderName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="11-character IFSC"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Name of your bank"
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      id="jointAccount"
                      checked={formData.bankDetails.jointAccount}
                      onChange={(e) => handleInputChange('bankDetails', 'jointAccount', e.target.checked)}
                      className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="jointAccount" className="ml-2 text-sm text-gray-700">
                      This is a joint account
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Review Your Application</h3>
                
                <div className="space-y-6">
                  {/* Couple Details Review */}
                  <div className="border rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Couple Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Husband:</span> {formData.coupleDetails.husbandName}</div>
                      <div><span className="font-medium">Wife:</span> {formData.coupleDetails.wifeName}</div>
                      <div><span className="font-medium">Husband Caste:</span> {formData.coupleDetails.husbandCaste}</div>
                      <div><span className="font-medium">Wife Caste:</span> {formData.coupleDetails.wifeCaste}</div>
                      <div><span className="font-medium">Marriage Date:</span> {formData.coupleDetails.marriageDate}</div>
                    </div>
                  </div>

                  {/* Contact Details Review */}
                  <div className="border rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="md:col-span-2"><span className="font-medium">Address:</span> {formData.contactDetails.address}</div>
                      <div><span className="font-medium">Mobile:</span> {formData.contactDetails.mobileNumber}</div>
                      <div><span className="font-medium">District:</span> {formData.contactDetails.district}</div>
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

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">i</span>
                      </div>
                    </div>
                    <div className="text-sm text-purple-700">
                      <p className="font-medium">Important Information:</p>
                      <p>• Incentive amount: ₹2,50,000</p>
                      <p>• Processing time: 30-45 days</p>
                      <p>• Required documents: Marriage certificate, caste certificates, address proof</p>
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
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Continue to {steps[currentStep].name}
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterCasteMarriage;