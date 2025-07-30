// import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router';


// import { signInWithGoogle, signInWithGitHub } from "./firebase_auth"
// import { social_login_thunk } from "../redux/auth_slice"; 

// const Social_sign_in = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
    
//     // 2. Get the loading and error state directly from your Redux store
//     const { loading, error } = useSelector((state) => state.auth);

//     const handleSocialLogin = async (signInProvider) => {
//         try {
//             // STEP A: Handle the client-side Firebase popup
//             const result = await signInProvider();
//             const idToken = await result.user.getIdToken();

//             // STEP B: Dispatch your Redux Thunk with the token.
//             // This sends the token to your backend for verification.
//             await dispatch(social_login_thunk(idToken)).unwrap();

//             // .unwrap() makes the promise reject if the thunk fails,
//             // allowing us to catch the error here.

//             // On success, the user is authenticated. The useEffect in your
//             // Signup/App component will handle the navigation.
            
//         } catch (err) {
//             // This will catch errors from both the Firebase popup and your backend thunk.
//             // The error message from the rejected thunk is automatically put into the Redux store.
//             console.error('Social login process failed:', err);
//         }
//     };

//     return (
//         <div className='mt-6'>
//             <div className="relative flex py-5 items-center">
//                 <div className="flex-grow border-t border-gray-300"></div>
//                 <span className="flex-shrink mx-4 text-gray-500">OR</span>
//                 <div className="flex-grow border-t border-gray-300"></div>
//             </div>

//             <div className="flex flex-col gap-3">
//                 {}
//                 <button
//                     onClick={() => handleSocialLogin(signInWithGoogle)}
//                     disabled={loading}
//                     className='btn w-full bg-red-500 hover:bg-red-600 text-white border-none'
//                 >
//                     {loading ? 'Processing...' : 'Continue with Google'}
//                 </button>
                
//                 {}
//                 <button
//                     onClick={() => handleSocialLogin(signInWithGitHub)}
//                     disabled={loading}
//                     className='btn w-full bg-gray-800 hover:bg-gray-900 text-white border-none'
//                 >
//                     {loading ? 'Processing...' : 'Continue with GitHub'}
//                 </button>
//             </div>
            
           
//         </div>
//     );
// };

// export default Social_sign_in;