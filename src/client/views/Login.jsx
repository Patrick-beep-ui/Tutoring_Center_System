import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import CAE from "../assets/CAE.jpg";

export default function Login() {
    const [isLoginForm, setIsLoginForm] = useState(true); // State to track whether login form is active
    const [loading, setLoading] = useState(false); // State to track loading state
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const toggleForm = () => {
        setIsLoginForm(!isLoginForm); 
    };

    const handleSignUp = async (formData) => {
        setLoading(true);
        const validDomains = ["keiseruniversity.edu", "student.keiseruniversity.edu"];
        const emailDomain = formData.email.split('@')[1];
        
        if (!validDomains.includes(emailDomain)) {
          setError("Please use your institutional email (e.g., @keiseruniversity.edu or @student.keiseruniversity.edu)");
          setLoading(false);
          return;
        }

        try {
            const response = await axios.post('/signup', formData);
            console.log(response.data);
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (formData) => {
        setLoading(true);
        try {
            await axios.post("/login", formData);
            console.log("Login Successful");
            navigate('/');
        } catch (error) {
            console.error(error.response?.data || error.message);
              
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="login-main">
        <div className="login-form-container">
            <form onSubmit={isLoginForm ? handleSubmit(handleLogin) : handleSubmit(handleSignUp)} className="form login-form">
                {/* Conditional rendering based on whether it's login or signup form */}
                {isLoginForm ? (
                    <>
                    <img src={CAE} alt="Tutoring Center Logo" className="cae-logo"/>
                        <div className="login-user" id="login-user">
                            <p>Welcome to The Writing Studio and Tutoring Center</p>
                            <div className="form-group">
                                <label for="email" className="login-label">KU Email</label>
                                <input type="email" {...register("email", {required: true})} id="email" />
                            </div>
                            <div className="form-group">
                                <label for="user-password" className="login-label">Your password</label>
                                <input type="password" {...register("password_hash", {required: true})} id="user-password" />
                            </div>
                            <span className="btn-form" id="forgotpass-btn"><a href="">Forgot Password?</a></span>
                            <div className="form-group">
                                <button type="submit" className="btn-sign btn-buy" id="login-btn" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </div>
                        </div>
                        <p className="community-label">New to our Community</p>
                        <a className="btn-form" id="sign-up-btn" onClick={toggleForm}>Create an Account</a>
                    </>
                ) : (
                    <>
                        <div className="login-user" id="signup-user">
                            <h1>Sign-Up</h1>
                            <div className="form-group">
                                <input type="text" {...register("first_name", {required: true})} id="first_name" placeholder="First Name" />
                            </div>
                            <div className="form-group">
                                <input type="text" {...register("last_name", {required: true})} id="last_name" placeholder="Last Name" />
                            </div>
                            <div className="form-group">
                                <input type="text" {...register("ku_id", {required: true})} id="username" placeholder="KU ID" />
                            </div>
                            <div className="form-group">
                                <input type="email" {...register("email", {required: true})} id="new-user-email" placeholder="Email" />
                            </div>
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}
                            <div className="form-group">
                                <input type="password" {...register("password_hash", {required: true})} id="new-user-password" placeholder="Password" />
                            </div>
                            <div className="form-group">
                                <button type="submit" className="btn-sign btn-buy" id="signup-btn" disabled={loading}>
                                    {loading ? 'Signing up...' : 'Sign-Up'}
                                </button>
                            </div>
                            <span className="btn-form" id="login-btn" onClick={toggleForm}>Login</span>
                        </div>
                    </>
                )}
            </form>
        </div>
        </section>
    );
}
