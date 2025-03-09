import TutorSession from "./TutorSession.js";
import SessionDetail from "./SessionDetail.js";
import Tutor from "./Tutor.js";
import Major from "./Major.js";

// Define associations **after** models are initialized
TutorSession.hasMany(SessionDetail, { foreignKey: "session_id" });
SessionDetail.belongsTo(TutorSession, { foreignKey: "session_id" });

Tutor.belongsTo(Major, { foreignKey: "major_id" });
Major.hasMany(Tutor, { foreignKey: "major_id" });
