import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  UserCircleIcon, 
  DocumentTextIcon, 
  BanknotesIcon,
  ShieldCheckIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// --- Reusable Helper Components ---

// 1. OTP Modal Component
const OtpModal = ({ isOpen, onClose, onVerify, field, value }) => {
  const [otp, setOtp] = useState('');
  if (!isOpen) return null;

  const handleVerify = () => {
    // Simulate OTP verification (correct OTP is always '123456' for this demo)
    if (otp === '123456') {
      onVerify(field);
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
        <h3 className="text-xl font-bold text-gray-900">Verify {field}</h3>
        <p className="text-sm text-gray-600 mt-2">An OTP has been sent to <span className="font-semibold">{value}</span>. For this demo, the OTP is <strong className="text-blue-600">123456</strong>.</p>
        <div className="mt-6">
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter 6-Digit OTP</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg text-center tracking-[0.5em] text-lg font-semibold"
            placeholder="______"
          />
        </div>
        <div className="flex items-center justify-between mt-6">
          <button onClick={onClose} className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
          <button onClick={handleVerify} className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700">Verify</button>
        </div>
      </div>
    </div>
  );
};

// 2. Submission Success and Print Component
const SubmissionSuccess = ({ data, onStartNew }) => {
  const printRef = useRef();

  // A more robust print handler using CSS classes.
  const handlePrint = () => {
    document.body.classList.add('printing-active');
    window.print();
    document.body.classList.remove('printing-active');
  };
  
  return (
    <div className="text-center p-8">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Application Submitted!</h2>
        <p className="text-gray-600 mt-2">Your application has been received. Please print this summary for your records.</p>
        
        {/* The content to be printed, wrapped for targeting */}
        <div ref={printRef} className="printable-area my-8 text-left border border-gray-300 rounded-lg p-6 bg-white">
            {/* THIS IS THE FIX: New CSS rules for reliable printing */}
            <style>{`
                /* This style block applies only when printing */
                @media print {
                  /* When the body has the 'printing-active' class... */
                  body.printing-active > * {
                    /* ...hide everything by default. */
                    visibility: hidden;
                  }
                  
                  body.printing-active .printable-area,
                  body.printing-active .printable-area * {
                    /* ...then make ONLY the printable area and its contents visible again. */
                    visibility: visible;
                  }
                  
                  /* Position the printable area to fill the page */
                  body.printing-active .printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 1rem;
                    border: none !important;
                    box-shadow: none !important;
                  }
                }
            `}</style>
            <h3 className="text-2xl font-bold text-center mb-4">SAHAAYAK - Application Summary</h3>
            <p className="text-center text-lg font-mono bg-gray-100 p-2 rounded-md mb-6">Application ID: <span className="font-bold text-purple-600">{data.applicationId}</span></p>
            <div className="space-y-4 text-sm">
                <div>
                    <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Personal Details</h4>
                    <p><strong>Name:</strong> {data.formData.personalDetails.fullName}</p>
                    <p><strong>Aadhaar:</strong> {data.formData.personalDetails.aadhaarNumber}</p>
                    <p><strong>Mobile:</strong> {data.formData.personalDetails.mobileNumber}</p>
                    <p><strong>Email:</strong> {data.formData.personalDetails.email}</p>
                    <p><strong>Address:</strong> {`${data.formData.personalDetails.address}, ${data.formData.personalDetails.district}, ${data.formData.personalDetails.state} - ${data.formData.personalDetails.pincode}`}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Incident Details</h4>
                    <p><strong>Type:</strong> {data.formData.incidentDetails.type}</p>
                    <p><strong>Date:</strong> {data.formData.incidentDetails.date}</p>
                    <p><strong>Location:</strong> {data.formData.incidentDetails.location}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Bank Details</h4>
                    <p><strong>Account Holder:</strong> {data.formData.bankDetails.accountHolderName}</p>
                    <p><strong>Bank Name:</strong> {data.formData.bankDetails.bankName}</p>
                    <p><strong>Account Number:</strong> {data.formData.bankDetails.accountNumber}</p>
                 </div>
            </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700">
                <PrinterIcon className="w-5 h-5" /> Print Application
            </button>
            <button onClick={onStartNew} className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300">Start New Application</button>
        </div>
    </div>
  );
};

// --- Main Form Component ---
const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalDetails: { fullName: '', aadhaarNumber: '', mobileNumber: '', email: '', address: '', pincode: '', state: '', district: '' },
    incidentDetails: { type: '', date: '', location: '', description: '', witnesses: '', policeComplaint: false, complaintNumber: '' },
    bankDetails: { accountNumber: '', ifscCode: '', bankName: '', accountHolderName: '', branch: '' }
  });
  
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [verificationField, setVerificationField] = useState(null);
  const [verifiedStatus, setVerifiedStatus] = useState({ aadhaar: false, mobile: false, email: false });
  const [submissionResult, setSubmissionResult] = useState(null);

  const steps = [
    { id: 1, name: 'Personal Details', icon: UserCircleIcon, description: 'Basic information' },
    { id: 2, name: 'Incident Details', icon: DocumentTextIcon, description: 'Case information' },
    { id: 3, name: 'Bank Details', icon: BanknotesIcon, description: 'DBT information' },
    { id: 4, name: 'Review & Submit', icon: CheckCircleIcon, description: 'Final confirmation' }
  ];

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    if (verifiedStatus[field]) {
        setVerifiedStatus(prev => ({...prev, [field]: false}));
    }
  };

  const handleSendOtp = (field) => {
    const { aadhaarNumber, mobileNumber, email } = formData.personalDetails;
    let value;
    if (field === 'aadhaar' && /^\d{12}$/.test(aadhaarNumber)) value = aadhaarNumber;
    else if (field === 'mobile' && /^\d{10}$/.test(mobileNumber)) value = mobileNumber;
    else if (field === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) value = email;
    else {
      toast.error(`Please enter a valid ${field}.`);
      return;
    }
    setVerificationField({ field, value });
    setIsOtpModalOpen(true);
    toast.success(`OTP sent to ${value}`);
  };

  const handleVerifyOtp = (field) => {
    setVerifiedStatus(prev => ({...prev, [field]: true}));
    setIsOtpModalOpen(false);
    toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} verified!`);
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
    if (step === 1) {
      if (!verifiedStatus.aadhaar || !verifiedStatus.mobile || !verifiedStatus.email) {
        toast.error('Please verify your Aadhaar, Mobile, and Email to continue.');
        return false;
      }
    }
    // Add other validations for other steps here if needed
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== steps.length) {
      nextStep();
      return;
    }
    if (!validateStep(currentStep)) return;

    // Flatten the nested objects into simple strings to match the backend schema
    const payload = {
      personalDetails: {
        ...formData.personalDetails,
        address: `${formData.personalDetails.address}, ${formData.personalDetails.district}, ${formData.personalDetails.state} - ${formData.personalDetails.pincode}`,
      },
      incidentDetails: {
        ...formData.incidentDetails,
        location: formData.incidentDetails.location,
      },
      bankDetails: formData.bankDetails,
    };

    const loadingToast = toast.loading('Submitting your application...');
    
    try {
      const response = await fetch('http://localhost:8080/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) throw new Error(result.message || `Server error: ${response.status}`);
      
      setSubmissionResult({ applicationId: result.data.applicationId, formData });
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Submission Failed: ${error.message}`);
    }
  };
  
  const handleKeyDown = (e) => {
      if (e.key === 'Enter' && currentStep < steps.length) {
          e.preventDefault();
          nextStep();
      }
  };

  const StepIcon = ({ step, currentStep }) => {
    const IconComponent = step.icon;
    return (
      <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 ${
        currentStep >= step.id
          ? 'border-orange-500 bg-orange-500 text-white'
          : 'border-gray-300 text-gray-300'
      } transition-all duration-300`}>
        <IconComponent className="w-6 h-6" />
        {currentStep > step.id && (
          <CheckCircleIcon className="absolute -top-1 -right-1 w-6 h-6 text-green-500 bg-white rounded-full" />
        )}
      </div>
    );
  };

  if (submissionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 flex items-center justify-center">
        <SubmissionSuccess data={submissionResult} onStartNew={() => { 
            setSubmissionResult(null); 
            setCurrentStep(1);
            // Reset all states for a fresh form
            setFormData({
                personalDetails: { fullName: '', aadhaarNumber: '', mobileNumber: '', email: '', address: '', pincode: '', state: '', district: '' },
                incidentDetails: { type: '', date: '', location: '', description: '', witnesses: '', policeComplaint: false, complaintNumber: '' },
                bankDetails: { accountNumber: '', ifscCode: '', bankName: '', accountHolderName: '', branch: '' }
            });
            setVerifiedStatus({ aadhaar: false, mobile: false, email: false });
        }} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <OtpModal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} onVerify={handleVerifyOtp} field={verificationField?.field} value={verificationField?.value} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
           <div className="flex items-center justify-between relative">
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <motion.div className="h-1 bg-orange-500" initial={{ width: '0%' }} animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <StepIcon step={step} currentStep={currentStep} />
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-orange-500' : 'text-gray-500'}`}>{step.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Personal Information & Verification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input type="text" value={formData.personalDetails.fullName} onChange={(e) => handleInputChange('personalDetails', 'fullName', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Aadhaar Number *</label>
                        <div className="flex items-center space-x-2">
                            <input type="text" value={formData.personalDetails.aadhaarNumber} onChange={(e) => handleInputChange('personalDetails', 'aadhaarNumber', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" maxLength="12" required disabled={verifiedStatus.aadhaar} />
                            {!verifiedStatus.aadhaar ? (
                                <button type="button" onClick={() => handleSendOtp('aadhaar')} className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg whitespace-nowrap hover:bg-blue-600 disabled:opacity-50" disabled={!/^\d{12}$/.test(formData.personalDetails.aadhaarNumber)}>Verify</button>
                            ) : (
                                <span className="flex items-center text-green-600 font-semibold text-sm whitespace-nowrap"><ShieldCheckIcon className="w-5 h-5 mr-1"/>Verified</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                        <div className="flex items-center space-x-2">
                            <input type="tel" value={formData.personalDetails.mobileNumber} onChange={(e) => handleInputChange('personalDetails', 'mobileNumber', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" maxLength="10" required disabled={verifiedStatus.mobile} />
                             {!verifiedStatus.mobile ? (
                                <button type="button" onClick={() => handleSendOtp('mobile')} className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg whitespace-nowrap hover:bg-blue-600 disabled:opacity-50" disabled={!/^\d{10}$/.test(formData.personalDetails.mobileNumber)}>Verify</button>
                            ) : (
                                <span className="flex items-center text-green-600 font-semibold text-sm whitespace-nowrap"><ShieldCheckIcon className="w-5 h-5 mr-1"/>Verified</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                        <div className="flex items-center space-x-2">
                            <input type="email" value={formData.personalDetails.email} onChange={(e) => handleInputChange('personalDetails', 'email', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required disabled={verifiedStatus.email} />
                             {!verifiedStatus.email ? (
                                <button type="button" onClick={() => handleSendOtp('email')} className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg whitespace-nowrap hover:bg-blue-600 disabled:opacity-50" disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalDetails.email)}>Verify</button>
                            ) : (
                                <span className="flex items-center text-green-600 font-semibold text-sm whitespace-nowrap"><ShieldCheckIcon className="w-5 h-5 mr-1"/>Verified</span>
                            )}
                        </div>
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address *</label>
                        <textarea value={formData.personalDetails.address} onChange={(e) => handleInputChange('personalDetails', 'address', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                        <input type="text" value={formData.personalDetails.pincode} onChange={(e) => handleInputChange('personalDetails', 'pincode', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" maxLength="6" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                        <input type="text" value={formData.personalDetails.district} onChange={(e) => handleInputChange('personalDetails', 'district', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input type="text" value={formData.personalDetails.state} onChange={(e) => handleInputChange('personalDetails', 'state', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Incident Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type of Incident *</label>
                    <select value={formData.incidentDetails.type} onChange={(e) => handleInputChange('incidentDetails', 'type', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                      <option value="">Select incident type</option>
                      <option value="discrimination">Discrimination</option>
                      <option value="atrocity">Atrocity</option>
                      <option value="land_rights">Land Rights Violation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Incident Date *</label>
                    <input type="date" value={formData.incidentDetails.date} onChange={(e) => handleInputChange('incidentDetails', 'date', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Incident Location *</label>
                    <input type="text" value={formData.incidentDetails.location} onChange={(e) => handleInputChange('incidentDetails', 'location', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description *</label>
                    <textarea value={formData.incidentDetails.description} onChange={(e) => handleInputChange('incidentDetails', 'description', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="4" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Witnesses (if any)</label>
                    <textarea value={formData.incidentDetails.witnesses} onChange={(e) => handleInputChange('incidentDetails', 'witnesses', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="2" />
                  </div>
                  <div className="md:col-span-2 flex items-center space-x-3">
                    <input type="checkbox" id="policeComplaint" checked={formData.incidentDetails.policeComplaint} onChange={(e) => handleInputChange('incidentDetails', 'policeComplaint', e.target.checked)} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" />
                    <label htmlFor="policeComplaint" className="text-sm font-medium text-gray-700">Police complaint filed for this incident</label>
                  </div>
                  {formData.incidentDetails.policeComplaint && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Police Complaint Number</label>
                      <input type="text" value={formData.incidentDetails.complaintNumber} onChange={(e) => handleInputChange('incidentDetails', 'complaintNumber', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Bank Details for DBT</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
                    <input type="text" value={formData.bankDetails.accountHolderName} onChange={(e) => handleInputChange('bankDetails', 'accountHolderName', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                    <input type="text" value={formData.bankDetails.accountNumber} onChange={(e) => handleInputChange('bankDetails', 'accountNumber', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
                    <input type="text" value={formData.bankDetails.ifscCode} onChange={(e) => handleInputChange('bankDetails', 'ifscCode', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                    <input type="text" value={formData.bankDetails.bankName} onChange={(e) => handleInputChange('bankDetails', 'bankName', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                    <input type="text" value={formData.bankDetails.branch} onChange={(e) => handleInputChange('bankDetails', 'branch', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 4: Review Your Application</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Personal Details</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p><strong>Name:</strong> {formData.personalDetails.fullName}</p>
                        <p><strong>Aadhaar:</strong> {formData.personalDetails.aadhaarNumber}</p>
                        <p><strong>Mobile:</strong> {formData.personalDetails.mobileNumber}</p>
                        <p><strong>Email:</strong> {formData.personalDetails.email}</p>
                        <p className="col-span-2"><strong>Address:</strong> {`${formData.personalDetails.address}, ${formData.personalDetails.district}, ${formData.personalDetails.state} - ${formData.personalDetails.pincode}`}</p>
                    </div>
                  </div>
                   <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Incident Details</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p><strong>Type:</strong> {formData.incidentDetails.type}</p>
                        <p><strong>Date:</strong> {formData.incidentDetails.date}</p>
                        <p className="col-span-2"><strong>Location:</strong> {formData.incidentDetails.location}</p>
                    </div>
                  </div>
                   <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p><strong>Account Holder:</strong> {formData.bankDetails.accountHolderName}</p>
                        <p><strong>Account No:</strong> {formData.bankDetails.accountNumber}</p>
                        <p><strong>IFSC:</strong> {formData.bankDetails.ifscCode}</p>
                        <p><strong>Bank:</strong> {formData.bankDetails.bankName}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-6 py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Previous</button>
              {currentStep < steps.length ? (
                <button type="button" onClick={nextStep} className="px-6 py-3 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600">Continue</button>
              ) : (
                <button type="submit" className="px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700">Submit Application</button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MultiStepForm;

