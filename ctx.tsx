import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, type PropsWithChildren } from 'react';
import { useStorageState } from './storage/useStorageState';
import api from './utils/axios';
interface SessionType {
  name: string,
  accessToken: string,
  refreshToken: string
}

const AuthContext = createContext<{
  signUp: () => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signUp: () => Promise.resolve(),
  signOut: () => null,
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
          const res = await api.post<SessionType>('/user/auth', { userType: 'local' });

          if (res.status !== 200) {
            throw new Error('계정 생성에 실패했습니다.');
          }

          const { accessToken, refreshToken, name } = res.data;

          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshToken);
          setSession(name);
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
