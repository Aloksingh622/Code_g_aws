import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from 'react-router';
import axios_client from "../utils/axiosconfig";
import { Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Particles from "../components/ui/particlebg";

// Zod schema with strong password rules
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^a-zA-Z0-9]/, "Must include a special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});


// Reusable Password Input Field
const PasswordInput = ({ label, name, register, error, show, toggleShow, placeholder }) => (
  <div>
    <label className="block text-sm text-black dark:text-white mb-1">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        {...register(name)}
        placeholder={placeholder}
        className={`input input-bordered w-full bg-base-300/20 pr-12 text-gray-700 dark:text-white ${error ? 'input-error' : ''}`}
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-white"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
    {error && <p className="text-error text-sm mt-1">{error.message}</p>}
  </div>
);


function ChangePasswordPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched"
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError("");
    setApiSuccess("");
    try {
        console.log("hi")
      const response = await axios_client.put("/user/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setApiSuccess(response.data.message);
      reset();
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setApiError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600  transition-colors overflow-hidden">
     <div className="absolute inset-0 z-20 pointer-events-none">
                <Particles
                    particleColors={['#ffffff', '#ffffff']}
                    particleCount={180}
                    particleSpread={10}
                    speed={0.1}
                    particleBaseSize={100}
                    moveParticlesOnHover={true}
                    alphaParticles={false}
                    disableRotation={false}
                    className="absolute inset-0 w-full h-full"
                />
            </div>

      <div
        data-aos="zoom-in-up"
        className="relative z-10 w-full max-w-md bg-base-100/10 backdrop-blur-md border border-gray-700 p-6 sm:p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-black dark:text-white">Change Password</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Choose a new, strong password.</p>
        </div>

        {apiSuccess && (
          <div className="alert alert-success shadow-lg mb-4" data-aos="fade-in">
            <div><ShieldCheck className='h-5 w-5' /><span>{apiSuccess}</span></div>
          </div>
        )}
        {apiError && (
          <div className="alert alert-error shadow-lg mb-4" data-aos="fade-in">
            <div><Lock className='h-5 w-5' /><span>{apiError}</span></div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
          <PasswordInput
            label="Current Password"
            name="currentPassword"
            register={register}
            error={errors.currentPassword}
            show={showCurrent}
            toggleShow={() => setShowCurrent(prev => !prev)}
            placeholder="Enter current password"
          />

          <PasswordInput
            label="New Password"
            name="newPassword"
            register={register}
            error={errors.newPassword}
            show={showNew}
            toggleShow={() => setShowNew(prev => !prev)}
            placeholder="Enter new password"
          />

          <PasswordInput
            label="Confirm New Password"
            name="confirmPassword"
            register={register}
            error={errors.confirmPassword}
            show={showConfirm}
            toggleShow={() => setShowConfirm(prev => !prev)}
            placeholder="Confirm new password"
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full text-base ${loading ? 'loading' : ''}`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
