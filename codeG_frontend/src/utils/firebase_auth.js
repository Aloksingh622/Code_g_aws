import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {auth} from "./firebase"

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();


export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};


export const signInWithGitHub = () => {
  return signInWithPopup(auth, githubProvider);
};