// MembersContext.js
import React, { createContext, useContext, useState } from 'react';

const MembersContext = createContext();

export const useMembersContext = () => useContext(MembersContext);

export const MembersProvider = ({ children }) => {
  const [membersData, setMembersData] = useState([]);

  return (
    <MembersContext.Provider value={{ membersData, setMembersData }}>
      {children}
    </MembersContext.Provider>
  );
};
