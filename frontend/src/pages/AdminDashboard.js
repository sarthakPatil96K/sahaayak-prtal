import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    totalDisbursed: 0,
    avgProcessingTime: 0
  });

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setStats({
      totalApplications: 156,
      pendingApplications: 23,
      totalDisbursed: 2450000,
      avgProcessingTime: 12
    });
  }, []);

  const statCards = [
    {
      label: 'Total Applications',
      value: stats.totalApplications,
      icon: UsersIcon,
      color: 'blue'
    },
    {
      label: 'Pending Review',
      value: stats.pendingApplications,
      icon: ClockIcon,
      color: 'orange'
    },
    {
      label: 'Total Disbursed',
      value: `₹${(stats.totalDisbursed / 100000).toFixed(1)}L`,
      icon: CurrencyRupeeIcon,
      color: 'green'
    },
    {
      label: 'Avg Processing Time',
      value: `${stats.avgProcessingTime} days`,
      icon: ChartBarIcon,
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of SAHAAYAK portal performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Admin Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                'Generate Monthly Report',
                'View All Officers',
                'System Configuration',
                'Backup Database'
              ].map((action) => (
                <button
                  key={action}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                'New application APP2024015 submitted',
                'Officer verified APP2024012',
                'DBT processed for APP2024008',
                'System maintenance completed'
              ].map((activity, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  {activity}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;