import Header from "../components/Header";
import { useParams, useOutletContext } from "react-router-dom";
import settingsText from "../texts/settings.json";
import { memo, useState, useEffect, useCallback } from "react";
import api from "../axiosService";

function Settings() {
    const [userRes, setUserRes] = useState({});
    const { user_id } = useParams();
    const text = settingsText["profile-information-form"];
    const [error, setError] = useState("");
    const [editable, setEditable] = useState({});
    const { user } = useOutletContext();

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await api.get(`/users/${user_id}`);
               const userData = response.data.user;
               console.log(userData)
               setUserRes(userData);
               setError("");
            }
            catch(e) {
                console.error(e)
            }
        }

        getUser();
    }, [])  

    const toggleEdit = useCallback((field) => {
        setEditable((prev) => ({ ...prev, [field]: !prev[field] }));
      }, [editable]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        try {
          const payload = {
            first_name: userRes.first_name,
            last_name: userRes.last_name,
            email: userRes.email,
            phone_number: userRes.phone_number || userRes.Contacts?.[0]?.phone_number,
          };
      
          // Send PATCH/PUT request to backend
          const response = await api.put(`/users/${user_id}`, payload);
      
          if (response.status === 200) {
            alert("User updated successfully!");
            setUserRes(response.data.user);
            setEditable({}); 
          }
        } catch (error) {
          console.error(error);
          alert("Error updating user.");
        }
    }, [userRes, user_id]);
      

        if (error) {
            return (
                <>
                    <Header />
                    <section className="section">
                        <div className="rounded-md bg-red-50 p-4 text-red-700">
                            <p>{error}</p>
                        </div>
                    </section>
                </>
            );
        }   

    return( 
    <>
        <Header />
        <section className="section">

            <div className="mt-2.5 min-h-[90%] bg-white py-2.5 pl-5 pr-2.5">
                <form className="flex" onSubmit={handleSubmit}>
                    <section className="m-2.5 w-1/2 border-r border-[var(--gray)] text-left [&>.profile-form-group]:m-2.5 [&>.profile-form-group]:w-full [&_label]:mb-0 [&_label]:font-medium [&_input]:w-[90%] [&_input]:rounded-[5px] [&_input]:border [&_input]:border-[var(--gray)] [&_input]:p-2">
                        <div className="profile-form-group">
                            <h3>{text.title.header}</h3>
                            <p className="text-[var(--gray)]">{text.title.subheader}</p>
                        </div>
                        <div className="profile-form-group my-5 flex items-center">
                            <div className="ml-0 flex h-[250px] w-[250px] items-center rounded-full">
                                <img 
                                    src={`/profile/${userRes.role}${user_id}.webp?${new Date().getTime()}`} 
                                    alt={text["profile-picture"].alt} 
                                    className="h-full w-full rounded-full object-cover"
                                />
                            </div>
                            <div className="ml-[30px]">
                                <button type="button" className="mb-1 cursor-pointer rounded-[5px] border-0 bg-[var(--blue)] p-2.5 text-[var(--white)]">{text["profile-picture"]["upload-button"]}</button>
                                <p className="text-[var(--gray)]">{text["profile-picture"]["upload-note"]}</p>
                            </div>
                        </div>
                        <div className="profile-form-group">
                            <label htmlFor="first_name">{text.fields["first-name"]}</label>
                            <input type="text" id="first_name" name="first_name" value={userRes?.first_name || ""} disabled={!editable.first_name}
                             onChange={(e) => setUserRes({ ...userRes, first_name: e.target.value })}
                             />
                            {(user.role === "dev" || user.role === "admin") ? (
                                <i 
                                className="bx bx-pencil ml-2.5 cursor-pointer rounded-md bg-[#1e2c60] p-2 text-white"
                                onClick={() => toggleEdit("first_name")}
                                />
                            ) : (
                                null
                            )}
                        </div>

                        <div className="profile-form-group">
                            <label htmlFor="last_name">{text.fields["last-name"]}</label>
                            <input type="text" id="last_name" name="last_name" value={userRes?.last_name || ""}  disabled={!editable.last_name}
                             onChange={(e) => setUserRes({ ...userRes, last_name: e.target.value })}
                              />
                            {(user.role === "dev" || user.role === "admin") ? (
                                <i 
                                className="bx bx-pencil ml-2.5 cursor-pointer rounded-md bg-[#1e2c60] p-2 text-white"
                                onClick={() => toggleEdit("last_name")}
                                />
                            ) : (
                                null
                            )}
                        </div>
                    </section>

                    <section className="m-2.5 w-1/2 text-left [&>.profile-form-group]:m-2.5 [&>.profile-form-group]:w-full [&_label]:mb-0 [&_label]:font-medium [&_input]:w-[90%] [&_input]:rounded-[5px] [&_input]:border [&_input]:border-[var(--gray)] [&_input]:p-2">
                        <div className="profile-form-group">
                            <label htmlFor="ku_email">{text.fields["ku-email"]}</label>
                            <input type="email" id="ku_email" name="ku_email" value={userRes?.email || ""} disabled={!editable.email}
                            onChange={(e) => setUserRes({ ...userRes, email: e.target.value })}
                            />
                            <i 
                                className="bx bx-pencil ml-2.5 cursor-pointer rounded-md bg-[#1e2c60] p-2 text-white"
                                onClick={() => toggleEdit("email")}
                            />
                        </div>

                        <div className="profile-form-group">
                            <label htmlFor="phone">{text.fields["phone-number"]}</label>
                            <input type="tel" id="phone" name="phone" required value={userRes?.Contacts?.[0]?.phone_number || "" } 
                            disabled={!editable.phone_number}
                            onChange={(e) => setUserRes({ ...userRes, Contacts: [{ phone_number: e.target.value }] })}
                            />
                            <i 
                                className="bx bx-pencil ml-2.5 cursor-pointer rounded-md bg-[#1e2c60] p-2 text-white"
                                onClick={() => toggleEdit("phone_number")}
                            />
                        </div>

                        <div className="profile-form-group">
                            <div className="mt-[30px]">
                                <h5>{text["password-section"].header}</h5>
                                <div className="profile-form-group">
                                    <label htmlFor="password">{text["password-section"]["current-password"]}</label>
                                    <input type="password" id="password" name="password"/>
                                </div>
                                <div className="profile-form-group">
                                    <label htmlFor="new_password">{text["password-section"]["new-password"]}</label>
                                    <input type="password" id="new_password" name="new_password" />
                                </div>
                                <div className="profile-form-group">
                                    <label htmlFor="new_password_conf">{text["password-section"]["confirm-new-password"]}</label>
                                    <input type="password" id="new_password_conf" name="new_password_conf" />
                                </div>
                            </div>
                        </div>
                       <div className="profile-form-group float-right mt-[30px]! mb-0! flex w-[300px]! justify-center">
                        <button type="button" className="m-1 rounded-[5px] border border-[var(--black)] bg-white px-[15px] py-2.5 font-medium text-[var(--black)] transition-colors hover:bg-[var(--dark-gray)] hover:text-white">{text.buttons.cancel}</button>
                        <button type="submit" className="m-1 cursor-pointer rounded-[5px] border-0 bg-[var(--blue)] px-[15px] py-2.5 text-[var(--white)]">{text.buttons.save}</button>
                       </div>
                    </section>
                </form>
            </div>
        </section>
    </>
    )
}

export default memo(Settings);
