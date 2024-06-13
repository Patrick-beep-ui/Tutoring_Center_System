import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";

export default function Login() {
    const [imgVisibility, setImgVisibility] = useState('hidden');
    const [isLoginForm, setIsLoginForm] = useState(true); // State to track whether login form is active
    const [loading, setLoading] = useState(false); // State to track loading state
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const toggleForm = () => {
        setIsLoginForm(!isLoginForm); // Toggle between login and signup forms
    };

    const handleSignUp = async (formData) => {
        setLoading(true); // Set loading to true at the beginning of the request
        try {
            const response = await axios.post('/signup', formData);
            console.log(response.data);
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setLoading(false); // Set loading to false at the end of the request
        }
    };

    const handleLogin = async (formData) => {
        setLoading(true); // Set loading to true at the beginning of the request
        try {
            await axios.post("/login", formData);
            console.log("Login Successful");
            navigate('/');
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setLoading(false); // Set loading to false at the end of the request
        }
    };

    const logoutUser = async () => {
       try {
        const response = await axios.post('logout');
        console.log('Logout Successful', response);
       }
       catch(error) {
        console.error(error.response?.data || error.message);
       }
    };

    return (
        <div className="login-form-container">
            <form onSubmit={isLoginForm ? handleSubmit(handleLogin) : handleSubmit(handleSignUp)} className="form">
                {/* Conditional rendering based on whether it's login or signup form */}
                {isLoginForm ? (
                    <>
                        <div className="login-user" id="login-user">
                            <h1>Log In</h1>
                            <div className="form-group">
                                <input type="email" {...register("email", {required: true})} id="email" placeholder="Email" />
                            </div>
                            <div className="form-group">
                                <input type="password" {...register("password_hash", {required: true})} id="user-password" placeholder="Password" />
                            </div>
                            <span className="btn-form" id="forgotpass-btn"><a href="">Forgot Password?</a></span>
                            <div className="form-group">
                                <button type="submit" className="btn-sign btn-buy" id="login-btn" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </div>
                            <span className="btn-form" id="sign-up-btn" onClick={toggleForm}>Sign-Up</span>
                        </div>
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
    );
}
