
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { sheetsApi } from "@/lib/sheetsApi";

interface User {
  id: string;
  username: string;
  userType: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on component mount
    const storedUser = localStorage.getItem("athleticsUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await sheetsApi.authenticate(username, password);
      
      if (result.success) {
        const userData = {
          id: result.userData.id,
          username: result.userData.username,
          userType: result.userType
        };
        
        setUser(userData);
        localStorage.setItem("athleticsUser", JSON.stringify(userData));
        return { success: true };
      }
      
      return { success: false, message: result.message };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Authentication error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await sheetsApi.registerUser({
        username,
        password,
        userType: "user" // New registrations are always users, not admins
      });
      
      return result;
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Registration error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("athleticsUser");
  };

  const isAdmin = () => {
    return user?.userType === "admin";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
