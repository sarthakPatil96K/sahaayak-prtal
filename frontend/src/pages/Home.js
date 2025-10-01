import React from 'react';
// Import at top
import SuccessStories from '../components/SuccessStories';

// Add before the CTA section in Home.js

import { 
  BoltIcon, 
  ShieldCheckIcon, 
  DevicePhoneMobileIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      name: 'Fast DBT Processing',
      description: 'Automated approval system reducing processing time from 90+ days to under 15 days',
      icon: BoltIcon,
    },
    {
      name: 'Secure Verification',
      description: 'Aadhaar-based e-KYC and CCTNS integration for fraud prevention',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Mobile Access',
      description: 'Victim-friendly mobile app with voice assistance in regional languages',
      icon: DevicePhoneMobileIcon,
    },
    {
      name: 'Real-time Tracking',
      description: 'Transparent application tracking for victims and officers',
      icon: ChartBarIcon,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
              SAHAAYAK
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Integrated DBT & Grievance Redressal Portal for PCR & PoA Acts
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            A unified platform ensuring timely relief and transparent governance for victims under the Protection of Civil Rights Act and Prevention of Atrocities Act
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/register" 
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Register Complaint
            </a>
            <a 
              href="/track" 
              className="bg-white hover:bg-gray-50 text-orange-500 border border-orange-500 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Track Application
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Help</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform addresses every aspect of the DBT process under PCR and PoA Acts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.name} 
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Processing Time', value: '15 Days' },
              { label: 'Victim Satisfaction', value: '85%+' },
              { label: 'Payment Accuracy', value: '99%' },
              { label: 'Grievance Resolution', value: '15 Days' }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SuccessStories />
    </div>
  );
};

export default Home;