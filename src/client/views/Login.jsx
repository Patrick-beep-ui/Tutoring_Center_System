import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import auth from "../authService";
import CAE from "../assets/CAE.jpg";
import texts from "../texts/login.json"

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
            const response = await auth.post('/signup', formData);
            console.log(response.data);
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (formData) => {
        setError(""); 
        setLoading(true);
        console.log("datos enviados: " + JSON.stringify(formData))
        try {
            const response = await auth.post("/login", formData);
            const {token} = response.data;

            if (token) {
                localStorage.setItem("jwtToken", token);
                // Configurar el header para futuras peticiones
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
                console.log("Login Successful");
                navigate('/');
            } else {
                throw new Error("No token received");
            }
            navigate('/');
        } catch (error) {
            console.error(error.response?.data || error.message);
            setError("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex h-full min-h-screen w-full items-center justify-center bg-[var(--blue)]">
        <div className="flex w-full max-w-[500px] items-center justify-center p-0 max-sm:p-4 sm:max-lg:w-[70%] lg:w-[45%]">
            <form onSubmit={isLoginForm ? handleSubmit(handleLogin) : handleSubmit(handleSignUp)} className="order-1 h-[640px] w-full rounded-[20px] bg-white p-6 max-sm:h-auto max-sm:p-4">
                {/* Conditional rendering based on whether it's login or signup form */}
                {isLoginForm ? (
                    <>
                    <img src={CAE} alt="Tutoring Center Logo" className="h-[100px] w-[100px] max-sm:h-[70px] max-sm:w-[70px] sm:max-lg:h-[90px] sm:max-lg:w-[90px]"/>
                        <div className="m-5 flex flex-col items-center justify-center gap-4 rounded-[20px] border border-[var(--gray)] p-2.5 [&>p]:mb-0 [&>p]:pt-5 [&>p]:text-[1.4rem] [&>p]:font-medium">
                            <p>{texts.loginForm.welcomeLabel}</p>
                            <div className="flex w-full flex-col items-start justify-start px-4">
                                <label htmlFor="email" className="text-left text-sm text-[var(--gray)]">{texts.loginForm.kuEmailLabel}</label>
                                <input className="w-full rounded-[10px] border border-[var(--gray)] p-2 focus:border-black focus:outline-none" type="email" {...register("email", {required: true})} id="email" />
                            </div>
                            <div className="flex w-full flex-col items-start justify-start px-4">
                                <label htmlFor="user-password" className="text-left text-sm text-[var(--gray)]">{texts.loginForm.passwordLabel}</label>
                                <input className="w-full rounded-[10px] border border-[var(--gray)] p-2 focus:border-black focus:outline-none" type="password" {...register("password_hash", {required: true})} id="user-password" />
                            </div>
                            <span className="mr-auto ml-5 cursor-pointer bg-white text-sm text-[#507db9] hover:border-b-2 hover:border-[#8d9ba4] hover:text-[#8d9ba4]"><a href="">{texts.loginForm.forgotPasswordLink}</a></span>
                            <div className="flex w-full flex-col items-start justify-start px-4">
                                <button type="submit" className="flex w-full cursor-pointer justify-center rounded-[40px] border border-black bg-[var(--yellow)] p-2.5 text-base text-black hover:bg-[#a2a790] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
                                    {loading ? `${texts.loginForm.loginInButton}` : `${texts.loginForm.loginButton}`}
                                </button>
                            </div>
                        </div>
                        <p className="relative inline-block w-[70%] px-2.5 text-[0.95rem] text-[var(--gray)] before:absolute before:top-1/2 before:ml-[-115px] before:h-px before:w-[32%] before:bg-[var(--gray)] before:opacity-20 before:content-[''] after:absolute after:top-1/2 after:ml-2.5 after:h-px after:w-[32%] after:bg-[var(--gray)] after:opacity-20 after:content-[''] max-sm:before:ml-[-100px] max-sm:after:ml-10 sm:max-lg:w-[60%] sm:max-lg:opacity-60 sm:max-lg:before:ml-[-95px] sm:max-lg:after:ml-5">{texts.loginForm.communityLabel}</p>
                        <Link to={'/signup'} className="block w-full cursor-pointer rounded-[40px] border border-black bg-[var(--yellow)] p-1.5 text-black no-underline" >{texts.loginForm.createAccountButton}</Link>
                    </>
                ) : (
                    <>
                        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center justify-center gap-4 rounded-[20px] bg-white px-6 py-8 shadow-[0_4px_15px_rgba(0,0,0,0.08)] [&_h1]:mb-2 [&_h1]:text-center [&_h1]:text-[1.75rem] [&_h1]:font-bold">
                            <h1>Sign-Up</h1>
                            <div className="w-full">
                                <input className="w-full rounded-lg border border-[var(--gray)] p-3 text-base outline-none focus:border-[var(--blue)]" type="text" {...register("first_name", {required: true})} id="first_name" placeholder="First Name" />
                            </div>
                            <div className="w-full">
                                <input className="w-full rounded-lg border border-[var(--gray)] p-3 text-base outline-none focus:border-[var(--blue)]" type="text" {...register("last_name", {required: true})} id="last_name" placeholder="Last Name" />
                            </div>
                            <div className="w-full">
                                <input className="w-full rounded-lg border border-[var(--gray)] p-3 text-base outline-none focus:border-[var(--blue)]" type="text" {...register("ku_id", {required: true})} id="username" placeholder="KU ID" />
                            </div>
                            <div className="w-full">
                                <input className="w-full rounded-lg border border-[var(--gray)] p-3 text-base outline-none focus:border-[var(--blue)]" type="email" {...register("email", {required: true})} id="new-user-email" placeholder="Email" />
                            </div>
                            {error && (
                                <div className="w-full text-left text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                            <div className="w-full">
                                <input className="w-full rounded-lg border border-[var(--gray)] p-3 text-base outline-none focus:border-[var(--blue)]" type="password" {...register("password_hash", {required: true})} id="new-user-password" placeholder="Password" />
                            </div>
                            <div className="w-full">
                                <button type="submit" className="w-full cursor-pointer rounded-[40px] border-0 bg-[var(--yellow)] p-[0.8rem] text-base font-semibold transition-colors hover:bg-[#f3b400] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
                                    {loading ? 'Signing up...' : 'Sign-Up'}
                                </button>
                            </div>
                            <span className="cursor-pointer bg-white" onClick={toggleForm}>Login</span>
                        </div>
                    </>
                )}
            </form>
        </div>
        </section>
    );
}
