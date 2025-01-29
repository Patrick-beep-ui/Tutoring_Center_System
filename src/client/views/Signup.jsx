import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import CAE from "../assets/CAE.jpg";
import texts from "../texts/login.json"

function Signup() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

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
            navigate('/login');
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="sign-up-container">
                <div className="signup-img">
                    
                </div>
                <div className="signup-form-container">
                    <form onSubmit={handleSubmit(handleSignUp)} className="form signup-form">
                    <img src={CAE} alt="Tutoring Center Logo" className="cae-logo signup-cae-logo" />
                        <div className="signup-header">
                            <p>{texts.signupForm.signupLabel}</p>
                            <span>{texts.signupForm.accountCheckLabel} <a href="/login">{texts.signupForm.loginLink}</a></span>
                        </div>

                        <div className="form-group">
                            <label for="first_name" className="signup-label">{texts.signupForm.firstNameLabel}</label>
                            <input type="text" {...register("first_name", { required: true })} id="first_name" />
                            {errors.first_name && <span className="signup-error-message">First Name is required</span>}
                        </div>
                        <div className="form-group">
                            <label for="last_name" className="signup-label">{texts.signupForm.lastNameLabel}</label>
                            <input type="text" {...register("last_name", { required: true })} id="last_name" />
                            {errors.last_name && <span className="signup-error-message">Last Name is required</span>}
                        </div>
                        <div className="form-group">
                            <label for="ku-id" className="signup-label">{texts.signupForm.kuIDLabel}</label>
                            <input type="text" {...register("ku_id", { required: true })} id="username" />
                            {errors.ku_id && <span className="signup-error-message">KU ID is required</span>}
                        </div>
                        <div className="form-group">
                            <label for="email" className="signup-label">{texts.signupForm.kuEmailLabel}</label>
                            <input type="email" {...register("email", { required: true })} id="new-user-email" />
                            {errors.email && <span className="signup-error-message">Email is required</span>}
                        </div>
                        {error && (
                                <div className="signup-error-message">
                                    {error}
                                </div>
                        )}
                        <div className="form-group">
                            <label for="password" className="signup-label">{texts.signupForm.passwordLabel}</label>
                            <input type="password" {...register("password_hash", { required: true })} id="new-user-password" />
                            {errors.password_hash && <span className="signup-error-message">Password is required</span>}
                        </div>
                        <div className="form-group">
                            <button type="submit" className="btn-sign btn-buy" id="signup-btn" disabled={loading}>
                            {loading ? `${texts.signupForm.signupInButton}` : `${texts.signupForm.signupButton}`}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}

export default Signup;
