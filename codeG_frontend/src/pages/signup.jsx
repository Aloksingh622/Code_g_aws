import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from 'react-router'; // Corrected for web
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { user_register, social_login_thunk } from "../redux/auth_slice";
import axios_client from "../utils/axiosconfig";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

// --- Custom Imports for Themed Style & Animation ---
import AOS from 'aos';
import 'aos/dist/aos.css';
import logo from "../assets/logo.png";
import { signInWithGoogle, signInWithGitHub } from "../utils/firebase_auth";
import Particles from "../components/ui/particlebg"; // Assuming this is the correct path

// Updated Zod schema for better flow
const signupSchema = z.object({
  first_name: z.string().min(3, "Name must be at least 3 characters"),
  email_id: z.string().email("Invalid email address"),
  otp: z.string().optional(), // OTP is optional in the schema itself
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
});

function Signup() {
  const {
    register,
    handleSubmit,
    getValues,
    trigger, // For manual validation
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema), mode: "onTouched" });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { is_authenticated, loading, error } = useSelector((state) => state.auth);
  const [is_password_visible, set_is_password_visible] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
  }, []);

  useEffect(() => {
    if (is_authenticated) navigate("/");
  }, [is_authenticated, navigate]);

  const onSubmit = (data) => {
    if (otpSent && !data.otp) {
      // You can handle this case if needed, but Zod schema can enforce it if required
      return;
    }
    dispatch(user_register(data));
  };

  const handleSocialLogin = async (signInProvider) => {
    try {
      const result = await signInProvider();
      const idToken = await result.user.getIdToken();
      dispatch(social_login_thunk(idToken));
    } catch (err) {
      console.error("Social login failed", err);
    }
  };

  const send_otp = async () => {
    const isEmailValid = await trigger("email_id");
    if (!isEmailValid) return;

    const email = getValues("email_id");
    try {
      setOtpLoading(true);
      setOtpMessage("");
      await axios_client.post("/user/emailVerification", { email_id: email });
      setOtpSent(true);
      setOtpMessage("OTP sent successfully!");
    } catch (err) {
      setOtpMessage(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center  bg-gradient-to-br from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600  transition-colors overflow-hidden">
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
          <img src={logo} alt="CodeG Logo" className="h-16 w-16 mx-auto mb-4 rounded-xl shadow-lg" />
          <h2 className="text-3xl font-bold text-black dark:text-white">Create an Account</h2>
          <p className="text-gray-400 mt-2">Join the community to start coding.</p>
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={() => handleSocialLogin(signInWithGoogle)} aria-label="Continue with Google" className="btn btn-outline btn-square border-gray-600 hover:bg-white/10 transition-all">
            <FcGoogle size={24} />
          </button>
          <button onClick={() => handleSocialLogin(signInWithGitHub)} aria-label="Continue with GitHub" className="btn btn-outline btn-square border-gray-600 hover:bg-white/10 transition-all">
            <FaGithub size={24} className="text-black dark:text-white" />
          </button>
        </div>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-500 font-semibold uppercase">Or with email</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="First Name"
              className={`input input-bordered w-full bg-base-300/20 ${errors.first_name ? 'input-error' : ''}`}
              {...register("first_name")}
            />
            {errors.first_name && <p className="text-error text-sm mt-1">{errors.first_name.message}</p>}
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-grow">
              <input
                type="email"
                placeholder="Email Address"
                className={`input input-bordered w-full bg-base-300/20 ${errors.email_id ? 'input-error' : ''}`}
                {...register("email_id")}
              />
              {errors.email_id && <p className="text-error text-sm mt-1">{errors.email_id.message}</p>}
            </div>
            <button type="button" onClick={send_otp} disabled={otpLoading} className={`btn btn-secondary h-12 flex-shrink-0 ${otpLoading ? 'loading' : ''}`}>
              {otpLoading ? "" : "Send OTP"}
            </button>
          </div>
          {otpMessage && <p className={`text-sm text-center ${otpMessage.includes("successfully") ? "text-success" : "text-error"}`}>{otpMessage}</p>}

          {otpSent && (
            <div data-aos="fade-in">
              <input
                type="text"
                placeholder="Enter 4-Digit OTP"
                className={`input input-bordered w-full bg-base-300/20 ${errors.otp ? 'input-error' : ''}`}
                {...register("otp", { required: "OTP is required" })}
              />
              {errors.otp && <p className="text-error text-sm mt-1">{errors.otp.message}</p>}
            </div>
          )}

          <div>
            <div className="relative">
              <input
                type={is_password_visible ? "text" : "password"}
                placeholder="Password (min. 8 characters)"
                className={`input input-bordered w-full bg-base-300/20 pr-10 ${errors.password ? 'input-error' : ''}`}
                {...register("password")}
              />
              <button type="button" onClick={() => set_is_password_visible(!is_password_visible)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-white">
                {is_password_visible ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
              </button>
            </div>
            {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Must be at least 8 characters, include a capital letter, a number, and a special character.
            </p>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className={`btn btn-primary w-full text-base font-semibold ${loading ? 'loading' : ''}`}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-primary hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;