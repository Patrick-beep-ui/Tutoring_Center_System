
import TutorBox from "../../../components/users/tutors/TutorBox.jsx";


const Activity_Tutors = ({ dateRange }) => {

return (

    <>

            <h1 className="my-[30px] mb-[25px] text-left text-[22px]">Tutors Activity</h1>
            {(dateRange.from || dateRange.to) && (
                <p className="mb-5 rounded-md border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8]">
                    Tutor activity is currently static placeholder data and is not date-filterable yet.
                </p>
            )}


            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                <TutorBox
                    tutor={{
                        name: "Patrick Solis",
                        role: "Software Engineering Tutor",
                        schedule: [
                            { day: "Monday", oldTime: "1:00 PM - 3:00 PM", newTime: "2:00 PM - 4:00 PM" },
                            { day: "Wednesday", oldTime: "2:00 PM - 3:00 PM", newTime: "4:00 PM - 6:00 PM" },
                        ],
                    }}
                />

                <TutorBox
                    tutor={{
                        name: "Patrick Solis",
                        role: "Software Engineering Tutor",
                        schedule: [
                            { day: "Monday", oldTime: "1:00 PM - 3:00 PM", newTime: "2:00 PM - 4:00 PM" },
                            { day: "Wednesday", oldTime: "2:00 PM - 3:00 PM", newTime: "4:00 PM - 6:00 PM" },
                        ],
                    }}
                />


                <TutorBox
                    tutor={{
                        name: "Patrick Solis",
                        role: "Software Engineering Tutor",
                        schedule: [
                            { day: "Monday", oldTime: "1:00 PM - 3:00 PM", newTime: "2:00 PM - 4:00 PM" },
                            { day: "Wednesday", oldTime: "2:00 PM - 3:00 PM", newTime: "4:00 PM - 6:00 PM" },
                        ],
                    }}
                />

                <TutorBox
                    tutor={{
                        name: "Patrick Solis",
                        role: "Software Engineering Tutor",
                        schedule: [
                            { day: "Monday", oldTime: "1:00 PM - 3:00 PM", newTime: "2:00 PM - 4:00 PM" },
                            { day: "Wednesday", oldTime: "2:00 PM - 3:00 PM", newTime: "4:00 PM - 6:00 PM" },
                        ],
                    }}
                />

                <TutorBox
                    tutor={{
                        name: "Patrick Solis",
                        role: "Software Engineering Tutor",
                        schedule: [
                            { day: "Monday", oldTime: "1:00 PM - 3:00 PM", newTime: "2:00 PM - 4:00 PM" },
                            { day: "Wednesday", oldTime: "2:00 PM - 3:00 PM", newTime: "4:00 PM - 6:00 PM" },
                        ],
                    }}
                />


                <TutorBox
                    tutor={{
                        name: "Patrick Solis",
                        role: "Software Engineering Tutor",
                        schedule: [
                            { day: "Monday", oldTime: "1:00 PM - 3:00 PM", newTime: "2:00 PM - 4:00 PM" },
                            { day: "Wednesday", oldTime: "2:00 PM - 3:00 PM", newTime: "4:00 PM - 6:00 PM" },
                        ],
                    }}
                />


                <TutorBox
                    tutor={{
                        name: "Patrick Solis",
                        role: "Software Engineering Tutor",
                        schedule: [
                            { day: "Monday", oldTime: "1:00 PM - 3:00 PM", newTime: "2:00 PM - 4:00 PM" },
                            { day: "Wednesday", oldTime: "2:00 PM - 3:00 PM", newTime: "4:00 PM - 6:00 PM" },
                        ],
                    }}
                />


                <TutorBox
                    tutor={{
                        name: "Patrick Solis",
                        role: "Software Engineering Tutor",
                        schedule: [
                            { day: "Monday", oldTime: "1:00 PM - 3:00 PM", newTime: "2:00 PM - 4:00 PM" },
                            { day: "Wednesday", oldTime: "2:00 PM - 3:00 PM", newTime: "4:00 PM - 6:00 PM" },
                        ],
                    }}
                />

            </div>


    </>

);
};

export default Activity_Tutors;
