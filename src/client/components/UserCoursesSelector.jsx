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
    <div className="space-y-4 sm:space-y-5">
      <p className="text-2xl font-semibold tracking-tight text-[#192D64] sm:text-[1.65rem]">Courses</p>
      <div className="grid max-h-70 grid-cols-1 gap-2.5 overflow-y-auto pr-1 min-[520px]:grid-cols-2 sm:gap-3">
        {courses.map((classObj) => {
          const isChecked = selectedCourses.includes(classObj.course_id.toString());

          return (
            <div
              key={classObj.course_id}
              className={`relative flex min-h-20 cursor-pointer flex-col justify-center rounded-lg border px-3 py-2.5 text-left shadow-sm transition duration-200 focus-within:ring-2 focus-within:ring-[#192D64]/20 ${isChecked ? "border-[#EEAF32] bg-[#EEAF32] text-[#192D64]" : "border-[#192D64] bg-[#192D64] text-white hover:bg-[#1f4f91]"}`}
            >
              <input
                type="checkbox"
                id={classObj.course_id}
                value={classObj.course_id}
                checked={isChecked}
                onChange={() => handleCheckboxChange(classObj.course_id.toString())}
                className="sr-only"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor={classObj.course_id} className="cursor-pointer text-[0.8rem] font-semibold tracking-wide">{classObj.course_code}</label>
                <label htmlFor={classObj.course_id} className="cursor-pointer text-[0.8rem] leading-snug opacity-90">{classObj.course_name}</label>
              </div>
            </div>
          );
        })}
      </div>
      {errors.courses && (
        <span className="block text-sm font-medium text-red-600">Please select at least one course</span>
      )}
    </div>
  );
}

export default CourseSelector;
