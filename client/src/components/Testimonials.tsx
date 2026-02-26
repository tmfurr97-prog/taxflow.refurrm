import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Jessica Martinez',
      role: 'Independent Consultant',
      content: 'TaxFlow helped me organize a year of chaotic receipts in just one afternoon. Game changer for my business.',
      rating: 5
    },
    {
      name: 'David Park',
      role: 'E-commerce Seller',
      content: 'The automated expense tracking alone is worth it. I found deductions I didn\'t even know existed.',
      rating: 5
    },
    {
      name: 'Amanda Foster',
      role: 'Creative Agency Owner',
      content: 'Finally ditched my expensive accountant. TaxFlow gives me the same results at a fraction of the cost.',
      rating: 5
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Stories from Real Users</h2>
          <p className="text-xl text-gray-600">Discover why people are switching to TaxFlow</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
