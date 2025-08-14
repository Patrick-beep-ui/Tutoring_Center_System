import Header from "../components/Header";
import { useParams } from "react-router-dom";
import settingsText from "../texts/settings.json";
import { memo, useState, useEffect } from "react";
import axios from "axios";

function Settings() {
    const [user, setUser] = useState([]);
    const { user_id } = useParams();
    const text = settingsText["profile-information-form"];
    const [error, setError] = useState("");

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await axios.get(`/api/users/${user_id}`);
               const userData = response.data.user;
               console.log(userData)
               setUser(userData);
               setError("");
            }
            catch(e) {
                console.error(e)
            }
        }

        getUser();
    }, [])  

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
                <form className="profile-information-form">
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
                            <input type="text" id="first_name" name="first_name" value={user.first_name || ""} disabled />
                        </div>

                        <div className="profile-form-group">
                            <label htmlFor="last_name">{text.fields["last-name"]}</label>
                            <input type="text" id="last_name" name="last_name" value={user.last_name || ""} disabled />
                        </div>
                    </section>

                    <section className="profile-form-container">
                        <div className="profile-form-group">
                            <label htmlFor="ku_email">{text.fields["ku-email"]}</label>
                            <input type="email" id="ku_email" name="ku_email" value={user.email || ""} disabled/>
                        </div>

                        <div className="profile-form-group">
                            <label htmlFor="phone">{text.fields["phone-number"]}</label>
                            <input type="tel" id="phone" name="phone" required  value={user.Contacts?.[0].phone_number}/>
                        </div>

                        <div className="profile-form-group">
                            <div className="password-form-group">
                                <h5>{text["password-section"].header}</h5>
                                <div className="profile-form-group">
                                    <label htmlFor="password">{text["password-section"]["current-password"]}</label>
                                    <input type="password" id="password" name="password" required/>
                                </div>
                                <div className="profile-form-group">
                                    <label htmlFor="new_password">{text["password-section"]["new-password"]}</label>
                                    <input type="password" id="new_password" name="new_password" required />
                                </div>
                                <div className="profile-form-group">
                                    <label htmlFor="new_password_conf">{text["password-section"]["confirm-new-password"]}</label>
                                    <input type="password" id="new_password_conf" name="new_password_conf" required />
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