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
                    <section className="profile-container section">
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    </section>
                </>
            );
        }   

    return( 
    <>
        <Header />
        <section className="section settings-section">

            <div className="profile-information-container">
                <form className="profile-information-form" onSubmit={handleSubmit}>
                    <section className="profile-form-container">
                        <div className="profile-form-group">
                            <h3>{text.title.header}</h3>
                            <p className="profile-form-text">{text.title.subheader}</p>
                        </div>
                        <div className="profile-form-group profile-picture-form-group">
                            <div className="profile-picture-container user-picture-container">
                                <img 
                                    src={`/profile/tutor${user_id}.jpg?${new Date().getTime()}`} 
                                    alt={text["profile-picture"].alt} 
                                    className="profile-picture" 
                                />
                            </div>
                            <div className="profile-picture-upload">
                                <button className="upload-pic-btn">{text["profile-picture"]["upload-button"]}</button>
                                <p className="profile-form-text">{text["profile-picture"]["upload-note"]}</p>
                            </div>
                        </div>
                        <div className="profile-form-group">
                            <label htmlFor="first_name">{text.fields["first-name"]}</label>
                            <input type="text" id="first_name" name="first_name" value={userRes?.first_name || ""} disabled={!editable.first_name}
                             onChange={(e) => setUserRes({ ...userRes, first_name: e.target.value })}
                             />
                            {(user.role === "dev" || user.role === "admin") ? (
                                <i 
                                className="bx bx-pencil cursor-pointer p-2 rounded-md text-white"
                                style={{marginLeft: "10px", cursor: "pointer", backgroundColor: "#1e2c60"}}
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
                                className="bx bx-pencil cursor-pointer p-2 rounded-md text-white"
                                style={{marginLeft: "10px", cursor: "pointer", backgroundColor: "#1e2c60"}}
                                onClick={() => toggleEdit("last_name")}
                                />
                            ) : (
                                null
                            )}
                        </div>
                    </section>

                    <section className="profile-form-container">
                        <div className="profile-form-group">
                            <label htmlFor="ku_email">{text.fields["ku-email"]}</label>
                            <input type="email" id="ku_email" name="ku_email" value={userRes?.email || ""} disabled={!editable.email}
                            onChange={(e) => setUserRes({ ...userRes, email: e.target.value })}
                            />
                            <i 
                                className="bx bx-pencil cursor-pointer p-2 rounded-md text-white"
                                style={{marginLeft: "10px", cursor: "pointer", backgroundColor: "#1e2c60"}}
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
                                className="bx bx-pencil cursor-pointer p-2 rounded-md text-white"
                                style={{marginLeft: "10px", cursor: "pointer", backgroundColor: "#1e2c60"}}
                                onClick={() => toggleEdit("phone_number")}
                            />
                        </div>

                        <div className="profile-form-group">
                            <div className="password-form-group">
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
                       <div className="profile-form-group profile-form-btns">
                        <button className="cancel-btn">{text.buttons.cancel}</button>
                        <button type="submit">{text.buttons.save}</button>
                       </div>
                    </section>
                </form>
            </div>
        </section>
    </>
    )
}

export default memo(Settings);