import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Wrench, User, Mail, Lock, Sun, Moon } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Signup = () => {
  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await signup(data.email, data.password, data.name);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create an account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number';
    }
    return true;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-sm"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-center flex-grow px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="bg-primary-600 p-3 rounded-full">
              <Wrench size={32} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2 text-neutral-800 dark:text-white">
            Create an account
          </h1>
          <p className="text-center mb-6 text-neutral-600 dark:text-neutral-400">
            Join as a service provider and start accepting repair requests
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-neutral-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={`pl-10 w-full py-2 px-4 rounded-md border ${
                    errors.name 
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-neutral-300 dark:border-neutral-600'
                  } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-neutral-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`pl-10 w-full py-2 px-4 rounded-md border ${
                    errors.email 
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-neutral-300 dark:border-neutral-600'
                  } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-neutral-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`pl-10 w-full py-2 px-4 rounded-md border ${
                    errors.password 
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-neutral-300 dark:border-neutral-600'
                  } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  {...register('password', { 
                    required: 'Password is required',
                    validate: validatePassword
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
              <ul className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 space-y-1">
                <li className={`flex items-center ${watch('password')?.length >= 6 ? 'text-green-500' : ''}`}>
                  <span className="mr-1">•</span> At least 6 characters
                </li>
                <li className={`flex items-center ${/[a-z]/.test(watch('password') || '') ? 'text-green-500' : ''}`}>
                  <span className="mr-1">•</span> One lowercase letter
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(watch('password') || '') ? 'text-green-500' : ''}`}>
                  <span className="mr-1">•</span> One uppercase letter
                </li>
                <li className={`flex items-center ${/[0-9]/.test(watch('password') || '') ? 'text-green-500' : ''}`}>
                  <span className="mr-1">•</span> One number
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-neutral-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`pl-10 w-full py-2 px-4 rounded-md border ${
                    errors.confirmPassword 
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-neutral-300 dark:border-neutral-600'
                  } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: (value) => value === watch('password') || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;