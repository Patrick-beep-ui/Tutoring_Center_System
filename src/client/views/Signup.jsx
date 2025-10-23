import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import auth from "../authService";
import CAE from "../assets/CAE.jpg";
import texts from "../texts/login.json"
import CourseSelector from "../components/UserCoursesSelector";

function Signup() {
    const { register, handleSubmit, formState: { errors }, getValues, setValue } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [majors, setMajors] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [formStep, setFormStep] = useState(1);
    const navigate = useNavigate();

    const handleSignUp = useCallback(async (formData) => {
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
            navigate('/login');

            //alert(JSON.stringify(formData));
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const getMajors = async () => {
            try {
                const response = await auth.get('/api/majors');
                const {data} = response;
                setMajors(data.majors);
                console.log(data.majors);
            } catch (error) {
                console.error(error.response?.data || error.message);
            }
        }

        getMajors();
    }, []);

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
                        <span>
                        {texts.signupForm.accountCheckLabel}{" "}
                        <a href="/login">{texts.signupForm.loginLink}</a>
                        </span>
                    </div>

                    {formStep === 1 && (
                        <>
                        <div className="form-group">
                            <label htmlFor="first_name" className="signup-label">
                            {texts.signupForm.firstNameLabel}
                            </label>
                            <input type="text" {...register("first_name", { required: true })} id="first_name" />
                            {errors.first_name && <span className="signup-error-message">First Name is required</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name" className="signup-label">
                            {texts.signupForm.lastNameLabel}
                            </label>
                            <input type="text" {...register("last_name", { required: true })} id="last_name" />
                            {errors.last_name && <span className="signup-error-message">Last Name is required</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="ku-id" className="signup-label">
                            {texts.signupForm.kuIDLabel}
                            </label>
                            <input type="text" {...register("ku_id", { required: true })} id="ku-id" />
                            {errors.ku_id && <span className="signup-error-message">KU ID is required</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="signup-label">
                            {texts.signupForm.kuEmailLabel}
                            </label>
                            <input type="email" {...register("email", { required: true })} id="new-user-email" />
                            {errors.email && <span className="signup-error-message">Email is required</span>}
                            {error && <div className="signup-error-message">{error}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="signup-label">
                            {texts.signupForm.passwordLabel}
                            </label>
                            <input type="password" {...register("password_hash", { required: true })} id="new-user-password" />
                            {errors.password_hash && <span className="signup-error-message">Password is required</span>}
                        </div>

                        <div className="form-group">
                            <label className="signup-label">Major</label>
                            <select
                            {...register("major", { required: true })}
                            onChange={(e) => setSelectedMajor(e.target.value)}
                            >
                            <option value="" disabled selected>Select your major</option>
                            {majors.map((major) => (
                                <option value={major.major_id} key={major.major_id}>
                                {major.major_name}
                                </option>
                            ))}
                            </select>
                            {errors.major && <span className="signup-error-message">Major is required</span>}
                        </div>

                        <div className="form-group">
                            <button type="button" className="btn-sign btn-buy" id="signup-next-btn" onClick={() => setFormStep(2)}>
                            Next
                            </button>
                        </div>
                        </>
                    )}

                    {formStep === 2 && (
                        <>
                        <CourseSelector
                            majorId={selectedMajor}
                            register={register}
                            errors={errors}
                            getValues={getValues}
                            setValue={setValue}
                        />

                        <div className="form-group">
                            <button type="submit" className="btn-sign btn-buy" id="signup-btn"  disabled={loading}>
                            {loading ? texts.signupForm.signupInButton : texts.signupForm.signupButton}
                            </button>
                        </div>
                        
                        <div className="form-group">
                        <button type="button" className="btn-sign btn-buy" id="signup-back-btn" onClick={() => setFormStep(1)}>
                            Back
                        </button>
                        </div>
                        </>
                    )}
                </form>

                </div>
            </section>
        </>
    );
}

export default Signup;
