import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-12">
      {[1, 2, 3].map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
              currentStep >= step 
                ? 'border-orange-500 bg-orange-500 text-white' 
                : 'border-zinc-700 bg-zinc-800 text-gray-500'
            }`}>
              {step}
            </div>
            <p className={`text-xs mt-2 ${currentStep >= step ? 'text-orange-500' : 'text-gray-500'}`}>
              {step === 1 ? 'Vehicle' : step === 2 ? 'Service' : 'Schedule'}
            </p>
          </div>
          {index < 2 && (
            <div className={`w-24 h-0.5 mx-4 ${currentStep > step ? 'bg-orange-500' : 'bg-zinc-700'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;