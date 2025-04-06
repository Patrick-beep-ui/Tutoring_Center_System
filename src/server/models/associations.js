import TutorSession from "./TutorSession.js";
import SessionDetail from "./SessionDetail.js";
import Tutor from "./Tutor.js";
import Major from "./Major.js";
import User from "./User.js";
import Course from "./Course.js";
import TutorCourse from "./TutorCourse.js";
import Contact from "./Contact.js";

// Define associations
User.belongsTo(Major, { foreignKey: "major_id" });
Major.hasMany(User, { foreignKey: "major_id" });

TutorSession.hasMany(SessionDetail, { foreignKey: "session_id" });
SessionDetail.belongsTo(TutorSession, { foreignKey: "session_id" });

Course.hasMany(TutorCourse, { foreignKey: "course_id" });
TutorCourse.belongsTo(Course, { foreignKey: "course_id" });

User.hasMany(TutorCourse, { foreignKey: "user_id" });
TutorCourse.belongsTo(User, { foreignKey: "user_id" });

Major.hasMany(Course, { foreignKey: "major_id" });
Course.belongsTo(Major, { foreignKey: "major_id" });

Contact.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Contact, { foreignKey: "user_id" });