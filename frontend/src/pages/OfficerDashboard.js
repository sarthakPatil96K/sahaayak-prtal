import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowPathIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import ApplicationDetailsModal from '../components/ApplicationDetailsModal';

// Standardized API base URL
import { API_BASE_URL } from '../config';

const OfficerDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [applicationType, setApplicationType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [victimApplications, setVictimApplications] = useState([]);
  const [marriageApplications, setMarriageApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const [victimRes, marriageRes] = await Promise.all([
        fetch(`${API_BASE_URL}/applications`),
        fetch(`${API_BASE_URL}/intercaste-marriage`)
      ]);

      const victimResult = await victimRes.json();
      const marriageResult = await marriageRes.json();

      if (victimResult.success) {
        setVictimApplications(victimResult.data.map(app => ({ ...app, type: 'victim' })));
      } else {
        console.warn('Could not fetch victim applications:', victimResult.message);
        setVictimApplications([]);
      }

      if (marriageResult.success) {
        setMarriageApplications(marriageResult.data.map(app => ({ ...app, type: 'marriage' })));
      } else {
        console.warn('Could not fetch marriage applications:', marriageResult.message);
        setMarriageApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Failed to fetch applications. Please ensure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status, type) => {
    if (!applicationId) {
      console.error("handleStatusUpdate called with undefined applicationId");
      alert("Cannot update status: Application ID is missing.");
      return;
    }

    const endpoint = type === 'victim'
      ? `${API_BASE_URL}/applications/${applicationId}/status`
      : `${API_BASE_URL}/intercaste-marriage/${applicationId}/status`;

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.success) {
        alert(`Application status updated to ${status}!`);
        fetchApplications();
      } else {
        throw new Error(result.message || 'Unknown error from server.');
      }
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      alert(`Failed to update status. ${error.message}`);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  // --- UI & Data Helper Functions ---
  const allApplications = [...victimApplications, ...marriageApplications];
  
  const getFilteredApplications = () => {
    return allApplications.filter(app => {
        if (!app) return false;
        
        const searchLower = searchTerm.toLowerCase();
        const appName = (app.personalDetails?.fullName || `${app.couple?.husband?.name || ''} & ${app.couple?.wife?.name || ''}`).toLowerCase();
        const appId = app.applicationId || '';

        const matchesType = applicationType === 'all' || app.type === applicationType;
        const matchesTab = activeTab === 'all' || app.status === activeTab;
        const matchesSearch = appId.toLowerCase().includes(searchLower) || appName.includes(searchLower);

        return matchesType && matchesTab && matchesSearch;
    });
  };

  const filteredApplications = getFilteredApplications();

  const getApplicantName = (app) => {
    if (!app) return 'N/A';
    if (app.type === 'marriage') {
      return `${app.couple?.husband?.name || 'N/A'} & ${app.couple?.wife?.name || 'N/A'}`;
    }
    return app.personalDetails?.fullName || 'N/A';
  };

  const getApplicationDetails = (app) => {
    if (!app) return 'N/A';
    if (app.type === 'marriage') {
        return `Marriage: ${app.couple?.husband?.casteCategory || 'N/A'} + ${app.couple?.wife?.casteCategory || 'N/A'}`;
    }
    return `Incident: ${app.incidentDetails?.type || 'N/A'}`;
  };
  
  const getStatusBadge = (status) => {
    const config = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      disbursed: 'bg-purple-100 text-purple-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${config[status] || 'bg-gray-100'}`}>{status || 'unknown'}</span>;
  };

  const getPriorityBadge = (application) => {
    if (!application || !application.createdAt) {
      return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
    const daysAgo = Math.floor((new Date() - new Date(application.createdAt)) / (1000 * 60 * 60 * 24));
    if (daysAgo > 7) return { color: 'bg-red-100 text-red-800', label: 'High' };
    if (daysAgo > 3) return { color: 'bg-orange-100 text-orange-800', label: 'Medium' };
    return { color: 'bg-green-100 text-green-800', label: 'Low' };
  };

  const getDaysAgo = (application) => {
    if (!application || !application.createdAt) return 0;
    return Math.floor((new Date() - new Date(application.createdAt)) / (1000 * 60 * 60 * 24));
  };
  
  const statsCards = [
    { label: 'Total Applications', value: allApplications.length, icon: UserGroupIcon, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Pending Review', value: allApplications.filter(app => app.status === 'pending').length, icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { label: 'Approved', value: allApplications.filter(app => app.status === 'approved').length, icon: CheckCircleIcon, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Total Disbursed', value: `₹${(allApplications.filter(app => app.status === 'disbursed' || app.status === 'approved').reduce((sum, app) => sum + (app.amount || 0), 0) / 100000).toFixed(1)}L`, icon: ChartBarIcon, color: 'text-purple-600', bgColor: 'bg-purple-100' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Officer Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage both Victim Compensation and Inter-Caste Marriage applications.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map(stat => (
            <div key={stat.label} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input type="text" placeholder="Search by ID or Name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
              {[{ id: 'all', label: 'All Types' }, { id: 'victim', label: 'Victim' }, { id: 'marriage', label: 'Marriage' }].map(type => (
                <button key={type.id} onClick={() => setApplicationType(type.id)} className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${applicationType === type.id ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
                  {type.id === 'victim' ? <UserGroupIcon className="w-4 h-4" /> : type.id === 'marriage' ? <HeartIcon className="w-4 h-4" /> : null}
                  {type.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
              {['all', 'pending', 'verified', 'approved', 'rejected', 'disbursed'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-md capitalize ${activeTab === tab ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>{tab}</button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application & Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount & Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map(app => {
                  if (!app) return null;
                  const priority = getPriorityBadge(app);
                  const daysAgo = getDaysAgo(app);
                  const isMarriage = app.type === 'marriage';

                  return (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.applicationId}</div>
                      <div className={`text-xs font-semibold ${isMarriage ? 'text-pink-600' : 'text-orange-600'}`}>{isMarriage ? 'Inter-Caste Marriage' : 'Victim Compensation'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getApplicantName(app)}</div>
                      <div className="text-sm text-gray-500">{getApplicationDetails(app)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">₹{app.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                          {getStatusBadge(app.status)}
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
                            onClick={() => handleViewDetails(app)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <EyeIcon className="w-4 h-4" />
                            View Details
                          </button>
                          
                          {app.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleStatusUpdate(app.applicationId, 'verified', app.type)}
                                className="text-green-600 hover:text-green-800 font-medium flex-1 text-center border border-green-600 rounded px-2 py-1 text-xs"
                              >
                                Verify
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(app.applicationId, 'rejected', app.type)}
                                className="text-red-600 hover:text-red-800 font-medium flex-1 text-center border border-red-600 rounded px-2 py-1 text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          
                          {app.status === 'verified' && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleStatusUpdate(app.applicationId, 'approved', app.type)}
                                className="text-green-600 hover:text-green-800 font-medium flex-1 text-center border border-green-600 rounded px-2 py-1 text-xs"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(app.applicationId, 'rejected', app.type)}
                                className="text-red-600 hover:text-red-800 font-medium flex-1 text-center border border-red-600 rounded px-2 py-1 text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          
                          {(app.status === 'approved' || app.status === 'rejected' || app.status === 'disbursed') && (
                            <span className="text-gray-500 text-xs text-center">
                              No actions available
                            </span>
                          )}
                        </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
           {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
        
        <ApplicationDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} application={selectedApplication} />
      </div>
    </div>
  );
};

export default OfficerDashboard;