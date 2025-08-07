
import { createContext, useContext, useState, type PropsWithChildren } from 'react';

// Modal Context
interface ModalContextType {
  isModalVisible: boolean;
  planId: string;
  thumbnail: string;
  title: string;
  isLiked: boolean;
  auditDate: number;
  showModal: ({ planId, thumbnail, title, isLiked, auditDate }: { planId: string, thumbnail: string, title: string, isLiked: boolean, auditDate: number }) => void;
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

  const showModal = ({ planId, thumbnail, title, isLiked, auditDate }: { planId: string, thumbnail: string, title: string, isLiked: boolean, auditDate: number }) => {
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
