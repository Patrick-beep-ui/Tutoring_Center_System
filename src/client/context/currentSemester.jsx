import React, { createContext, useState, useEffect } from 'react';
import auth from '../authService';

export const SemesterContext = createContext();

export const SemesterProvider = ({ children }) => {
  const [currentSemester, setCurrentSemester] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  useEffect(() => {
    Promise.all([
      auth.get('/api/terms/current'),
      auth.get('/api/terms')
    ])
      .then(([currentRes, termsRes]) => {
        setCurrentSemester(currentRes.data);
        setSemesters(termsRes.data.terms || []);
        setSelectedSemesterId(currentRes.data?.currentSemester?.semester_id ?? null);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <SemesterContext.Provider value={{ currentSemester, semesters, selectedSemesterId, setSelectedSemesterId }}>
      {children}
    </SemesterContext.Provider>
  );
};
