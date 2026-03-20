
import React from 'react';
import { CarFront } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  useCarIcon?: boolean;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, useCarIcon = true }) => {
  return (
    <div className="relative w-full py-4">
      <div className="absolute top-1/2 w-full h-0.5 bg-gray-300 -translate-y-1/2"></div>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const isCurrentStep = index === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div className={`relative flex items-center justify-center w-6 h-6 rounded-full z-10 
                              ${isActive ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                {isCurrentStep && useCarIcon ? (
                  <CarFront size={16} className="text-white" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-gray-400'}`}></div>
                )}
              </div>
              
              {step && (
                <span className={`mt-2 text-xs ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;