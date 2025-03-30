const UserNavigators = () => {
    return(
        <section className="users-navigation">
            <div className="users-navigation-item">
                <label className="navigation-item-label">Program</label>
                <select className="navigation-item-select">
                    <option value="all">All Majors</option>
                </select>
            </div>
            <div className="users-navigation-item">
                <label className="navigation-item-label">Course</label>
                <select className="navigation-item-select">
                    <option value="all">All Courses</option>
                </select>
            </div>
            <div className="users-navigation-item">
                <label className="navigation-item-label">ID</label>
                <select className="navigation-item-select">
                    <option value="all">Search ID</option>
                </select>
            </div>
            <div className="users-navigation-item">
                <label className="navigation-item-label">Semester</label>
                <select className="navigation-item-select">
                    <option value="all">Current Semester</option>
                </select>
            </div>
        </section>
    )

}

export default UserNavigators;