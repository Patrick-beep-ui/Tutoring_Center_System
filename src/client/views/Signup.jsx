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
            <section className="grid h-full grid-cols-1 md:grid-cols-2">
                <div className="hidden bg-[url('/img/Keiser%20LAC.jpg')] bg-cover bg-center md:block">
                    
                </div>
                <div className="signup-form-container">
                <form onSubmit={handleSubmit(handleSignUp)} className="order-1 flex h-full flex-col items-start justify-center gap-2 bg-white py-[30px] pl-[30px] pr-[50px] max-md:w-full max-md:items-center max-md:p-6 [&_.form-group]:flex [&_.form-group]:w-full [&_.form-group]:flex-col [&_.form-group]:items-start [&_.form-group]:justify-start [&_.form-group]:px-4 [&_input]:w-4/5 [&_input]:rounded-[10px] [&_input]:border [&_input]:border-[var(--gray)] [&_input]:p-2 max-md:[&_input]:w-full [&_select]:w-4/5 [&_select]:rounded-[10px] [&_select]:border [&_select]:border-[var(--gray)] [&_select]:p-2 max-md:[&_select]:w-full">
                    <img src={CAE} alt="Tutoring Center Logo" className="ml-[15px] h-[50px] w-[50px] max-md:mx-auto max-md:mb-2.5 max-md:block max-md:h-auto max-md:w-[120px]" />

                    <div className="flex flex-col items-start justify-center px-5 [&>p]:mb-0 [&>p]:pt-5 [&>p]:text-[1.4rem] [&>p]:font-medium [&>span]:text-sm">
                        <p>{texts.signupForm.signupLabel}</p>
                        <span>
                        {texts.signupForm.accountCheckLabel}{" "}
                        <a href="/login">{texts.signupForm.loginLink}</a>
                        </span>
                    </div>

                    {formStep === 1 && (
                        <>
                        <div className="form-group">
                            <label htmlFor="first_name" className="text-left text-sm text-[var(--gray)]">
                            {texts.signupForm.firstNameLabel}
                            </label>
                            <input type="text" {...register("first_name", { required: true })} id="first_name" />
                            {errors.first_name && <span className="pl-5 text-left text-sm text-red-600">First Name is required</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name" className="text-left text-sm text-[var(--gray)]">
                            {texts.signupForm.lastNameLabel}
                            </label>
                            <input type="text" {...register("last_name", { required: true })} id="last_name" />
                            {errors.last_name && <span className="pl-5 text-left text-sm text-red-600">Last Name is required</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="ku-id" className="text-left text-sm text-[var(--gray)]">
                            {texts.signupForm.kuIDLabel}
                            </label>
                            <input type="text" {...register("ku_id", { required: true })} id="ku-id" />
                            {errors.ku_id && <span className="pl-5 text-left text-sm text-red-600">KU ID is required</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="text-left text-sm text-[var(--gray)]">
                            {texts.signupForm.kuEmailLabel}
                            </label>
                            <input type="email" {...register("email", { required: true })} id="new-user-email" />
                            {errors.email && <span className="pl-5 text-left text-sm text-red-600">Email is required</span>}
                            {error && <div className="pl-5 text-left text-sm text-red-600">{error}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="text-left text-sm text-[var(--gray)]">
                            {texts.signupForm.passwordLabel}
                            </label>
                            <input type="password" {...register("password_hash", { required: true })} id="new-user-password" />
                            {errors.password_hash && <span className="pl-5 text-left text-sm text-red-600">Password is required</span>}
                        </div>

                        <div className="form-group">
                            <label className="text-left text-sm text-[var(--gray)]">Major</label>
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
                            {errors.major && <span className="pl-5 text-left text-sm text-red-600">Major is required</span>}
                        </div>

                        <div className="form-group">
                            <button type="button" className="mt-2.5 w-1/2 cursor-pointer rounded-[40px] border-0 bg-[var(--yellow)] p-2.5 text-base text-[var(--white)]" onClick={() => setFormStep(2)}>
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
                            <button type="submit" className="mt-2.5 w-1/2 cursor-pointer rounded-[40px] border-0 bg-[var(--yellow)] p-2.5 text-base text-[var(--white)] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
                            {loading ? texts.signupForm.signupInButton : texts.signupForm.signupButton}
                            </button>
                        </div>
                        
                        <div className="form-group">
                        <button type="button" className="mt-2.5 w-1/2 cursor-pointer rounded-[40px] border-0 bg-[var(--blue)] p-2.5 text-base text-[var(--white)]" onClick={() => setFormStep(1)}>
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
