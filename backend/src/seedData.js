// Script to populate with demo data
const applications = [
  {
    id: 'APP2024001',
    personalDetails: {
      fullName: 'Ramesh Kumar',
      aadhaarNumber: '123456789012',
      mobileNumber: '9876543210',
      email: 'ramesh@example.com',
      address: '123 Main Street, Delhi, India',
      pincode: '110001',
      state: 'Delhi',
      district: 'Central Delhi'
    },
    incidentDetails: {
      type: 'Discrimination',
      date: '2024-01-15',
      location: 'Workplace, Connaught Place',
      description: 'Faced discrimination at workplace based on caste during promotion process',
      witnesses: '2 colleagues - Amit Sharma and Priya Singh',
      policeComplaint: true,
      complaintNumber: 'FIR/123/2024'
    },
    bankDetails: {
      accountNumber: '12345678901',
      ifscCode: 'SBIN0000123',
      bankName: 'State Bank of India',
      accountHolderName: 'Ramesh Kumar',
      branch: 'Connaught Place, Delhi'
    },
    status: 'pending',
    amount: 50000,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 'APP2024002',
    personalDetails: {
      fullName: 'Sita Devi',
      aadhaarNumber: '987654321098',
      mobileNumber: '9123456789',
      email: 'sita@example.com',
      address: '456 Gandhi Nagar, Lucknow, Uttar Pradesh',
      pincode: '226001',
      state: 'Uttar Pradesh',
      district: 'Lucknow'
    },
    incidentDetails: {
      type: 'Atrocity',
      date: '2024-01-10',
      location: 'Village community center',
      description: 'Prevented from entering community temple during festival',
      witnesses: 'Multiple villagers present',
      policeComplaint: false,
      complaintNumber: ''
    },
    bankDetails: {
      accountNumber: '98765432109',
      ifscCode: 'PNB0000456',
      bankName: 'Punjab National Bank',
      accountHolderName: 'Sita Devi',
      branch: 'Hazratganj, Lucknow'
    },
    status: 'verified',
    amount: 100000,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12'
  }
];

module.exports = applications;