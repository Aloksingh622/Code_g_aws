

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import axios_client from '../utils/axiosconfig'; 

import { Lock, Eye, EyeOff, CircleCheck, CircleX } from 'lucide-react';

const PasswordInput = ({ label, id, register, error, isVisible, toggleVisibility }) => (
  <div className="form-control w-full">
    <label className="label" htmlFor={id}>
      <span className="label-text font-bold text-base-content/80">{label}</span>
    </label>
    <div className="relative">
      <Lock
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
        size={20}
        strokeWidth={1.5}
      />
      <input
        id={id}
        type={isVisible ? 'text' : 'password'}
        placeholder="••••••••"
        {...register}
        className={`
          input input-bordered w-full pl-12 text-lg 
          transition-all duration-300
          focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100
          ${error ? 'input-error' : 'focus:input-primary'}
        `}
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute right-2 top-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-base-300/50 active:bg-base-300/70 focus:outline-none transition-colors duration-200"
        style={{ transform: 'translateY(-50%)', position: 'absolute' }}
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    
    <div className="h-5 mt-1">
      {error && (
        <span className="label-text-alt text-error text-xs flex items-center gap-1">
            <CircleX size={14} /> {error.message}
        </span>
      )}
    </div>
  </div>
);

// =================================================================================
//  2. Main Set Password Page Component
// =================================================================================
const SetPasswordPage = () => {
  const { register, handleSubmit, watch, formState: { errors }, setError, reset } = useForm({ mode: 'onBlur' });
  const navigate = useNavigate();

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const newPasswordValue = watch('newPassword');

  const onSubmit = async (data) => {
    setFeedback({ type: '', message: '' });
    setLoading(true);

    try {
      const saveResponse = await axios_client.put(`/user/updateUser`, data);
      setFeedback({ type: 'success', message: "Your password has been set! Redirecting..." });
      reset();
      setTimeout(() => navigate('/'), 2500);

    } catch (apiError) {
      const message = apiError.message || "An unexpected error occurred. Please try again.";
      setError('root.serverError', { type: 'manual', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (errors.root?.serverError) {
      setFeedback({ type: 'error', message: errors.root.serverError.message });
    }
  }, [errors.root?.serverError]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-200 p-4 bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="card w-full max-w-lg bg-base-100/80 backdrop-blur-xl shadow-2xl border border-base-content/10"
      >
        <div className="card-body p-8 md:p-12">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-2">
              Set Your Password
            </h1>
            <p className="text-base-content/70">A strong password is the key to your account's security.</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <PasswordInput
              id="newPassword"
              label="New Password"
              register={register('password', {
                required: 'A new password is required.',
                minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                validate: {
                  hasUpperCase: v => /[A-Z]/.test(v) || 'Must contain one uppercase letter.',
                  hasSpecialChar: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Must contain one special character.',
                }
              })}
              error={errors.newPassword}
              isVisible={showNew}
              toggleVisibility={() => setShowNew(!showNew)}
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              register={register('confirmPassword', {
                required: 'Please confirm your new password.',
                validate: value => value === newPasswordValue || 'The passwords do not match.'
              })}
              error={errors.confirmPassword}
              isVisible={showConfirm}
              toggleVisibility={() => setShowConfirm(!showConfirm)}
            />

            <AnimatePresence>
              {feedback.message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} text-sm`}>
                    {feedback.type === 'success' ? <CircleCheck /> : <CircleX />}
                    <span>{feedback.message}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="form-control pt-6">
              <button
                type="submit"
                className={`btn btn-primary btn-lg w-full transition-all duration-300 ${loading ? 'loading' : ''}`}
                disabled={loading || feedback.type === 'success'}
              >
                {loading ? 'Setting Password...' : 'Set Password'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SetPasswordPage;