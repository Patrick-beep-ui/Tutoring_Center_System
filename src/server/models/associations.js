import TutorSession from "./TutorSession.js";
import SessionDetail from "./SessionDetail.js";
import Tutor from "./Tutor.js";
import Major from "./Major.js";
import User from "./User.js";
import Course from "./Course.js";
import TutorCourse from "./TutorCourse.js";
import Contact from "./Contact.js";
import SessionFeedback from "./SessionFeedback.js";

// User ↔ Major
User.belongsTo(Major, { foreignKey: "major_id" });
Major.hasMany(User, { foreignKey: "major_id" });

// TutorSession ↔ SessionDetail
TutorSession.hasMany(SessionDetail, { foreignKey: "session_id" });
SessionDetail.belongsTo(TutorSession, { foreignKey: "session_id" });

// TutorSession ↔ Course
Course.hasMany(TutorSession, { foreignKey: "course_id" });
TutorSession.belongsTo(Course, { foreignKey: "course_id" });

// Course ↔ TutorCourse
Course.hasMany(TutorCourse, { foreignKey: "course_id" });
TutorCourse.belongsTo(Course, { foreignKey: "course_id" });

// User ↔ TutorCourse
User.hasMany(TutorCourse, { foreignKey: "user_id" });
TutorCourse.belongsTo(User, { foreignKey: "user_id" });

// Major ↔ Course
Major.hasMany(Course, { foreignKey: "major_id" });
Course.belongsTo(Major, { foreignKey: "major_id" });

// User ↔ Contact
Contact.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Contact, { foreignKey: "user_id" });

// Feedback ↔ User y TutorSession
SessionFeedback.belongsTo(TutorSession, { foreignKey: "session_id" });
SessionFeedback.belongsTo(User, { foreignKey: "user_id" });

TutorSession.hasMany(SessionFeedback, { foreignKey: "session_id" });
User.hasMany(SessionFeedback, { foreignKey: "user_id" });