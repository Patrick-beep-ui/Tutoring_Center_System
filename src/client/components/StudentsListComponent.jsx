import UserNavigators from "./UsersNavigators";

const StudentsListComponent = () => {
    return (
        <div className="users-list students-list">
            <details>
                <summary>
                    <span className="summary-title">Students Directory</span>
                </summary>
                <UserNavigators/>
            </details>
        </div>
    );
}

export default StudentsListComponent;