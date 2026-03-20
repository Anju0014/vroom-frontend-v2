"use client"
import { CarFront } from 'lucide-react';

const Stepper = ({ steps, currentStep }: { steps: string[]; currentStep: number }) => {
  return (
    <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 mb-8  mx-auto">
      {steps.map((step, index) => (
        <li
          key={index}
          className={`flex md:flex-1 items-center ${index === steps.length - 1 ? '' : 'md:pr-8'}`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`relative flex items-center justify-center w-10 h-10 rounded-full ${
                index < currentStep
                  ? 'bg-indigo-600'
                  : index === currentStep
                  ? 'bg-indigo-500'
                  : 'bg-gray-200'
              }`}
            >
              <CarFront
                className={`w-6 h-6 ${index <= currentStep ? 'text-white' : 'text-gray-500'}`}
              />
              {index < currentStep && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                  ✓
                </span>
              )}
            </div>
            <span
              className={`mt-2 ${
                index < currentStep
                  ? 'text-indigo-600 font-medium'
                  : index === currentStep
                  ? 'text-indigo-500 font-medium'
                  : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 hidden md:block border-t-2 ${
                index < currentStep ? 'border-indigo-600' : 'border-gray-200'
              }`}
            />
          )}
        </li>
      ))}
    </ol>
  );
};
export default Stepper