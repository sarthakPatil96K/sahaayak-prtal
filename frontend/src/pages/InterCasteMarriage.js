import React, { useState } from 'react';
import { HeartIcon, UserIcon, DocumentTextIcon, BanknotesIcon, CheckCircleIcon, ArrowUpTrayIcon, ShieldCheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

/**
 * InterCasteMarriage
 * - Added tracking ID to print output
 * - Added copy functionality for application ID
 */

const InterCasteMarriage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    coupleDetails: {
      husbandName: '',
      husbandAadhaar: '',
      husbandAadhaarVerified: false,
      husbandCaste: '',
      wifeName: '',
      wifeAadhaar: '',
      wifeAadhaarVerified: false,
      wifeCaste: '',
      marriageDate: '',
      marriageCertificateNumber: ''
    },
    addressDetails: {
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

  // State for instant validation errors
  const [formErrors, setFormErrors] = useState({});
  // State for file uploads
  const [uploadedFiles, setUploadedFiles] = useState({});
  // Loading flags for Aadhaar verify
  const [verifying, setVerifying] = useState({ husband: false, wife: false });
  // Submission loading state
  const [submitting, setSubmitting] = useState(false);
  // Track application ID after submission
  const [applicationId, setApplicationId] = useState(null);
  // Show success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const steps = [
    { id: 1, name: 'Couple Details', icon: UserIcon },
    { id: 2, name: 'Address Details', icon: DocumentTextIcon },
    { id: 3, name: 'Bank Details', icon: BanknotesIcon },
    { id: 4, name: 'Upload Documents', icon: ArrowUpTrayIcon },
    { id: 5, name: 'Review & Submit', icon: CheckCircleIcon }
  ];

  const casteCategories = ['Scheduled Caste (SC)', 'Scheduled Tribe (ST)', 'Other Backward Class (OBC)', 'General', 'Other'];

  // --- Instant Validation Logic ---
  const validateAadhaar = (aadhaar) => /^\d{12}$/.test(aadhaar);
  const validateMobile = (mobile) => /^\d{10}$/.test(mobile);

  const handleInputChange = (section, field, value) => {
    // Instant validation for specific fields
    if (field === 'husbandAadhaar' || field === 'wifeAadhaar') {
      // Reset verification flag if Aadhaar value changed
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
          // set corresponding verified flag to false when user edits Aadhaar
          ...(field === 'husbandAadhaar' ? { husbandAadhaarVerified: false } : {}),
          ...(field === 'wifeAadhaar' ? { wifeAadhaarVerified: false } : {})
        }
      }));

      if (!validateAadhaar(value) && value.length > 0) {
        setFormErrors(prev => ({ ...prev, [field]: 'Aadhaar must be 12 digits.' }));
      } else {
        setFormErrors(prev => ({ ...prev, [field]: null }));
      }
      return; // already updated state above
    }

    if (field === 'mobileNumber') {
      if (!validateMobile(value) && value.length > 0) {
        setFormErrors(prev => ({ ...prev, [field]: 'Mobile number must be 10 digits.' }));
      } else {
        setFormErrors(prev => ({ ...prev, [field]: null }));
      }
    }

    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleFileChange = (key, file) => {
    setUploadedFiles(prev => ({ ...prev, [key]: file }));
  };

  // --- Simulated Aadhaar API validation ---
  // type: 'husband' or 'wife'
  const simulateAadhaarApi = async (type) => {
    // pick proper field
    const aadhaarValue = type === 'husband' ? formData.coupleDetails.husbandAadhaar : formData.coupleDetails.wifeAadhaar;
    const fieldName = type === 'husband' ? 'husbandAadhaar' : 'wifeAadhaar';

    // Basic client-side validation first
    if (!validateAadhaar(aadhaarValue)) {
      setFormErrors(prev => ({ ...prev, [fieldName]: 'Aadhaar must be 12 digits.' }));
      return;
    }

    // Simulate network call
    setVerifying(prev => ({ ...prev, [type]: true }));
    setFormErrors(prev => ({ ...prev, [fieldName]: null }));

    try {
      await new Promise(res => setTimeout(res, 1400)); // simulate latency

      // Mock logic: treat Aadhaar as valid if it doesn't start with '000'
      if (aadhaarValue.startsWith('000')) {
        throw new Error('Aadhaar not found in database (simulated).');
      }

      // success: set verified flag
      setFormData(prev => ({
        ...prev,
        coupleDetails: {
          ...prev.coupleDetails,
          ...(type === 'husband' ? { husbandAadhaarVerified: true } : { wifeAadhaarVerified: true })
        }
      }));

      alert(`✅ ${type === 'husband' ? 'Husband' : 'Wife'} Aadhaar verified (simulated).`);
    } catch (err) {
      setFormErrors(prev => ({ ...prev, [fieldName]: err.message || 'Aadhaar verification failed.' }));
      setFormData(prev => ({
        ...prev,
        coupleDetails: {
          ...prev.coupleDetails,
          ...(type === 'husband' ? { husbandAadhaarVerified: false } : { wifeAadhaarVerified: false })
        }
      }));
    } finally {
      setVerifying(prev => ({ ...prev, [type]: false }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // --- Step Validation ---
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.coupleDetails.husbandName || !formData.coupleDetails.wifeName ||
            !validateAadhaar(formData.coupleDetails.husbandAadhaar) || !validateAadhaar(formData.coupleDetails.wifeAadhaar)) {
          alert('Please provide valid names and 12-digit Aadhaar numbers for both partners.');
          return false;
        }
        // require Aadhaar verification (simulated) before moving forward
        if (!formData.coupleDetails.husbandAadhaarVerified || !formData.coupleDetails.wifeAadhaarVerified) {
          alert('Please verify both Aadhaar numbers using the "Verify Aadhaar" buttons before continuing.');
          return false;
        }
        if (formData.coupleDetails.husbandCaste === formData.coupleDetails.wifeCaste) {
          alert('This scheme is for inter-caste marriages. The caste category for both partners cannot be the same.');
          return false;
        }
        break;
      case 2:
        if (!formData.addressDetails.address || !formData.addressDetails.state || !validateMobile(formData.addressDetails.mobileNumber)) {
          alert('Please provide a complete address, state, and a valid 10-digit mobile number.');
          return false;
        }
        break;
      case 3:
        // Add validation for bank details
        if (!formData.bankDetails.accountHolderName || !formData.bankDetails.accountNumber || !formData.bankDetails.ifscCode || !formData.bankDetails.bankName) {
          alert('Please provide all required bank details.');
          return false;
        }
        break;
      case 4:
        if (!uploadedFiles.marriageCertificate || !uploadedFiles.husbandCasteCertificate || !uploadedFiles.wifeCasteCertificate) {
          alert('Please upload all three required documents.');
          return false;
        }
        break;
      case 5:
        // No validation for review step - just display data
        return true;
      default:
        return true;
    }
    return true;
  };

  // --- Copy to Clipboard Function ---
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Tracking ID copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Tracking ID copied to clipboard!');
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Always prevent default first
    
    // Only process submission from final step
    if (currentStep !== 5) {
      return; // Exit if not on review step
    }

    // Final validation for submission
    if (!formData.coupleDetails.husbandName || !formData.coupleDetails.wifeName ||
      !formData.addressDetails.address || !formData.addressDetails.mobileNumber ||
      !formData.bankDetails.accountNumber || !formData.bankDetails.ifscCode ||
      !uploadedFiles.marriageCertificate || !uploadedFiles.husbandCasteCertificate || !uploadedFiles.wifeCasteCertificate) {
      alert('Please complete all required fields before submitting.');
      return;
    }

    setSubmitting(true);

    // Prepare payload
    const payload = {
      coupleDetails: formData.coupleDetails,
      addressDetails: formData.addressDetails,
      bankDetails: formData.bankDetails,
      uploadedFiles: Object.keys(uploadedFiles).reduce((acc, k) => ({ ...acc, [k]: uploadedFiles[k].name }), {})
    };

    try {
      const response = await fetch('http://localhost:8080/api/intercaste-marriage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Server responded with status: ${response.status}`);
      }

      // Store the application ID and show success modal
      const newApplicationId = result.data.applicationId;
      setApplicationId(newApplicationId);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Submission error:', error);
      alert(`❌ Submission Failed:\n\n${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Reset form after successful submission ---
  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      coupleDetails: { husbandName: '', husbandAadhaar: '', husbandAadhaarVerified: false, husbandCaste: '', wifeName: '', wifeAadhaar: '', wifeAadhaarVerified: false, wifeCaste: '', marriageDate: '', marriageCertificateNumber: '' },
      addressDetails: { address: '', mobileNumber: '', email: '', pincode: '', district: '', state: '' },
      bankDetails: { accountNumber: '', ifscCode: '', bankName: '', accountHolderName: '', jointAccount: false }
    });
    setUploadedFiles({});
    setFormErrors({});
    setShowSuccessModal(false);
  };

  // **Prevent autosubmit**: handle Enter key in form inputs
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Always prevent default form submission
      
      // Only allow moving to next step if we're not on the review page
      if (currentStep < steps.length - 1) {
        nextStep();
      }
      // If we're on review page (step 5), do nothing - stay on page
    }
  };

  // --- Download / Print helpers ---
  const downloadPDF = () => {
    const doc = new jsPDF({ unit: 'pt' });
    let y = 40;
    doc.setFontSize(18);
    doc.text('Inter-Caste Marriage Application', 40, y);
    y += 30;
    
    // Add Tracking ID if available
    if (applicationId) {
      doc.setFontSize(12);
      doc.setTextColor(0, 102, 0);
      doc.text(`Tracking ID: ${applicationId}`, 40, y);
      y += 20;
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(12);

    const addLine = (label, value = '') => {
      doc.text(`${label}: ${value}`, 40, y);
      y += 18;
      if (y > 750) { doc.addPage(); y = 40; }
    };

    // Couple details
    addLine('Husband Name', formData.coupleDetails.husbandName);
    addLine('Husband Aadhaar', formData.coupleDetails.husbandAadhaar);
    addLine('Husband Aadhaar Verified', formData.coupleDetails.husbandAadhaarVerified ? 'Yes' : 'No');
    addLine('Husband Caste', formData.coupleDetails.husbandCaste);
    y += 4;
    addLine('Wife Name', formData.coupleDetails.wifeName);
    addLine('Wife Aadhaar', formData.coupleDetails.wifeAadhaar);
    addLine('Wife Aadhaar Verified', formData.coupleDetails.wifeAadhaarVerified ? 'Yes' : 'No');
    addLine('Wife Caste', formData.coupleDetails.wifeCaste);
    addLine('Marriage Date', formData.coupleDetails.marriageDate);
    addLine('Marriage Cert No', formData.coupleDetails.marriageCertificateNumber);

    y += 8;
    addLine('--- Address & Contact ---');
    addLine('Address', formData.addressDetails.address);
    addLine('Mobile', formData.addressDetails.mobileNumber);
    addLine('Email', formData.addressDetails.email);
    addLine('Pincode', formData.addressDetails.pincode);
    addLine('District', formData.addressDetails.district);
    addLine('State', formData.addressDetails.state);

    y += 8;
    addLine('--- Bank Details ---');
    addLine('Account Holder', formData.bankDetails.accountHolderName);
    addLine('Account Number', formData.bankDetails.accountNumber);
    addLine('IFSC', formData.bankDetails.ifscCode);
    addLine('Bank Name', formData.bankDetails.bankName);
    addLine('Joint Account', formData.bankDetails.jointAccount ? 'Yes' : 'No');

    y += 8;
    addLine('--- Uploaded Files (names) ---');
    Object.keys(uploadedFiles).forEach(key => addLine(key, uploadedFiles[key]?.name || ''));
    doc.save('InterCasteApplication.pdf');
  };

  const printForm = () => {
    // Build a small HTML and open print dialog
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) {
      alert('Pop-up blocked. Please allow pop-ups for this site to use print.');
      return;
    }
    const html = `
      <html>
        <head>
          <title>Application Print</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111 }
            h2 { color: #4c1d95; }
            .section { margin-bottom: 16px; }
            .label { font-weight: 700; width: 220px; display:inline-block; }
            .tracking-id { background: #f0fff0; padding: 10px; border: 2px solid #00cc00; border-radius: 5px; margin-bottom: 20px; font-weight: bold; color: #006600; }
          </style>
        </head>
        <body>
          <h2>Inter-Caste Marriage Application</h2>
          ${applicationId ? `<div class="tracking-id">Tracking ID: ${escapeHtml(applicationId)}</div>` : ''}
          <div class="section">
            <div><span class="label">Husband Name:</span> ${escapeHtml(formData.coupleDetails.husbandName)}</div>
            <div><span class="label">Husband Aadhaar:</span> ${escapeHtml(formData.coupleDetails.husbandAadhaar)}</div>
            <div><span class="label">Wife Name:</span> ${escapeHtml(formData.coupleDetails.wifeName)}</div>
            <div><span class="label">Wife Aadhaar:</span> ${escapeHtml(formData.coupleDetails.wifeAadhaar)}</div>
            <div><span class="label">Marriage Date:</span> ${escapeHtml(formData.coupleDetails.marriageDate)}</div>
          </div>
          <div class="section">
            <div><span class="label">Address:</span> ${escapeHtml(formData.addressDetails.address)}</div>
            <div><span class="label">Mobile:</span> ${escapeHtml(formData.addressDetails.mobileNumber)}</div>
            <div><span class="label">State:</span> ${escapeHtml(formData.addressDetails.state)}</div>
          </div>
          <div class="section">
            <div><span class="label">Bank:</span> ${escapeHtml(formData.bankDetails.bankName)}</div>
            <div><span class="label">Account No:</span> ${escapeHtml(formData.bankDetails.accountNumber)}</div>
            <div><span class="label">IFSC:</span> ${escapeHtml(formData.bankDetails.ifscCode)}</div>
          </div>
          <div class="section">
            <strong>Uploaded Files:</strong>
            <ul>
              ${Object.keys(uploadedFiles).map(k => `<li>${escapeHtml(k)}: ${escapeHtml(uploadedFiles[k]?.name || '')}</li>`).join('')}
            </ul>
          </div>
          <script>
            setTimeout(() => { window.print(); }, 250);
          </script>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
  };

  // small helper to escape HTML in print window
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"'\/]/g, function (s) {
      return ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;'
      })[s];
    });
  };

  const StepIcon = ({ step, currentStep }) => {
    const IconComponent = step.icon;
    if (currentStep > step.id) {
      return <CheckCircleIcon className="w-6 h-6" />;
    }
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-4">Your application has been successfully submitted.</p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 font-semibold mb-2">Your Tracking ID:</p>
                <div className="flex items-center justify-between bg-white rounded border border-green-300 p-3">
                  <code className="text-lg font-mono text-green-700">{applicationId}</code>
                  <button
                    onClick={() => copyToClipboard(applicationId)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <p className="text-xs text-green-600 mt-2">Please save this ID for tracking your application status.</p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => printForm()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Print Application
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <HeartIcon className="mx-auto h-16 w-16 text-purple-500" />
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Inter-Caste Marriage Incentive</h1>
          <p className="text-xl text-gray-600 mt-2">Apply for financial incentive under the Centrally Sponsored Scheme.</p>
        </div>

        <div className="mb-12">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep > step.id ? 'bg-purple-600 border-purple-600 text-white' : currentStep === step.id ? 'bg-white border-purple-600 text-purple-600' : 'bg-white border-gray-300 text-gray-400'}`}>
                    <StepIcon step={step} currentStep={currentStep} />
                  </div>
                  <p className={`mt-2 text-xs text-center ${currentStep >= step.id ? 'text-purple-600 font-semibold' : 'text-gray-500'}`}>{step.name}</p>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 transition-colors duration-300 ${currentStep > index + 1 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div onKeyDown={handleKeyDown}>
            {/* Step 1: Couple Details with Validation + Aadhaar verify buttons */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Couple Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Husband Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Husband Details</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input type="text" value={formData.coupleDetails.husbandName} onChange={(e) => handleInputChange('coupleDetails', 'husbandName', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                      <div className="flex gap-2">
                        <input type="text" value={formData.coupleDetails.husbandAadhaar} onChange={(e) => handleInputChange('coupleDetails', 'husbandAadhaar', e.target.value)} className={`flex-1 px-4 py-2 border rounded-lg ${formErrors.husbandAadhaar ? 'border-red-500' : 'border-gray-300'}`} maxLength="12" required />
                        <button type="button" onClick={() => simulateAadhaarApi('husband')} disabled={verifying.husband} className="px-3 py-2 bg-indigo-600 text-white rounded-lg">
                          {verifying.husband ? 'Verifying...' : (formData.coupleDetails.husbandAadhaarVerified ? 'Verified' : 'Verify Aadhaar')}
                        </button>
                      </div>
                      {formErrors.husbandAadhaar && <p className="text-xs text-red-500 mt-1">{formErrors.husbandAadhaar}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Caste Category *</label>
                      <select value={formData.coupleDetails.husbandCaste} onChange={(e) => handleInputChange('coupleDetails', 'husbandCaste', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                        <option value="">Select caste</option>
                        {casteCategories.map(caste => <option key={`h-${caste}`} value={caste}>{caste}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Wife Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Wife Details</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input type="text" value={formData.coupleDetails.wifeName} onChange={(e) => handleInputChange('coupleDetails', 'wifeName', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                      <div className="flex gap-2">
                        <input type="text" value={formData.coupleDetails.wifeAadhaar} onChange={(e) => handleInputChange('coupleDetails', 'wifeAadhaar', e.target.value)} className={`flex-1 px-4 py-2 border rounded-lg ${formErrors.wifeAadhaar ? 'border-red-500' : 'border-gray-300'}`} maxLength="12" required />
                        <button type="button" onClick={() => simulateAadhaarApi('wife')} disabled={verifying.wife} className="px-3 py-2 bg-indigo-600 text-white rounded-lg">
                          {verifying.wife ? 'Verifying...' : (formData.coupleDetails.wifeAadhaarVerified ? 'Verified' : 'Verify Aadhaar')}
                        </button>
                      </div>
                      {formErrors.wifeAadhaar && <p className="text-xs text-red-500 mt-1">{formErrors.wifeAadhaar}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Caste Category *</label>
                      <select value={formData.coupleDetails.wifeCaste} onChange={(e) => handleInputChange('coupleDetails', 'wifeCaste', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                        <option value="">Select caste</option>
                        {casteCategories.map(caste => <option key={`w-${caste}`} value={caste}>{caste}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Marriage Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marriage Date *</label>
                    <input type="date" value={formData.coupleDetails.marriageDate} onChange={(e) => handleInputChange('coupleDetails', 'marriageDate', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marriage Certificate Number *</label>
                    <input type="text" value={formData.coupleDetails.marriageCertificateNumber} onChange={(e) => handleInputChange('coupleDetails', 'marriageCertificateNumber', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
            )}

            {/* Other steps remain the same... */}
            {/* Step 2: Address Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Address & Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address *</label>
                    <textarea value={formData.addressDetails.address} onChange={(e) => handleInputChange('addressDetails', 'address', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                    <input type="tel" value={formData.addressDetails.mobileNumber} onChange={(e) => handleInputChange('addressDetails', 'mobileNumber', e.target.value)} className={`w-full px-4 py-2 border rounded-lg ${formErrors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`} maxLength="10" required />
                    {formErrors.mobileNumber && <p className="text-xs text-red-500 mt-1">{formErrors.mobileNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={formData.addressDetails.email} onChange={(e) => handleInputChange('addressDetails', 'email', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input type="text" value={formData.addressDetails.pincode} onChange={(e) => handleInputChange('addressDetails', 'pincode', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" maxLength="6" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                    <input type="text" value={formData.addressDetails.district} onChange={(e) => handleInputChange('addressDetails', 'district', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input type="text" value={formData.addressDetails.state} onChange={(e) => handleInputChange('addressDetails', 'state', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Bank Details */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Bank Details for Incentive Transfer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
                    <input type="text" value={formData.bankDetails.accountHolderName} onChange={(e) => handleInputChange('bankDetails', 'accountHolderName', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                    <input type="text" value={formData.bankDetails.accountNumber} onChange={(e) => handleInputChange('bankDetails', 'accountNumber', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                    <input type="text" value={formData.bankDetails.ifscCode} onChange={(e) => handleInputChange('bankDetails', 'ifscCode', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                    <input type="text" value={formData.bankDetails.bankName} onChange={(e) => handleInputChange('bankDetails', 'bankName', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div className="md:col-span-2 flex items-center">
                    <input id="jointAccount" type="checkbox" checked={formData.bankDetails.jointAccount} onChange={(e) => handleInputChange('bankDetails', 'jointAccount', e.target.checked)} className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                    <label htmlFor="jointAccount" className="ml-2 block text-sm text-gray-900">This is a joint account</label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Document Upload */}
            {currentStep === 4 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 4: Upload Documents</h3>
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">Please upload clear copies of the following documents. (PDF, JPG, PNG accepted)</p>
                  <FileUploadInput label="Marriage Certificate *" fileKey="marriageCertificate" uploadedFile={uploadedFiles.marriageCertificate} onFileChange={handleFileChange} />
                  <FileUploadInput label="Husband's Caste Certificate *" fileKey="husbandCasteCertificate" uploadedFile={uploadedFiles.husbandCasteCertificate} onFileChange={handleFileChange} />
                  <FileUploadInput label="Wife's Caste Certificate *" fileKey="wifeCasteCertificate" uploadedFile={uploadedFiles.wifeCasteCertificate} onFileChange={handleFileChange} />
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 5: Review Your Application</h3>
                <div className="space-y-6">
                  {/* Couple Details Review */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Couple Information</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <p><span className="font-medium">Husband:</span> {formData.coupleDetails.husbandName}</p>
                      <p><span className="font-medium">Wife:</span> {formData.coupleDetails.wifeName}</p>
                      <p><span className="font-medium">Husband's Caste:</span> {formData.coupleDetails.husbandCaste}</p>
                      <p><span className="font-medium">Wife's Caste:</span> {formData.coupleDetails.wifeCaste}</p>
                      <p><span className="font-medium">Marriage Date:</span> {formData.coupleDetails.marriageDate}</p>
                    </div>
                  </div>

                  {/* Address Details Review */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Address & Contact</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <p className="col-span-2"><span className="font-medium">Address:</span> {formData.addressDetails.address}</p>
                      <p><span className="font-medium">Mobile:</span> {formData.addressDetails.mobileNumber}</p>
                      <p><span className="font-medium">State:</span> {formData.addressDetails.state}</p>
                    </div>
                  </div>

                  {/* Bank Details Review */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <p><span className="font-medium">Account Holder:</span> {formData.bankDetails.accountHolderName}</p>
                      <p><span className="font-medium">Account No:</span> {formData.bankDetails.accountNumber}</p>
                      <p><span className="font-medium">IFSC:</span> {formData.bankDetails.ifscCode}</p>
                      <p><span className="font-medium">Bank:</span> {formData.bankDetails.bankName}</p>
                    </div>
                  </div>

                  {/* Uploaded Files Review */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Uploaded Documents</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {Object.keys(uploadedFiles).length === 0 && <li className="text-gray-500">No files uploaded yet.</li>}
                      {Object.keys(uploadedFiles).map(key => (
                        <li key={key} className="text-green-600">{key}: {uploadedFiles[key]?.name}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={downloadPDF} className="px-4 py-2 bg-green-600 text-white rounded-lg">Download / Save PDF</button>
                    <button type="button" onClick={printForm} className="px-4 py-2 bg-gray-800 text-white rounded-lg">Print</button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              {currentStep < steps.length ? (
                <button type="button" onClick={nextStep} className="px-6 py-3 rounded-lg font-semibold bg-purple-500 text-white hover:bg-purple-600">Continue</button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={submitting} className="px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for file inputs - COMPLETELY FIXED to prevent form submission
const FileUploadInput = ({ label, fileKey, uploadedFile, onFileChange }) => {
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileChange(fileKey, file);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-4">
        <label htmlFor={fileKey} className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
          <span>{uploadedFile ? 'Change file' : 'Choose file'}</span>
          <input
            id={fileKey}
            name={fileKey}
            type="file"
            className="sr-only"
            onChange={handleFileSelect}
          />
        </label>
        {uploadedFile && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <ShieldCheckIcon className="w-5 h-5" />
            <span>{uploadedFile.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterCasteMarriage;