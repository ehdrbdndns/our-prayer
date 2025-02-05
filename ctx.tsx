import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { useStorageState } from './storage/useStorageState';
import api from './utils/axios';
import { registerForPushNotificationsAsync } from './utils/notification';

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

// Modal Context
interface ModalContextType {
  isModalVisible: boolean;
  planId: string;
  thumbnail: string;
  title: string;
  isLiked: boolean;
  auditDate: number;
  showModal: ({
    planId, thumbnail, title, isLiked, auditDate
  }: {
    planId: string, thumbnail: string, title: string, isLiked: boolean, auditDate: number
  }) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isModalVisible: false,
  planId: '',
  thumbnail: '',
  title: '',
  isLiked: false,
  auditDate: 0,
  showModal: () => { },
  hideModal: () => { },
});

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [planId, setPlanId] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [title, setTitle] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [auditDate, setAuditDate] = useState(0);

  const showModal = ({
    planId, thumbnail, title, isLiked, auditDate
  }: {
    planId: string, thumbnail: string, title: string, isLiked: boolean, auditDate: number
  }) => {
    setPlanId(planId);
    setAuditDate(auditDate);
    setThumbnail(thumbnail);
    setTitle(title);
    setIsLiked(isLiked);
    setModalVisible(true)
  };
  const hideModal = () => {
    setPlanId('');
    setModalVisible(false)
  }

  return (
    <ModalContext.Provider value={{ isModalVisible, planId, title, thumbnail, isLiked, auditDate, showModal, hideModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);