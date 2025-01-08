import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { useStorageState } from './storage/useStorageState';
import api from './utils/axios';

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
          const res = await api.post<SessionType>('/user/auth', { userType: 'local' });

          if (res.status !== 200) {
            throw new Error('계정 생성에 실패했습니다.');
          }

          const { accessToken, refreshToken, name } = res.data;

          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshToken);
          setSession(name);
        },
        signOut: async () => {
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
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

// Modal Context
interface ModalContextType {
  isModalVisible: boolean;
  planId: string;
  auditDate: number;
  showModal: ({ planId, auditDate }: { planId: string, auditDate: number }) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isModalVisible: false,
  planId: '',
  auditDate: 0,
  showModal: () => { },
  hideModal: () => { },
});

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [planId, setPlanId] = useState('');
  const [auditDate, setAuditDate] = useState(0);

  const showModal = ({ planId, auditDate }: { planId: string, auditDate: number }) => {
    setPlanId(planId);
    setAuditDate(auditDate);
    setModalVisible(true)
  };
  const hideModal = () => {
    setPlanId('');
    setModalVisible(false)
  }

  return (
    <ModalContext.Provider value={{ isModalVisible, planId, auditDate, showModal, hideModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);