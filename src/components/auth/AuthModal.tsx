import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';
import { ThemeLogo } from '../common/ThemeLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setUser, addToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('Error', 'Please provide an email address.', 'error');
      return;
    }

    const userName = name || email.split('@')[0];
    setUser({
      id: `user-${Date.now()}`,
      name: userName.charAt(0).toUpperCase() + userName.slice(1),
      email: email,
      role: 'user',
      savedProductIds: ['prod-cupcakes'],
      savedProducts: ['prod-cupcakes'],
      dailyFiberGoalGrams: 28,
      currentFiberIntakeGrams: 18,
      recommendationHistoryCount: 1,
      memberSince: 'Today',
      preferences: {
        dailyFiberTargetGrams: 28,
        dietaryGoal: 'High Fiber & Gut Vitality',
        allergens: []
      }
    });

    addToast('Welcome', `Signed in as ${name || email}`, 'success');
    onClose();
  };

  const handleQuickDemo = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setUser({
        id: 'admin-1',
        name: 'Chief Formulator',
        email: 'lab.lead@nutribake.edu',
        role: 'admin',
        savedProductIds: [],
        savedProducts: [],
        dailyFiberGoalGrams: 30,
        currentFiberIntakeGrams: 20,
        recommendationHistoryCount: 12,
        memberSince: 'January 2025',
        preferences: {
          dailyFiberTargetGrams: 30,
          dietaryGoal: 'Research Formulation & Quality Assurance',
          allergens: []
        }
      });
      addToast('Admin Access', 'Signed in with laboratory formulation privileges.', 'info');
    } else {
      setUser({
        id: 'user-1',
        name: 'Dr. Sarah Lin',
        email: 'sarah.lin@example.com',
        role: 'user',
        savedProductIds: ['prod-cupcakes', 'prod-cookies'],
        savedProducts: ['prod-cupcakes', 'prod-cookies'],
        dailyFiberGoalGrams: 28,
        currentFiberIntakeGrams: 22,
        recommendationHistoryCount: 4,
        memberSince: 'March 2026',
        preferences: {
          dailyFiberTargetGrams: 28,
          dietaryGoal: 'High Fiber & Gut Vitality',
          allergens: []
        }
      });
      addToast('Welcome Back', 'Signed in as Dr. Sarah Lin', 'success');
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#29211E]/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#FAF5ED] border border-[#3A2721] overflow-hidden p-5 sm:p-10 space-y-5 sm:space-y-6 shadow-2xl my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-[#3A2721]/50 hover:text-[#3A2721] transition-colors p-1"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Header */}
        <div className="space-y-3 pr-6 sm:pr-0">
          <div className="flex items-center justify-between">
            <ThemeLogo variant="mark" size="sm" />
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[#657258]">
              Client Portal
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#3A2721]">
              {isSignUp ? 'Create Profile' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-[#29211E]/70">
              {isSignUp ? 'Save bespoke formulations and nutritional goals' : 'Access your saved batches and dietary preferences'}
            </p>
          </div>
        </div>

        {/* Quick Demo Fast Login */}
        <div className="border-t border-b border-[#3A2721]/15 py-3 flex items-center justify-between gap-2 sm:gap-3 text-xs">
          <span className="text-[10px] uppercase tracking-[0.14em] text-[#29211E]/60 font-medium shrink-0">
            Demo:
          </span>
          <div className="flex gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.12em] px-2.5 sm:px-3 py-1 border border-[#3A2721]/20 text-[#3A2721] hover:bg-[#3A2721]/5 transition-colors"
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.12em] px-2.5 sm:px-3 py-1 bg-[#3A2721] text-[#FAF5ED] hover:bg-[#2A1C18] transition-colors"
            >
              Lab Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.16em] text-[#3A2721] font-semibold block">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dr. Sarah Lin"
                className="w-full py-2 bg-transparent border-b border-[#3A2721]/20 text-xs sm:text-sm text-[#29211E] placeholder-[#29211E]/40 focus:outline-none focus:border-[#3A2721] transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.16em] text-[#3A2721] font-semibold block">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full py-2 bg-transparent border-b border-[#3A2721]/20 text-xs sm:text-sm text-[#29211E] placeholder-[#29211E]/40 focus:outline-none focus:border-[#3A2721] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.16em] text-[#3A2721] font-semibold block">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full py-2 bg-transparent border-b border-[#3A2721]/20 text-xs sm:text-sm text-[#29211E] placeholder-[#29211E]/40 focus:outline-none focus:border-[#3A2721] transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#3A2721] hover:bg-[#2A1C18] text-[#FAF5ED] text-xs uppercase tracking-[0.14em] font-medium transition-colors"
            >
              {isSignUp ? 'Create Profile' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Toggle between Login and Signup */}
        <div className="text-center pt-2 text-xs text-[#29211E]/70 border-t border-[#3A2721]/10">
          {isSignUp ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="font-medium text-[#A96345] hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New client?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="font-medium text-[#A96345] hover:underline"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
