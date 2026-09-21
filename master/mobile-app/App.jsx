import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from './src/navigation/AuthNavigator';
import ManagerNavigator from './src/navigation/ManagerNavigator';
import MemberNavigator from './src/navigation/MemberNavigator';
import { setAuthToken } from './src/services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      {!currentUser ? (
        <AuthNavigator onLoginSuccess={handleLoginSuccess} />
      ) : currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN' ? (
        <ManagerNavigator user={currentUser} onLogout={handleLogout} />
      ) : (
        <MemberNavigator user={currentUser} onLogout={handleLogout} />
      )}
    </SafeAreaProvider>
  );
}

