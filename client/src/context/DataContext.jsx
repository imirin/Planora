import { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [todayStats, setTodayStats] = useState({ totalMinutes: 0, sessions: [] });
  const [weeklyStats, setWeeklyStats] = useState({ weeklyData: [], totalMinutes: 0 });

  return (
    <DataContext.Provider value={{
      subjects, setSubjects,
      topics, setTopics,
      todayStats, setTodayStats,
      weeklyStats, setWeeklyStats
    }}>
      {children}
    </DataContext.Provider>
  );
};
