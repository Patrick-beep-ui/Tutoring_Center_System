import React, { useEffect, useState, useCallback } from "react";
import auth from "../authService";

function CourseSelector({ majorId, register, errors, getValues, setValue }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await auth.get(`/api/courses/major/${majorId}`);
        setCourses(res.data.courses); 
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    if (majorId) fetchCourses();
  }, [majorId]);

  const handleCheckboxChange = useCallback((courseId) => {
    try {
      const selected = new Set(getValues("courses") || []);
      
      if (selected.has(courseId)) {
        selected.delete(courseId);
      } else {
        selected.add(courseId);
      }
  
      setValue("courses", Array.from(selected));
      setSelectedCourses(getValues("courses") || []);
    } catch (error) {
      console.error("Error updating selected courses:", error);
    }
  }, [getValues, setValue]);

  return (
    <div className="form-group">
      <label className="signup-label">Courses</label>
      <div className="courses-form-group">
        {courses.map((classObj) => {
          const isChecked = selectedCourses.includes(classObj.course_id.toString());

          return (
            <div key={classObj.course_id} className="course-element">
              <input
                type="checkbox"
                id={classObj.course_id}
                value={classObj.course_id}
                checked={isChecked}
                onChange={() => handleCheckboxChange(classObj.course_id.toString())}
              />
              <div className="course-text">
                <label htmlFor={classObj.course_id}>{classObj.course_code}</label>
                <label htmlFor={classObj.course_id}>{classObj.course_name}</label>
              </div>
            </div>
          );
        })}
      </div>
      {errors.courses && (
        <span className="signup-error-message">Please select at least one course</span>
      )}
    </div>
  );
}

export default CourseSelector;