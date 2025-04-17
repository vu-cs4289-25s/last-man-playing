import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("myUserId");
    const username = localStorage.getItem("myUsername");

    if (token && userId) {
      setUser({
        id: userId,
        username: username,
        token: token,
      });
    }

    setLoading(false); // ✅ Done loading
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
