// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Sign In');
  const [btnColor, setBtnColor] = useState('#00e0a4');
  const navigate = useNavigate();

  const VALID_EMAIL = "ishitwo@moneysense.com";
  const VALID_PASS = "demo123";

  const handleLogin = (e) => {
    e.preventDefault();
    setStatus("Authenticating...");
    
    setTimeout(() => {
      if(email === VALID_EMAIL && password === VALID_PASS) {
        // Success: Set Session Flags
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', 'Ishitwo Khanra');
        setStatus("Success!");
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        alert("Invalid Credentials! \nTry: ishitwo@moneysense.com / demo123");
        setStatus("Sign In");
        setBtnColor("#ff4d4d");
        setTimeout(() => setBtnColor("#00e0a4"), 2000);
      }
    }, 800);
  };

  return (
    /* Added the wrapper class here to apply the centering CSS */
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <h2>Money<span>Sense</span></h2>
          <p>Sign in to your dashboard</p>

          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            <button type="submit" style={{ background: btnColor }}>{status}</button>
          </form>

          <div className="divider">or continue with</div>
          <div className="social-buttons">
            <button className="social" type="button">Google</button>
          </div>
          
          <p className="bottom-text">Don't have an account? <a href="#">Create one</a></p>
        </div>
      </div>
    </div>
  );
}