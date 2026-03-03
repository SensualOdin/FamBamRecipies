import React, { useState, useEffect } from 'react';
import { signUp, signIn, resetPassword, updatePassword } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import { X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSignIn: (user: any) => void;
  onError?: (error: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSignIn, onError }) => {
  const authMode = useStore((state) => state.authMode);
  const setAuthMode = useStore((state) => state.setAuthMode);

  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>(authMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  // Sync if store authMode changes while modal is open
  useEffect(() => {
    setMode(authMode);
  }, [authMode]);

  const handleClose = () => {
    setAuthMode('signin');
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'reset') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        const { error: updateError } = await updatePassword(password);
        if (updateError) {
          setError(updateError.message || 'Failed to update password. Please try again.');
          setIsLoading(false);
          return;
        }
        setSuccessMessage('Password updated successfully! You can now sign in with your new password.');
        setIsLoading(false);
        setAuthMode('signin');
        setTimeout(() => {
          handleClose();
        }, 2000);
        return;
      }

      if (mode === 'forgot') {
        const { error: resetError } = await resetPassword(email);
        if (resetError) {
          setError(resetError.message || 'Failed to send reset email. Please try again.');
          setIsLoading(false);
          return;
        }
        setSuccessMessage('Password reset link sent! Check your email inbox.');
        setIsLoading(false);
        return;
      }

      if (mode === 'signup') {
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
      if (onError) onError('An unexpected error occurred.');
    }
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setAuthMode(newMode);
    setError(null);
    setSuccessMessage(null);
  };

  const getIcon = () => {
    switch (mode) {
      case 'signup': return '👨‍🍳';
      case 'forgot': return '🔑';
      case 'reset': return '🔒';
      default: return '🥘';
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Join the Family';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'New Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Start Your Collection';
      case 'forgot': return "We'll Email You a Link";
      case 'reset': return 'Choose a New Password';
      default: return 'Your Kitchen Awaits';
    }
  };

  const getButtonLabel = () => {
    switch (mode) {
      case 'signup': return 'Create Profile';
      case 'forgot': return 'Send Reset Link';
      case 'reset': return 'Update Password';
      default: return 'Enter Kitchen';
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-slate-950/60 backdrop-blur-md' : 'bg-transparent'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-background dark:bg-slate-900 rounded-[40px] shadow-2xl max-w-md w-full overflow-hidden transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-slate-950 p-6 sm:p-10 text-white text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-detroit-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <button onClick={handleClose} className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10">
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-2xl mx-auto mb-6">
              {getIcon()}
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2">
              {getTitle()}
            </h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
              {getSubtitle()}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block group-focus-within:text-detroit-500 transition-colors">Chef Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted border-2 border-transparent focus:border-detroit-500 focus:bg-background rounded-2xl px-6 py-4 font-bold outline-none transition-all text-foreground"
                  placeholder="George Winner"
                  required={mode === 'signup'}
                />
              </div>
            )}

            {mode !== 'reset' && (
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block group-focus-within:text-detroit-500 transition-colors">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted border-2 border-transparent focus:border-detroit-500 focus:bg-background rounded-2xl px-6 py-4 font-bold outline-none transition-all text-foreground"
                  placeholder="george@example.com"
                  required={mode !== 'reset'}
                />
              </div>
            )}

            {(mode === 'signin' || mode === 'signup') && (
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block group-focus-within:text-detroit-500 transition-colors">Security Key</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted border-2 border-transparent focus:border-detroit-500 focus:bg-background rounded-2xl px-6 py-4 font-bold outline-none transition-all text-foreground"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block group-focus-within:text-detroit-500 transition-colors">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-muted border-2 border-transparent focus:border-detroit-500 focus:bg-background rounded-2xl px-6 py-4 font-bold outline-none transition-all text-foreground"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block group-focus-within:text-detroit-500 transition-colors">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-muted border-2 border-transparent focus:border-detroit-500 focus:bg-background rounded-2xl px-6 py-4 font-bold outline-none transition-all text-foreground"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold leading-relaxed animate-in fade-in zoom-in-95">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-5 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 border-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                getButtonLabel()
              )}
            </button>
          </form>

          {mode === 'signin' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => switchMode('forgot')}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-detroit-600 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {mode !== 'reset' && (
            <div className="mt-4 text-center">
              {mode === 'forgot' ? (
                <button
                  onClick={() => switchMode('signin')}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-detroit-600 transition-colors"
                >
                  Back to Sign In
                </button>
              ) : (
                <button
                  onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-detroit-600 transition-colors"
                >
                  {mode === 'signup' ? 'Already a Chef? Sign In' : "No account? Join the family"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
