import React from 'react';
import { Sparkles, Calculator, FileSearch, MessageSquare, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AIAssistantSection: React.FC = () => {
  const features = [
    {
      icon: Calculator,
      title: 'Deduction Finder',
      description: 'Automatically highlights potential deductions based on your receipts, income sources, and spending patterns.'
    },
    {
      icon: FileSearch,
      title: 'Document Analysis',
      description: 'Extracts key data from uploaded documents to help you stay organized and ensure nothing gets overlooked.'
    },
    {
      icon: MessageSquare,
      title: '24/7 Tax Support',
      description: 'Get instant, automated answers to common tax and bookkeeping questions anytime, day or night.'
    },
    {
      icon: TrendingUp,
      title: 'Tax Optimization',
      description: 'Visual summaries and smart suggestions to help you make informed decisions all year long.'
    },
    {
      icon: Shield,
      title: 'Audit Protection Tips',
      description: 'Stay prepared with checklists and reminders that help you avoid common filing errors.'
    },
    {
      icon: Sparkles,
      title: 'Personalized Advice',
      description: 'Your experience adapts to your profile, showing what matters most for your situation.'
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Sparkles className="h-8 w-8 text-gray-900" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Tax Assistant
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Use our OpenAI-powered assistant to simplify your paperwork, uncover potential deductions, and get clear explanations of tax topics — so you can make informed decisions with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              AI Assistant is available 24/7 - Look for the chat icon in the bottom right
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantSection;
