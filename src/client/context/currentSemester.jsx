import React, { createContext, useState, useEffect } from 'react';
import auth from '../authService';

export const SemesterContext = createContext();

export const SemesterProvider = ({ children }) => {
  const [currentSemester, setCurrentSemester] = useState(null);

  useEffect(() => {
    auth.get('/api/terms/current')
      .then(res => setCurrentSemester(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <SemesterContext.Provider value={{ currentSemester }}>
      {children}
    </SemesterContext.Provider>
  );
};
