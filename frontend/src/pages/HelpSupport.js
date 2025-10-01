import React from 'react';
import { PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const HelpSupport = () => {
  const faqs = [
    {
      question: "How long does the application process take?",
      answer: "The entire process typically takes 10-15 days from submission to DBT transfer."
    },
    {
      question: "What documents do I need to submit?",
      answer: "You need Aadhaar card, bank account details, and details about the incident. Additional documents may be requested based on your case."
    },
    {
      question: "How can I check my application status?",
      answer: "Use the Track Application feature on our website with your application ID, or call our helpline."
    },
    {
      question: "What if my application gets rejected?",
      answer: "You will receive a detailed explanation for rejection and can reapply with additional information or appeal the decision."
    }
  ];

  const contactMethods = [
    {
      name: '24x7 Helpline',
      description: 'Call us anytime for immediate assistance',
      icon: PhoneIcon,
      contact: '1800-1234-5678'
    },
    {
      name: 'Email Support',
      description: 'Send us your queries and we will respond within 24 hours',
      icon: EnvelopeIcon,
      contact: 'support@sahaayak.gov.in'
    },
    {
      name: 'Live Chat',
      description: 'Chat with our support team during business hours',
      icon: ChatBubbleLeftRightIcon,
      contact: 'Available 9 AM - 6 PM'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help you through every step of the application process
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {contactMethods.map((method) => (
            <div key={method.name} className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <method.icon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
              <p className="text-gray-600 mb-4">{method.description}</p>
              <p className="text-orange-600 font-semibold">{method.contact}</p>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-8">
            <QuestionMarkCircleIcon className="w-8 h-8 text-orange-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Section */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Assistance</h3>
          <p className="text-red-700">
            If you are in immediate danger or need urgent police assistance, please call the emergency number: 
            <span className="font-bold text-lg ml-2">100</span>
          </p>
          <p className="text-red-600 text-sm mt-2">
            For legal aid and immediate support, contact your local District Legal Services Authority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;