// src/components/appointment/ServiceTypeSelector.tsx
import React from 'react';
import { Clock, ChevronRight, Wrench } from 'lucide-react';

interface ServiceType {
  id: number;
  name: string;
  description: string;
  estimatedDuration: string;
  price: number;
}

interface ServiceTypeSelectorProps {
  types: ServiceType[];
  selectedId: string;
  onSelectType: (id: string) => void;
  label: string;
}

const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({ types, selectedId, onSelectType, label }) => {
  return (
    <div>
      <label className="flex items-center space-x-2 mb-3">
        <Wrench className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-semibold text-white uppercase tracking-wide">
          {label} *
        </span>
      </label>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {types.map((type) => (
          <div
            key={type.id}
            onClick={() => onSelectType(type.id.toString())}
            className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
              selectedId === type.id.toString()
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-zinc-700 bg-zinc-800/50 hover:border-orange-500/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">{type.name}</h4>
                <p className="text-gray-400 text-sm mb-2">{type.description}</p>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {type.estimatedDuration}
                  </span>
                  <span className="text-orange-500 font-semibold">${type.price}</span>
                </div>
              </div>
              {selectedId === type.id.toString() && (
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                  <ChevronRight className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTypeSelector;