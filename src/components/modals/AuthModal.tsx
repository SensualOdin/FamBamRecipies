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
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      case 'signup': return 'grab an apron, add your recipes';
      case 'forgot': return "we'll email you a link";
      case 'reset': return 'choose a new password';
      default: return 'the binder missed you';
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
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={getTitle()}
    >
      <div
        className={`bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Index-card header */}
        <div className="relative index-card-lines border-b border-border px-8 pt-10 pb-7 overflow-hidden">
          <div className="absolute inset-0 index-card-margin pointer-events-none" />
          <div className="absolute -top-2 left-8 w-20 h-5 bg-primary/55 rounded-[2px] -rotate-3 shadow-sm pointer-events-none" />

          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 w-9 h-9 bg-muted hover:bg-border rounded-lg flex items-center justify-center transition-all text-foreground"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <div className="relative z-10 pl-6">
            <h2 className="font-hand text-4xl font-semibold text-foreground -rotate-1 mb-1">
              {getTitle()}
            </h2>
            <p className="font-hand text-lg text-muted-foreground">
              {getSubtitle()}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block group-focus-within:text-[hsl(var(--accent))] transition-colors">Chef Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl px-6 py-4 font-bold outline-none transition-all text-foreground"
                  placeholder="George Winner"
                  required={mode === 'signup'}
                />
              </div>
            )}

            {mode !== 'reset' && (
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block group-focus-within:text-[hsl(var(--accent))] transition-colors">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl px-6 py-4 font-bold outline-none transition-all text-foreground"
                  placeholder="george@example.com"
                  required={mode !== 'reset'}
                />
              </div>
            )}

            {(mode === 'signin' || mode === 'signup') && (
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block group-focus-within:text-[hsl(var(--accent))] transition-colors">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl px-6 py-4 font-bold outline-none transition-all text-foreground"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block group-focus-within:text-[hsl(var(--accent))] transition-colors">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-muted border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl px-6 py-4 font-bold outline-none transition-all text-foreground"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block group-focus-within:text-[hsl(var(--accent))] transition-colors">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-muted border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl px-6 py-4 font-bold outline-none transition-all text-foreground"
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
              className="w-full bg-primary text-primary-foreground py-5 rounded-full font-extrabold text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 border-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                getButtonLabel()
              )}
            </button>
          </form>

          {mode === 'signin' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => switchMode('forgot')}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors"
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
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors"
                >
                  Back to Sign In
                </button>
              ) : (
                <button
                  onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors"
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
