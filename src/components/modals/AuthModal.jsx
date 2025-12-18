import React, { useState, useEffect } from 'react';
import { signUp, signIn } from '../../lib/supabase';

const AuthModal = ({ onClose, onSignIn, onError }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await signUp(email, password, name);
        if (signUpError) {
          setError(signUpError.message || 'Failed to create account. Please try again.');
          setIsLoading(false);
          return;
        }
        if (data.user && !data.session) {
          setError('Please check your email to confirm your account before signing in.');
          setIsLoading(false);
          return;
        }
        if (data.session) {
          onSignIn(data.user);
          setIsVisible(false);
          setTimeout(onClose, 300);
        }
      } else {
        const { data, error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message || 'Invalid email or password. Please try again.');
          setIsLoading(false);
          return;
        }
        if (data.user) {
          onSignIn(data.user);
          setIsVisible(false);
          setTimeout(onClose, 300);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-slate-900/60 backdrop-blur-md' : 'bg-transparent'}`} onClick={onClose}>
      <div 
        className={`bg-white rounded-[40px] shadow-2xl max-w-md w-full overflow-hidden transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-slate-950 p-10 text-white text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-detroit-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-2xl mx-auto mb-6">
              {isSignUp ? '👨‍🍳' : '🥘'}
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2">
              {isSignUp ? 'Join the Family' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
              {isSignUp ? 'Start Your Collection' : 'Your Kitchen Awaits'}
            </p>
          </div>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block group-focus-within:text-detroit-500 transition-colors">Chef Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-detroit-500 focus:bg-white rounded-2xl px-6 py-4 font-bold outline-none transition-all"
                  placeholder="George Winner"
                  required={isSignUp}
                />
              </div>
            )}

            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block group-focus-within:text-detroit-500 transition-colors">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-detroit-500 focus:bg-white rounded-2xl px-6 py-4 font-bold outline-none transition-all"
                placeholder="george@example.com"
                required
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block group-focus-within:text-detroit-500 transition-colors">Security Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-detroit-500 focus:bg-white rounded-2xl px-6 py-4 font-bold outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-600 text-xs font-bold leading-relaxed animate-fadeIn">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isSignUp ? 'Create Profile' : 'Enter Kitchen'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-detroit-600 transition-colors"
            >
              {isSignUp ? 'Already a Chef? Sign In' : "No account? Join the family"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
