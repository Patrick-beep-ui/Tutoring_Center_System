import Header from "../components/Header";
import TutorsListComponent from "../components/TutorsListComponent";
import StudentsListComponent from "../components/StudentsListComponent";

function Users() {
    return(
        <>
        <Header />
        <section className="section users-section">
                <TutorsListComponent />
                <StudentsListComponent />
        </section>
        </>
    )
}

export default Users;