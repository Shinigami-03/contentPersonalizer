import React, { useState } from "react";
import "../pages/login.css";
import chatbotLogo from "../Assets/chatbot.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, firestore } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
        username: username,
        email: user.email
      });
      navigate("/login"); // Redirect to login after signup
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please try logging in or use a different email.');
      } else {
        setError('Failed to sign up: ' + err.message + '\nIf you continue to see this error, please check your Firebase Authentication settings and ensure Email/Password sign-in is enabled in the Firebase Console.');
      }
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
          <img src={chatbotLogo} alt="Chatbot Logo" style={{height:60}} />
        </div>
        <h2>Create an Account</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
        {error && <div className="login-error">{error}</div>}
        <div style={{marginTop:'1rem', textAlign:'center'}}>
          Already have an account? <a href="/login" className="signup-link" style={{color:'#1976d2',fontWeight:'bold',textDecoration:'none'}}>Login</a>
        </div>
      </form>
    </div>
  );
}

export default Signup;