import Header from "../../components/shared/Header";
import { useParams, useOutletContext } from "react-router-dom";
import settingsText from "../../texts/settings.json";
import { memo, useState, useEffect, useCallback } from "react";
import { Pencil } from "lucide-react";
import api from "../../axiosService";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

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
        <section className="section overflow-y-auto bg-muted/30 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
            <div className="w-full max-w-none min-w-0 overflow-hidden rounded-md border border-border bg-card shadow-none lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
                <div className="flex shrink-0 flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-left">
                        <h1 className="m-0 text-left text-2xl font-bold leading-tight text-[var(--primary)] sm:text-3xl">
                            Settings
                        </h1>
                        <p className="mt-1.5 mb-0 text-sm text-muted-foreground">
                            Manage your profile and account preferences
                        </p>
                    </div>
                </div>

                <form className="min-w-0 overflow-y-auto lg:min-h-0 lg:flex-1" onSubmit={handleSubmit}>
                    <section className="border-t border-border px-6 py-6 text-left lg:py-8">
                        <div className="mx-auto w-full max-w-6xl">
                            <h2 className="m-0 text-xl font-semibold text-foreground">{text.title.header}</h2>
                            <p className="mt-1 mb-0 text-sm text-muted-foreground">{text.title.subheader}</p>

                            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
                                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center lg:col-span-1 lg:flex-col lg:items-start">
                                    <img
                                        src={`/profile/${userRes.role}${user_id}.webp?${new Date().getTime()}`}
                                        alt={text["profile-picture"].alt}
                                        className="size-20 shrink-0 rounded-full border border-border object-cover lg:size-24"
                                        onError={(event) => {
                                            event.currentTarget.src = "/profile/profile.webp";
                                        }}
                                    />
                                    <div className="flex flex-col items-start gap-1.5">
                                        <Button type="button" variant="outline" size="sm" className="h-9 cursor-pointer lg:h-10">
                                            {text["profile-picture"]["upload-button"]}
                                        </Button>
                                        <p className="m-0 text-xs text-muted-foreground">{text["profile-picture"]["upload-note"]}</p>
                                    </div>
                                </div>

                                <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 lg:col-span-3 lg:gap-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground" htmlFor="first_name">{text.fields["first-name"]}</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                className="h-10 flex-1 lg:h-11"
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                value={userRes?.first_name || ""}
                                                disabled={!editable.first_name}
                                                onChange={(e) => setUserRes({ ...userRes, first_name: e.target.value })}
                                            />
                                            {(user.role === "dev" || user.role === "admin") ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-10 border-border bg-card text-foreground enabled:cursor-pointer hover:bg-muted lg:size-11"
                                                    aria-label="Edit first name"
                                                    onClick={() => toggleEdit("first_name")}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground" htmlFor="last_name">{text.fields["last-name"]}</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                className="h-10 flex-1 lg:h-11"
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                value={userRes?.last_name || ""}
                                                disabled={!editable.last_name}
                                                onChange={(e) => setUserRes({ ...userRes, last_name: e.target.value })}
                                            />
                                            {(user.role === "dev" || user.role === "admin") ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-10 border-border bg-card text-foreground enabled:cursor-pointer hover:bg-muted lg:size-11"
                                                    aria-label="Edit last name"
                                                    onClick={() => toggleEdit("last_name")}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground" htmlFor="ku_email">{text.fields["ku-email"]}</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                className="h-10 flex-1 lg:h-11"
                                                type="email"
                                                id="ku_email"
                                                name="ku_email"
                                                value={userRes?.email || ""}
                                                disabled={!editable.email}
                                                onChange={(e) => setUserRes({ ...userRes, email: e.target.value })}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="size-10 border-border bg-card text-foreground enabled:cursor-pointer hover:bg-muted lg:size-11"
                                                aria-label="Edit email"
                                                onClick={() => toggleEdit("email")}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground" htmlFor="phone">{text.fields["phone-number"]}</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                className="h-10 flex-1 lg:h-11"
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                required
                                                value={userRes?.Contacts?.[0]?.phone_number || ""}
                                                disabled={!editable.phone_number}
                                                onChange={(e) => setUserRes({ ...userRes, Contacts: [{ phone_number: e.target.value }] })}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="size-10 border-border bg-card text-foreground enabled:cursor-pointer hover:bg-muted lg:size-11"
                                                aria-label="Edit phone number"
                                                onClick={() => toggleEdit("phone_number")}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-border px-6 py-6 text-left lg:py-8">
                        <div className="mx-auto w-full max-w-6xl">
                            <h2 className="m-0 text-xl font-semibold text-foreground">{text["password-section"].header}</h2>
                            <p className="mt-1 mb-0 text-sm text-muted-foreground">Update your account password</p>

                            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-y-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-semibold text-foreground" htmlFor="password">{text["password-section"]["current-password"]}</label>
                                    <Input className="h-10 lg:h-11" type="password" id="password" name="password" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-foreground" htmlFor="new_password">{text["password-section"]["new-password"]}</label>
                                    <Input className="h-10 lg:h-11" type="password" id="new_password" name="new_password" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-foreground" htmlFor="new_password_conf">{text["password-section"]["confirm-new-password"]}</label>
                                    <Input className="h-10 lg:h-11" type="password" id="new_password_conf" name="new_password_conf" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-border px-6 py-5 lg:py-6">
                        <div className="mx-auto flex w-full max-w-6xl flex-col justify-end gap-2 sm:flex-row">
                            <Button type="button" variant="outline" className="h-10 cursor-pointer">{text.buttons.cancel}</Button>
                            <Button type="submit" className="h-10 cursor-pointer">{text.buttons.save}</Button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    </>
    )
}

export default memo(Settings);
