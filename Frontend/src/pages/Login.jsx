import React, { useState } from "react";
import "./login.css";
import chatbotLogo from "../Assets/chatbot.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      setError("Failed to login: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
          <img src={chatbotLogo} alt="Chatbot Logo" style={{height:60}} />
        </div>
        <h2>Login</h2>
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
        <button type="submit">Login</button>
        {error && <div className="login-error">{error}</div>}
        <div style={{marginTop:'1rem', textAlign:'center'}}>
        Create a new account. <a href="/signup"style={{color:'#1976d2',fontWeight:'bold',textDecoration:'none'}}>Signup</a>
      </div>
      </form>
    </div>
  );
}

export default Login;