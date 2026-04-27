import { useCallback, useMemo, useState } from 'react';

const readSession = () => {
  const storedUserData = localStorage.getItem('userData');

  return {
    token: localStorage.getItem('token'),
    userEmail: localStorage.getItem('userEmail'),
    userType: localStorage.getItem('userType'),
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    userName: localStorage.getItem('userName'),
    userData: storedUserData ? JSON.parse(storedUserData) : null,
  };
};

export const useAuthSession = () => {
  const [session, setSessionState] = useState(readSession);

  const syncSession = useCallback(() => {
    setSessionState(readSession());
  }, []);

  const setSession = useCallback(
    ({ token, userEmail, userType, userData, userName, rememberMe = false }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userType', userType);
      localStorage.setItem('userName', userName || userEmail.split('@')[0]);
      localStorage.setItem('userData', JSON.stringify(userData || {}));

      if (rememberMe) {
        localStorage.setItem('savedEmail', userEmail);
      } else {
        localStorage.removeItem('savedEmail');
      }

      syncSession();
    },
    [syncSession]
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    localStorage.removeItem('userName');
    syncSession();
  }, [syncSession]);

  const isAuthenticated = useMemo(() => !!session.token && session.isLoggedIn, [session]);

  const hasRole = useCallback(
    (role) => session.userType === role,
    [session.userType]
  );

  return {
    session,
    isAuthenticated,
    hasRole,
    setSession,
    clearSession,
    syncSession,
  };
};