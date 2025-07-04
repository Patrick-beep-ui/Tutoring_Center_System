import "../App.css"



const TopTutorsList = ({ tutors }) => {
    return (
        <div className="top-tutors">
            <h3>Top Tutors</h3>
            <p>Outstanding tutors of this week</p>
            <ol>
                {tutors.map((tutor, index) => (
                    <li key={index}>{tutor}</li>
                ))}
            </ol>
        </div>
    );
};

export default TopTutorsList;
