import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PilotBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Sparkles className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm md:text-base font-medium">
            <span className="font-bold">Founding Tester Access:</span> You're using SmartBooks24's pilot version. 
            <span className="hidden sm:inline"> Help us improve by sharing feedback!</span>

          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-white hover:bg-white/20 ml-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PilotBanner;
