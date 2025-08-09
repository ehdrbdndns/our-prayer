
import { useStorageState } from '@/storage/useStorageState';
import api from '@/utils/axios';
import { registerForPushNotificationsAsync } from '@/utils/notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, type PropsWithChildren } from 'react';

// Session Context
interface SessionType {
  name: string,
  accessToken: string,
  refreshToken: string
}

const AuthContext = createContext<{
  signUp: () => Promise<void>;
  signOut: () => void;
  setSession: (session: string) => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signUp: () => Promise.resolve(),
  signOut: () => null,
  setSession: () => null,
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = useContext(AuthContext);

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  return (
    <AuthContext.Provider
      value={{
        signUp: async () => {
          let expoPushToken = 'not physical device';

          try {
            expoPushToken = await registerForPushNotificationsAsync();
          } catch (e) {
            console.log(e);
          }

          const res = await api.post<SessionType>('/user/auth', {
            userType: 'local',
            expoPushToken,
            alarm: expoPushToken !== ''
          });

          if (res.status !== 200) {
            throw new Error('계정 생성에 실패했습니다.');
          }

          const { accessToken, refreshToken, name } = res.data;

          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshToken);
          setSession(JSON.stringify({
            name,
            expoPushToken,
            alarm: expoPushToken !== ''
          }));
        },
        signOut: async () => {
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
          await AsyncStorage.clear();
          setSession(null);
        },
        setSession,
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
