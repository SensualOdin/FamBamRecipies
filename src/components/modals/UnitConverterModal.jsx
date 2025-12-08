import React, { useState, useEffect } from 'react';
import { commonUnits } from '../../data/constants';

const UnitConverterModal = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('cup');
  const [toUnit, setToUnit] = useState('ml');
  const [result, setResult] = useState('');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  useEffect(() => {
    convert();
  }, [amount, fromUnit, toUnit]);

  // Check if converting between weight and volume
  const volumeUnits = ['ml', 'l', 'cup', 'tbsp', 'tsp', 'fl oz', 'pint', 'quart', 'gallon', 'pinch'];
  const weightUnits = ['g', 'kg', 'lb'];
  const isMixedConversion = (volumeUnits.includes(fromUnit) && weightUnits.includes(toUnit)) ||
                            (weightUnits.includes(fromUnit) && volumeUnits.includes(toUnit));

  const convert = () => {
    const val = parseFloat(amount);
    if (isNaN(val)) {
      setResult('---');
      return;
    }

    // Base unit: ml for volume, g for weight
    // Weight/volume conversions use water density (1g = 1ml)
    const toMl = {
      // Volume units (US customary & metric)
      'ml': 1,
      'l': 1000,
      'cup': 236.588,
      'tbsp': 14.787,
      'tsp': 4.929,
      'fl oz': 29.574,
      'pint': 473.176,
      'quart': 946.353,
      'gallon': 3785.41,
      'pinch': 0.31,  // ~1/16 tsp
      // Weight units (using water density: 1g ≈ 1ml)
      'g': 1,
      'kg': 1000,
      'lb': 453.592
    };

    const mlValue = val * toMl[fromUnit];
    const finalValue = mlValue / toMl[toUnit];

    setResult(finalValue < 0.01 ? finalValue.toExponential(2) : finalValue.toFixed(2));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Unit Converter
          </h2>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 text-center">
            <div className="text-5xl font-bold text-gray-800 font-mono mb-2">{result}</div>
            <div className="text-gray-500 font-medium uppercase tracking-wider">{toUnit}</div>
          </div>

          {isMixedConversion && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> Weight/volume conversion assumes water density. Results may vary for other ingredients.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono text-lg"
              />
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none bg-white"
                >
                  {commonUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className="pt-6 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none bg-white"
                >
                  {commonUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverterModal;

