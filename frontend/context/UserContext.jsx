//handles client-side state management — keeping track of the logged-in user’s data across components in your React frontend.
import React, { createContext, useState, useEffect, useContext } from "react";

export const UserContext = createContext();

// Custom hook to access user data
export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch("/api/user/profile", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};
