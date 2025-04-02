import Mini_Nav from "../components/Mini_Nav.jsx";
import Header from "../components/Header.jsx";
import TutorBox from "../components/TutorBox.jsx";


const Activity_Tutors = () =>{

return (

    <>

        <Header />
        <section className="activity-container">
            <Mini_Nav/>

            <h1 className="page-title">Tutors Activity</h1>


            <div className= "tutor-grid">


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





        </section>

    </>

);
};

export default Activity_Tutors;