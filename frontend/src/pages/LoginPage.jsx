import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  User,
  Lock,
  Mail,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Brand from "../components/Brand.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { loginUser } from "../utils/auth.js";

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Password should be at least 4 characters.");
      return;
    }

    const user = loginUser({
      email,
      password,
      name: isSignUp ? name : undefined,
      goal: isSignUp ? goal : undefined,
    });

    onLoginSuccess(user);
    showToast({
      type: "success",
      title: `Welcome, ${user.name}!`,
      message: "Signed in to your study workspace.",
    });
    navigate("/workspace/overview");
  }

  return (
    <div className="login-page-wrap">
      <div className="login-card">
        <div className="login-card-header">
          <Link to="/" className="back-home-link" title="Back to home">
            <ArrowLeft size={16} />
            <span>Home</span>
          </Link>
          <Brand size="large" />
        </div>

        <div className="login-intro">
          <h2>{isSignUp ? "Create Account" : "Sign in to Daymark"}</h2>
          <p>
            {isSignUp
              ? "Create an account to start your study plan."
              : "Enter your email and password to continue."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form-inner">
          {error && <div className="login-error-alert">{error}</div>}

          {isSignUp && (
            <>
              <label className="field-group">
                <span>Full Name</span>
                <div className="input-with-icon">
                  <User size={16} />
                  <input
                    type="text"
                    placeholder="e.g. Luven Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    autoComplete="name"
                  />
                </div>
              </label>

              <label className="field-group">
                <span>Target Exam / Goal</span>
                <div className="input-with-icon">
                  <Sparkles size={16} />
                  <input
                    type="text"
                    placeholder="e.g. GATE 2027, USMLE, Semester Finals"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>
              </label>
            </>
          )}

          <label className="field-group">
            <span>Email Address</span>
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </label>

          <label className="field-group">
            <span>Password</span>
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>
          </label>

          <button type="submit" className="button button-primary login-btn">
            <span>{isSignUp ? "Create Account & Launch" : "Sign In to Workspace"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="login-toggle-prompt">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="toggle-link-btn"
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                }}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Need a new account?{" "}
              <button
                type="button"
                className="toggle-link-btn"
                onClick={() => {
                  setIsSignUp(true);
                  setError("");
                }}
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
