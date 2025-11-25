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
        // Sign up
        const { data, error: signUpError } = await signUp(email, password, name);
        
        if (signUpError) {
          setError(signUpError.message || 'Failed to create account. Please try again.');
          setIsLoading(false);
          return;
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setError('Please check your email to confirm your account before signing in.');
          setIsLoading(false);
          return;
        }

        // If we have a session, sign in was successful
        if (data.session) {
          onSignIn(data.user);
          setIsVisible(false);
          setTimeout(onClose, 300);
        }
      } else {
        // Sign in
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-8 text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-300 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-2xl mx-auto mb-4">
              👨‍🍳
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {isSignUp ? 'Join the Family' : 'Welcome Back'}
            </h2>
            <p className="text-cyan-100">
              {isSignUp ? 'Create your chef account' : 'Sign in to your account'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring focus:ring-cyan-200 transition-all outline-none"
                  placeholder="Your name"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring focus:ring-cyan-200 transition-all outline-none"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring focus:ring-cyan-200 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
