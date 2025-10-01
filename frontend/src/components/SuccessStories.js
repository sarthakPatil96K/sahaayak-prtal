import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const SuccessStories = () => {
  const stories = [
    {
      name: 'Ramesh Kumar',
      location: 'Delhi',
      story: 'Received compensation within 15 days through SAHAAYAK. The process was transparent and hassle-free.',
      amount: '₹50,000',
      rating: 5
    },
    {
      name: 'Sita Devi',
      location: 'Uttar Pradesh',
      story: 'The online tracking system kept me informed at every step. Great initiative for social justice.',
      amount: '₹1,00,000',
      rating: 5
    },
    {
      name: 'Arjun Singh',
      location: 'Maharashtra',
      story: 'Efficient DBT transfer and excellent officer support. Thank you SAHAAYAK team!',
      amount: '₹1,50,000',
      rating: 4
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Read how SAHAAYAK has helped victims receive timely justice and compensation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div key={index} className="bg-gradient-to-br from-orange-50 to-green-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {story.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{story.name}</h3>
                  <p className="text-sm text-gray-600">{story.location}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 italic">"{story.story}"</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 ${
                        i < story.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-green-600">{story.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;