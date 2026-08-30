import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import { LayoutProvider } from './context/Layout';

const App = () => {
  return (
    <div className="layout">
      <Header />
      <div>
        <Outlet /> 
      </div>
    </div>
  );
}

export default App;
