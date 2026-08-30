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
    <div className="flex w-full flex-col items-start justify-start px-4">
      <label className="text-left text-sm text-[var(--gray)]">Courses</label>
      <div className="mx-auto my-4 grid max-h-[280px] w-full max-w-[500px] grid-cols-1 gap-3 overflow-x-hidden overflow-y-auto rounded-lg bg-transparent p-2 sm:grid-cols-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[var(--blue)]">
        {courses.map((classObj) => {
          const isChecked = selectedCourses.includes(classObj.course_id.toString());

          return (
            <div key={classObj.course_id} className={`cursor-pointer rounded-lg bg-[var(--blue)] px-4 py-[0.8rem] text-center text-[0.95rem] font-medium text-[var(--white)] transition-colors hover:bg-[#1f4f91] max-md:px-[0.9rem] max-md:py-[0.65rem] max-md:text-sm ${isChecked ? 'bg-[var(--yellow)] text-black font-semibold' : ''}`}>
              <input
                className="hidden"
                type="checkbox"
                id={classObj.course_id}
                value={classObj.course_id}
                checked={isChecked}
                onChange={() => handleCheckboxChange(classObj.course_id.toString())}
              />
              <div className="text-[0.95rem]">
                <label htmlFor={classObj.course_id}>{classObj.course_code}</label>
                <label htmlFor={classObj.course_id}>{classObj.course_name}</label>
              </div>
            </div>
          );
        })}
      </div>
      {errors.courses && (
        <span className="pl-5 text-left text-sm text-red-600">Please select at least one course</span>
      )}
    </div>
  );
}

export default CourseSelector;
