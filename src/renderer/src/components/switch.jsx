import { useState } from 'react';

export default function SimpleSwitch() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">
        {isOn ? 'ON' : 'OFF'}
        </span>
        
        <button
        onClick={() => setIsOn(!isOn)}
        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
            isOn ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        aria-label="Toggle switch"
        >
        <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
            isOn ? 'translate-x-7' : 'translate-x-0'
            }`}
        />
        </button>
    </div>
  );
}