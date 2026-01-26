import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { BoldText } from '@/components/text/BoldText';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { dismissForToday, hasDismissedToday, isValidAppNotice } from '@/utils/appNotice';
import type { AppNoticeType } from '@/utils/dataType';
import { useAppNoticeQuery } from '@/utils/queries';
import { moderateScale, scaleHeight } from '@/utils/style';

export const AppNoticeModal = () => {
  const { data: appNoticeList, isSuccess: isAppNoticeSuccess } = useAppNoticeQuery();
  const [queue, setQueue] = useState<AppNoticeType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const hasPreparedRef = useRef(false);

  useEffect(() => {
    if (!isAppNoticeSuccess || hasPreparedRef.current) return;
    hasPreparedRef.current = true;

    const prepare = async () => {
      const notices = Array.isArray(appNoticeList)
        ? appNoticeList.filter((item) => isValidAppNotice(item))
        : [];
      if (notices.length === 0) return;

      const dismissed = await hasDismissedToday();
      const filtered = dismissed ? notices.filter((item) => item.type !== 1) : notices;
      if (filtered.length === 0) return;

      setQueue(filtered);
      setCurrentIndex(0);
      setVisible(true);
    };

    prepare();
  }, [appNoticeList, isAppNoticeSuccess]);

  const closeAll = () => {
    setVisible(false);
    setQueue([]);
    setCurrentIndex(0);
  };

  const moveNext = () => {
    if (currentIndex + 1 >= queue.length) {
      closeAll();
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleConfirm = () => {
    const notice = queue[currentIndex];
    if (!notice) return;

    if (notice.type === 2 && Platform.OS === 'android') {
      BackHandler.exitApp();
      return;
    }

    moveNext();
  };

  const handleDismissToday = async () => {
    try {
      await dismissForToday();
    } catch {
      // ignore storage failure
    }

    const remaining = queue.filter((item) => item.type !== 1);
    if (remaining.length === 0) {
      closeAll();
      return;
    }
    setQueue(remaining);
    setCurrentIndex(0);
  };

  if (!visible || queue.length === 0) return null;

  const notice = queue[currentIndex];
  if (!notice) return null;

  const total = queue.length;
  const pageText = `${currentIndex + 1} / ${total}`;
  const isBlockingNotice = notice.type === 2;
  const isAndroid = Platform.OS === 'android';

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={() => null}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <BoldText fontSize={18} lineHeight={26} color="#FFFFFF">
              {notice.title}
            </BoldText>
          </View>
          <View style={styles.body}>
            <RegularText fontSize={14} lineHeight={22} color="#B3B3B3">
              {notice.body}
            </RegularText>
          </View>
          <View style={styles.footer}>
            {!isBlockingNotice && (
              <>
                <MediumText fontSize={12} lineHeight={18} color="#8892B8">
                  {pageText}
                </MediumText>
                <View style={styles.buttonRow}>
                  <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleDismissToday}>
                    <MediumText fontSize={13} color="#B3B3B3">
                      오늘 하루 다시 보지 않기
                    </MediumText>
                  </Pressable>
                  <Pressable style={[styles.button, styles.primaryButton]} onPress={handleConfirm}>
                    <MediumText fontSize={14} color="#FFFFFF">
                      확인
                    </MediumText>
                  </Pressable>
                </View>
              </>
            )}
            {isBlockingNotice && isAndroid && (
              <View style={styles.buttonRow}>
                <Pressable style={[styles.button, styles.primaryButton]} onPress={handleConfirm}>
                  <MediumText fontSize={14} color="#FFFFFF">
                    종료
                  </MediumText>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 26, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  },
  card: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#0F141A',
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(18),
    paddingBottom: moderateScale(14),
  },
  header: {
    marginBottom: moderateScale(10),
  },
  body: {
    minHeight: scaleHeight(80),
  },
  footer: {
    marginTop: moderateScale(14),
    gap: moderateScale(10),
  },
  buttonRow: {
    width: '100%',
    gap: moderateScale(8),
  },
  button: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: moderateScale(9),
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4F5FFF',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});
