import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckBadgeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import ApplicationDetailsModal from '../components/ApplicationDetailsModal';
import { apiService } from '../services/api';

const OfficerDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [applicationType, setApplicationType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [victimApplications, setVictimApplications] = useState([]);
  const [marriageApplications, setMarriageApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Combined stats calculation
  const allApplications = [...victimApplications, ...marriageApplications];
  
  const stats = [
    { 
      label: 'Total Applications', 
      value: allApplications.length.toString(), 
      icon: UserGroupIcon, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100' 
    },
    { 
      label: 'Pending Review', 
      value: allApplications.filter(app => app.status === 'pending').length.toString(), 
      icon: ClockIcon, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100' 
    },
    { 
      label: 'Approved This Month', 
      value: allApplications.filter(app => app.status === 'approved').length.toString(), 
      icon: CheckCircleIcon, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100' 
    },
    { 
      label: 'Total Disbursed', 
      value: `₹${(allApplications
        .filter(app => app.status === 'approved')
        .reduce((sum, app) => sum + (app.amount || 0), 0) / 100000).toFixed(1)}L`, 
      icon: ChartBarIcon, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100' 
    }
  ];

  // Fetch both types of applications
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
  try {
    setLoading(true);
    
    // Fetch victim applications using API service
    const victimResult = await apiService.getApplications();
    
    // Fetch marriage applications
    let marriageResult = { success: false, data: [] };
    try {
      const marriageResponse = await fetch('http://localhost:8080/api/intercaste-marriage');
      if (marriageResponse.ok) {
        marriageResult = await marriageResponse.json();
      }
    } catch (error) {
      console.warn('Marriage applications endpoint not available:', error);
    }
    
    if (victimResult.success) {
      setVictimApplications(victimResult.data || []);
    } else {
      setVictimApplications([]);
    }
    
    if (marriageResult.success) {
      setMarriageApplications(marriageResult.data || []);
    } else {
      setMarriageApplications([]);
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
    alert('Failed to fetch applications. Please check if backend is running on port 8080.');
    setVictimApplications([]);
    setMarriageApplications([]);
  } finally {
    setLoading(false);
  }
};

  // Filter applications based on search, type, and status
  const getFilteredApplications = () => {
    let applications = [];

    // Filter by application type
    if (applicationType === 'victim') {
      applications = victimApplications;
    } else if (applicationType === 'marriage') {
      applications = marriageApplications;
    } else {
      applications = allApplications;
    }

    // Filter by search term
    const searchFiltered = applications.filter(app => {
      if (!app) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (app.id && app.id.toLowerCase().includes(searchLower)) ||
        (app.personalDetails?.fullName?.toLowerCase().includes(searchLower)) || 
        (app.coupleDetails?.husbandName?.toLowerCase().includes(searchLower)) ||
        (app.coupleDetails?.wifeName?.toLowerCase().includes(searchLower)) ||
        (app.personalDetails?.aadhaarNumber?.includes(searchTerm)) || 
        (app.coupleDetails?.husbandAadhaar?.includes(searchTerm)) ||
        (app.coupleDetails?.wifeAadhaar?.includes(searchTerm));
      
      const matchesTab = activeTab === 'all' ? true :
                        activeTab === 'pending' ? app.status === 'pending' :
                        activeTab === 'verified' ? app.status === 'verified' :
                        activeTab === 'approved' ? app.status === 'approved' :
                        activeTab === 'rejected' ? app.status === 'rejected' : true;
      
      return matchesSearch && matchesTab;
    });

    return searchFiltered;
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleVerify = async (applicationId, isMarriage = false) => {
  try {
    let result;
    
    if (isMarriage) {
      const response = await fetch(`http://localhost:8080/api/intercaste-marriage/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'verified' }),
      });
      result = await response.json();
    } else {
      result = await apiService.updateApplicationStatus(applicationId, 'verified');
    }
    
    if (result.success) {
      alert('Application verified successfully!');
      fetchApplications();
    } else {
      alert('Failed to verify application: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error verifying application:', error);
    alert('Error verifying application: ' + error.message);
  }
};

const handleApprove = async (applicationId, isMarriage = false) => {
  try {
    let result;
    
    if (isMarriage) {
      const response = await fetch(`http://localhost:8080/api/intercaste-marriage/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      result = await response.json();
    } else {
      result = await apiService.updateApplicationStatus(applicationId, 'approved');
    }
    
    if (result.success) {
      alert('Application approved successfully! DBT will be processed.');
      fetchApplications();
    } else {
      alert('Failed to approve application: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error approving application:', error);
    alert('Error approving application: ' + error.message);
  }
};

const handleReject = async (applicationId, isMarriage = false) => {
  if (window.confirm('Are you sure you want to reject this application?')) {
    try {
      let result;
      
      if (isMarriage) {
        const response = await fetch(`http://localhost:8080/api/intercaste-marriage/${applicationId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' }),
        });
        result = await response.json();
      } else {
        result = await apiService.updateApplicationStatus(applicationId, 'rejected');
      }
      
      if (result.success) {
        alert('Application rejected successfully!');
        fetchApplications();
      } else {
        alert('Failed to reject application: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application: ' + error.message);
    }
  }
};

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      verified: { color: 'bg-blue-100 text-blue-800', label: 'Verified' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getApplicationTypeBadge = (application) => {
    if (!application) return null;
    
    const isMarriage = application.coupleDetails !== undefined;
    const config = isMarriage ? 
      { color: 'bg-pink-100 text-pink-800', label: 'Marriage', icon: HeartIcon } :
      { color: 'bg-orange-100 text-orange-800', label: 'Victim', icon: UserGroupIcon };
    
    const IconComponent = config.icon;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (application) => {
    if (!application || !application.createdAt) {
      return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
    
    const createdDate = new Date(application.createdAt);
    if (isNaN(createdDate.getTime())) {
      return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
    
    const daysAgo = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
    
    if (daysAgo > 7) return { color: 'bg-red-100 text-red-800', label: 'High' };
    if (daysAgo > 3) return { color: 'bg-orange-100 text-orange-800', label: 'Medium' };
    return { color: 'bg-green-100 text-green-800', label: 'Low' };
  };

  const getApplicantName = (application) => {
    if (!application) return 'N/A';
    
    if (application.coupleDetails) {
      return `${application.coupleDetails.husbandName || 'N/A'} & ${application.coupleDetails.wifeName || 'N/A'}`;
    }
    return application.personalDetails?.fullName || 'N/A';
  };

  const getApplicationDetails = (application) => {
    if (!application) return 'N/A';
    
    if (application.coupleDetails) {
      return `Marriage: ${application.coupleDetails.husbandCaste || 'N/A'} + ${application.coupleDetails.wifeCaste || 'N/A'}`;
    }
    return `Incident: ${application.incidentDetails?.type || 'N/A'}`;
  };

  const getCreatedDate = (application) => {
    if (!application || !application.createdAt) return 'N/A';
    
    try {
      const date = new Date(application.createdAt);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getDaysAgo = (application) => {
    if (!application || !application.createdAt) return 0;
    
    try {
      const createdDate = new Date(application.createdAt);
      if (isNaN(createdDate.getTime())) return 0;
      
      return Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  const filteredApplications = getFilteredApplications();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Officer Dashboard</h1>
          <p className="text-gray-600">Manage both Victim Compensation and Inter-Caste Marriage applications</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Application ID, Name, or Aadhaar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Application Type Filter */}
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'all', label: 'All Applications', icon: UserGroupIcon },
                { id: 'victim', label: 'Victim Only', icon: UserGroupIcon },
                { id: 'marriage', label: 'Marriage Only', icon: HeartIcon }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setApplicationType(type.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                    applicationType === type.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </button>
              ))}
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'all', label: 'All Status' },
                { id: 'pending', label: 'Pending' },
                { id: 'verified', label: 'Verified' },
                { id: 'approved', label: 'Approved' },
                { id: 'rejected', label: 'Rejected' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchApplications}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <CheckBadgeIcon className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application & Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount & Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => {
                  if (!application) return null;
                  
                  const priority = getPriorityBadge(application);
                  const daysAgo = getDaysAgo(application);
                  const isMarriage = application.coupleDetails !== undefined;
                  
                  return (
                    <tr
                      key={application.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{application.id || 'N/A'}</div>
                          <div className="mt-1">
                            {getApplicationTypeBadge(application)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getApplicantName(application)}</div>
                        <div className="text-sm text-gray-500">{getApplicationDetails(application)}</div>
                        {!isMarriage && application.incidentDetails?.location && (
                          <div className="text-xs text-gray-400">{application.incidentDetails.location}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{(application.amount || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCreatedDate(application)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          {getStatusBadge(application.status || 'pending')}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                            {priority.label} Priority
                          </span>
                          <div className="text-xs text-gray-500">
                            {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <button 
                            onClick={() => handleViewDetails(application)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <EyeIcon className="w-4 h-4" />
                            View Details
                          </button>
                          
                          {(application.status === 'pending' || !application.status) && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleVerify(application.id, isMarriage)}
                                className="text-green-600 hover:text-green-800 font-medium flex-1 text-center border border-green-600 rounded px-2 py-1 text-xs"
                              >
                                Verify
                              </button>
                              <button 
                                onClick={() => handleReject(application.id, isMarriage)}
                                className="text-red-600 hover:text-red-800 font-medium flex-1 text-center border border-red-600 rounded px-2 py-1 text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          
                          {application.status === 'verified' && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleApprove(application.id, isMarriage)}
                                className="text-green-600 hover:text-green-800 font-medium flex-1 text-center border border-green-600 rounded px-2 py-1 text-xs"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(application.id, isMarriage)}
                                className="text-red-600 hover:text-red-800 font-medium flex-1 text-center border border-red-600 rounded px-2 py-1 text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          
                          {(application.status === 'approved' || application.status === 'rejected') && (
                            <span className="text-gray-500 text-xs text-center">
                              No actions available
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'No applications match your current filters'}
              </p>
              {allApplications.length === 0 && (
                <button
                  onClick={() => window.location.href = '/'}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Go to Homepage
                </button>
              )}
            </div>
          )}
        </div>

        {/* Application Details Modal */}
        {selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;