import React from 'react';

export const Card = ({ children, className }) => {
  return <div className={`card-component ${className}`}>{children}</div>;
};

export const CardHeader = ({ children }) => {
  return <div>{children}</div>;
};

export const CardTitle = ({ children }) => {
  return <h3>{children}</h3>;
};

export const CardContent = ({ children, className }) => {
  return <div className={`card-content ${className}`}>{children}</div>;
};
