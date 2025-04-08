// import Mini_Nav from "../components/Mini_Nav.jsx";
// import Header from "../components/Header.jsx";
import AlertBox from "../components/AlertBox.jsx";
import "../App.css";



const Activity_Alerts = () =>{

    return (

        <>

                <h1 className="page-title">System Alerts</h1>

                <AlertBox
                    title="High Cancellation Rate"
                    message="Software Engineering Program has a 25% cancellation rate this week."
                    type="urgent"
                    details={[
                        { label: "Affected Courses", value: "12" },
                        { label: "Affected Tutors", value: "5" },
                        { label: "Recommendation", value: "Review tutor availability and student scheduling conflicts." }
                    ]}
                />

                <AlertBox
                    title="High Cancellation Rate"
                    message="Software Engineering Program has a 25% cancellation rate this week."
                    type="warning"
                    details={[
                        { label: "Affected Courses", value: "12" },
                        { label: "Affected Tutors", value: "5" },
                        { label: "Recommendation", value: "Review tutor availability and student scheduling conflicts." }
                    ]}
                />

                <AlertBox
                    title="High Cancellation Rate"
                    message="Software Engineering Program has a 25% cancellation rate this week."
                    type="information"
                    details={[
                        { label: "Affected Courses", value: "12" },
                        { label: "Affected Tutors", value: "5" },
                        { label: "Recommendation", value: "Review tutor availability and student scheduling conflicts." }
                    ]}
                />


                <AlertBox
                    title="High Cancellation Rate"
                    message="Software Engineering Program has a 25% cancellation rate this week."
                    type="urgent"
                    details={[
                        { label: "Affected Courses", value: "12" },
                        { label: "Affected Tutors", value: "5" },
                        { label: "Recommendation", value: "Review tutor availability and student scheduling conflicts." }
                    ]}
                />
                <AlertBox
                    title="High Cancellation Rate"
                    message="Software Engineering Program has a 25% cancellation rate this week."
                    type="warning"
                    details={[
                        { label: "Affected Courses", value: "12" },
                        { label: "Affected Tutors", value: "5" },
                        { label: "Recommendation", value: "Review tutor availability and student scheduling conflicts." }
                    ]}
                />

        </>

    );
}

export default Activity_Alerts;