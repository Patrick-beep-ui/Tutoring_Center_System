// CourseSelector.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function CourseSelector({ majorId, register, errors }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`/api/courses/major/${majorId}`);
        setCourses(res.data.courses); 
        console.log(res.data.courses);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    if (majorId) fetchCourses();
  }, [majorId]);

  const handleCheckboxChange = useCallback((courseId) => {
    const selected = new Set(getValues("courses") || []);
    if (selected.has(courseId)) {
      selected.delete(courseId);
    } else {
      selected.add(courseId);
    }
    setValue("courses", Array.from(selected));
  }, []);

  return (
    <div className="form-group ">
      <label className="signup-label">Courses</label>
      <div className="courses-form-group">
      {courses.map(classObj => (
            <div key={classObj.course_id} className="course-element">
                <input type="checkbox" id={classObj.course_id} value={classObj.course_id} {...register("courses", {required: true})} onChange={handleCheckboxChange}/>
                <label htmlFor={classObj.course_id}>{classObj.course_code}</label>
                <label htmlFor={classObj.course_id}>{classObj.course_name}</label>
            </div>
        ))}
        </div>
         {errors.courses && <span className="signup-error-message">Please select at least one course</span>}
    </div>
  );
}

export default CourseSelector;
