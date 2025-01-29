import React from "react";

const HybridSessionCard = () => {
  // Sample data for testing
  const sampleSessions = [
    {
      course: "Introduction to Calculus",
      tutor: "Dr. Emily Wilkins",
      studentID: "STD-1234",
      date: "May 15, 2023",
      startTime: "2:00 PM",
      duration: "2 hours",
      outcomes:
        "The student demonstrated a strong understanding of the core concepts covered in the session. They were able to successfully solve a variety of practice problems and are now well-prepared for the upcoming exam.",
    },
    {
      course: "Advanced Physics",
      tutor: "Dr. Michael Grant",
      studentID: "STD-5678",
      date: "June 10, 2023",
      startTime: "4:00 PM",
      duration: "1.5 hours",
      outcomes:
        "The session focused on solving complex problems related to quantum mechanics. The student showed improvement and is confident about tackling future assignments.",
    },
    {
      course: "Programming in Python",
      tutor: "Mrs. Sarah Connor",
      studentID: "STD-9101",
      date: "July 20, 2023",
      startTime: "10:00 AM",
      duration: "3 hours",
      outcomes:
        "This session was a hands-on workshop where the student successfully built small projects using Python. The tutor commended the student's enthusiasm and ability to learn quickly.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center gap-6 p-6">
      {sampleSessions.map((session, index) => (
        <div
          key={index}
          className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl"
        >
          <h2 className="text-2xl font-bold mb-4">Tutoring Session</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Course</p>
              <p className="text-base font-medium">{session.course}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Tutor</p>
              <p className="text-base font-medium">{session.tutor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Student ID</p>
              <p className="text-base font-medium">{session.studentID}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Date</p>
              <p className="text-base font-medium">{session.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Start Time</p>
              <p className="text-base font-medium">{session.startTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Duration</p>
              <p className="text-base font-medium">{session.duration}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Session Outcomes
            </h3>
            <p className="text-sm text-gray-600 mt-2">{session.outcomes}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HybridSessionCard;
