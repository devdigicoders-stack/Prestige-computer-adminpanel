import { useEffect, useState } from 'react';
import AuthContext from './authContextInstance';
import adminAuthService, {
  clearAdminAuth,
  getAdminToken,
  setAdminToken,
} from '../services/adminAuthService';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pcs_admin_user') || sessionStorage.getItem('pcs_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => getAdminToken());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAdminToken()));
  const [loading, setLoading] = useState(true);

  // Sync / Verify profile on initial mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const existingToken = getAdminToken();
      if (!existingToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await adminAuthService.getProfile();
        if (isMounted && response?.data) {
          setUser(response.data);
          setIsAuthenticated(true);
          localStorage.setItem('pcs_admin_user', JSON.stringify(response.data));
          localStorage.setItem('pcs_admin_authenticated', 'true');
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        if (isMounted) {
          clearAdminAuth();
          setUser(null);
          setToken('');
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Login handler
   */
  const login = async (email, password, rememberMe = true) => {
    const res = await adminAuthService.login(email, password);
    const { user: userData, token: jwtToken } = res.data;

    setAdminToken(jwtToken, rememberMe);
    if (rememberMe) {
      localStorage.setItem('pcs_admin_user', JSON.stringify(userData));
      localStorage.setItem('pcs_admin_authenticated', 'true');
    } else {
      sessionStorage.setItem('pcs_admin_user', JSON.stringify(userData));
      sessionStorage.setItem('pcs_admin_authenticated', 'true');
    }

    setToken(jwtToken);
    setUser(userData);
    setIsAuthenticated(true);

    return userData;
  };

  /**
   * Register handler
   */
  const register = async (adminData) => {
    const res = await adminAuthService.register(adminData);
    const { user: userData, token: jwtToken } = res.data;

    setAdminToken(jwtToken, true);
    localStorage.setItem('pcs_admin_user', JSON.stringify(userData));
    localStorage.setItem('pcs_admin_authenticated', 'true');

    setToken(jwtToken);
    setUser(userData);
    setIsAuthenticated(true);

    return userData;
  };

  /**
   * Update Profile (supports FormData with image file)
   */
  const updateProfile = async (formDataOrObject) => {
    const res = await adminAuthService.updateProfile(formDataOrObject);
    const updatedUser = res.data;

    setUser(updatedUser);
    localStorage.setItem('pcs_admin_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  /**
   * Change Password
   */
  const changePassword = async (currentPassword, newPassword) => {
    return await adminAuthService.changePassword(currentPassword, newPassword);
  };

  /**
   * Logout handler
   */
  const logout = () => {
    clearAdminAuth();
    setUser(null);
    setToken('');
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    updateProfile,
    changePassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
