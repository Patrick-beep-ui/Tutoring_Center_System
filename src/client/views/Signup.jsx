import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import auth from "../authService";
import CAE from "../assets/CAE.jpg";
import texts from "../texts/login.json";
import CourseSelector from "../components/UserCoursesSelector";

function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const navigate = useNavigate();
  const fieldClassName =
    "block h-11 w-full rounded-lg border border-[#c7cbd6] bg-white px-3.5 text-sm text-[#333333] shadow-sm outline-none transition focus:border-[#192D64] focus:ring-2 focus:ring-[#192D64]/15";
  const labelClassName = "block text-[0.8rem] font-medium text-[#777676]";
  const primaryButtonClassName =
    "!inline-flex !h-11 !w-full items-center justify-center !rounded-lg !border-0 !bg-[#EEAF32] !px-4 !py-0 !font-semibold !text-[#192D64] !shadow-sm transition hover:!bg-[#f3be4b] focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[#192D64] disabled:!cursor-not-allowed disabled:!opacity-60";

  const handleSignUp = useCallback(async (formData) => {
    setLoading(true);
    const validDomains = [
      "keiseruniversity.edu",
      "student.keiseruniversity.edu",
    ];
    const emailDomain = formData.email.split("@")[1];

    if (!validDomains.includes(emailDomain)) {
      setError(
        "Please use your institutional email (e.g., @keiseruniversity.edu or @student.keiseruniversity.edu)",
      );
      setLoading(false);
      return;
    }

    try {
      const response = await auth.post("/signup", formData);
      console.log(response.data);
      navigate("/login");

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
        const response = await auth.get("/api/majors");
        const { data } = response;
        setMajors(data.majors);
        console.log(data.majors);
      } catch (error) {
        console.error(error.response?.data || error.message);
      }
    };

    getMajors();
  }, []);

  return (
    <section className="grid min-h-dvh bg-[#f4f4f4] font-[Poppins] text-[#333333] lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
      <div className="relative hidden min-h-dvh overflow-hidden lg:block">
        <img
          src="/img/Keiser LAC.jpg"
          alt="Keiser University campus"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 bg-white lg:h-dvh lg:overflow-y-auto">
        <div className="flex min-h-dvh items-center justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-10 lg:min-h-full lg:px-8 lg:py-6 xl:px-12">
          <form
            onSubmit={handleSubmit(handleSignUp)}
            className="w-full max-w-xl space-y-6 text-left sm:space-y-7 lg:space-y-8 xl:max-w-2xl"
          >
            <div className="-mt-1 space-y-3 text-center sm:-mt-2 sm:space-y-4 lg:space-y-5">
              <img
                src={CAE}
                alt="Tutoring Center Logo"
                className="mx-auto h-16 w-16 object-contain sm:h-20 sm:w-20 lg:h-24 lg:w-24"
              />

              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-2xl font-semibold tracking-tight text-[#192D64] sm:text-[1.65rem]">
                  {texts.signupForm.signupLabel}
                </p>
                <span className="block text-sm text-[#777676]">
                  {texts.signupForm.accountCheckLabel}{" "}
                  <a
                    href="/login"
                    className="!font-semibold !text-[#192D64] underline decoration-[#EEAF32] decoration-2 underline-offset-4 hover:!text-[#1f4f91]"
                  >
                    {texts.signupForm.loginLink}
                  </a>
                </span>
              </div>
            </div>

            {formStep === 1 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="first_name" className={labelClassName}>
                    {texts.signupForm.firstNameLabel}
                  </label>
                  <input
                    type="text"
                    {...register("first_name", { required: true })}
                    id="first_name"
                    className={fieldClassName}
                  />
                  {errors.first_name && (
                    <span className="block text-sm font-medium text-red-600">
                      First Name is required
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="last_name" className={labelClassName}>
                    {texts.signupForm.lastNameLabel}
                  </label>
                  <input
                    type="text"
                    {...register("last_name", { required: true })}
                    id="last_name"
                    className={fieldClassName}
                  />
                  {errors.last_name && (
                    <span className="block text-sm font-medium text-red-600">
                      Last Name is required
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="ku-id" className={labelClassName}>
                    {texts.signupForm.kuIDLabel}
                  </label>
                  <input
                    type="text"
                    {...register("ku_id", { required: true })}
                    id="ku-id"
                    className={fieldClassName}
                  />
                  {errors.ku_id && (
                    <span className="block text-sm font-medium text-red-600">
                      KU ID is required
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className={labelClassName}>
                    {texts.signupForm.kuEmailLabel}
                  </label>
                  <input
                    type="email"
                    {...register("email", { required: true })}
                    id="new-user-email"
                    className={fieldClassName}
                  />
                  {errors.email && (
                    <span className="block text-sm font-medium text-red-600">
                      Email is required
                    </span>
                  )}
                  {error && (
                    <div
                      className="text-sm font-medium text-red-600"
                      aria-live="polite"
                    >
                      {error}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className={labelClassName}>
                    {texts.signupForm.passwordLabel}
                  </label>
                  <input
                    type="password"
                    {...register("password_hash", { required: true })}
                    id="new-user-password"
                    className={fieldClassName}
                  />
                  {errors.password_hash && (
                    <span className="block text-sm font-medium text-red-600">
                      Password is required
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClassName}>Major</label>
                  <select
                    {...register("major", { required: true })}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                    className={fieldClassName}
                  >
                    <option value="" disabled selected>
                      Select your major
                    </option>
                    {majors.map((major) => (
                      <option value={major.major_id} key={major.major_id}>
                        {major.major_name}
                      </option>
                    ))}
                  </select>
                  {errors.major && (
                    <span className="block text-sm font-medium text-red-600">
                      Major is required
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className={primaryButtonClassName}
                    id="signup-next-btn"
                    onClick={() => setFormStep(2)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {formStep === 2 && (
              <div className="space-y-5 pt-1 sm:space-y-6 sm:pt-2">
                <CourseSelector
                  majorId={selectedMajor}
                  register={register}
                  errors={errors}
                  getValues={getValues}
                  setValue={setValue}
                />

                <div className="flex flex-col-reverse gap-3 pt-2 sm:gap-4 sm:pt-3">
                  <button
                    type="button"
                    className="!inline-flex !h-11 !w-full items-center justify-center !rounded-lg !border !border-[#192D64] !bg-white !px-4 !py-0 !font-semibold !text-[#192D64] transition hover:!bg-[#eef1f8] focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[#192D64]"
                    id="signup-back-btn"
                    onClick={() => setFormStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={primaryButtonClassName}
                    id="signup-btn"
                    disabled={loading}
                  >
                    {loading
                      ? texts.signupForm.signupInButton
                      : texts.signupForm.signupButton}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Signup;
