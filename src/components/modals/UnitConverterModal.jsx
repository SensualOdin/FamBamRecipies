import React, { useState, useEffect } from 'react';
import { commonUnits } from '../../data/constants';
import { ChevronLeft, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const UnitConverterModal = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('cup');
  const [toUnit, setToUnit] = useState('ml');
  const [result, setResult] = useState('');

  // Handle browser back button to close modal
  useEffect(() => {
    const handlePopState = () => {
      setIsVisible(false);
      setTimeout(onClose, 150);
    };

    window.history.pushState({ modal: 'unit-converter' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === 'unit-converter') {
        window.history.back();
      }
    };
  }, [onClose]);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  useEffect(() => {
    convert();
  }, [amount, fromUnit, toUnit]);

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

    const toMl = {
      'ml': 1, 'l': 1000, 'cup': 236.588, 'tbsp': 14.787, 'tsp': 4.929,
      'fl oz': 29.574, 'pint': 473.176, 'quart': 946.353, 'gallon': 3785.41, 'pinch': 0.31,
      'g': 1, 'kg': 1000, 'lb': 453.592
    };

    const mlValue = val * toMl[fromUnit];
    const finalValue = mlValue / toMl[toUnit];
    setResult(finalValue < 0.01 ? finalValue.toExponential(2) : finalValue.toFixed(2));
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-slate-900/60 backdrop-blur-md' : 'bg-transparent'}`} onClick={onClose}>
      <div 
        className={`bg-white rounded-[40px] shadow-2xl max-w-md w-full overflow-hidden transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-slate-950 p-8 text-white">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 shrink-0"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight leading-tight">Converter</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none mt-1">Precision Cooking</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 text-center border border-white/10">
            <div className="text-5xl font-black tracking-tighter mb-2 font-mono text-cyan-400">{result}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{toUnit}</div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {isMixedConversion && (
            <div className="bg-amber-50 rounded-[20px] p-4 flex items-start gap-3 border border-amber-100">
              <span className="text-xl">⚠️</span>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide leading-relaxed">
                Note: This assumes water density. For flour or sugar, use a scale for better accuracy!
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Amount to Convert</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-cyan-500 focus:bg-white rounded-2xl px-6 py-4 text-xl font-black outline-none transition-all font-mono"
              />
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">From</label>
                <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full bg-slate-50 rounded-2xl px-4 py-4 font-bold outline-none border-2 border-transparent focus:border-cyan-500 transition-all appearance-none text-sm">
                  {commonUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div className="pt-6">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">To</label>
                <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full bg-slate-50 rounded-2xl px-4 py-4 font-bold outline-none border-2 border-transparent focus:border-cyan-500 transition-all appearance-none text-sm">
                  {commonUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-8 pb-8">
          <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Done</button>
        </div>
      </div>
    </div>
  );
};

export default UnitConverterModal;
