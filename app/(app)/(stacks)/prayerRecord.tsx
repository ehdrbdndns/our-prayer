import CustomButton from "@/components/button/CustomButton";
import PrimaryButton from "@/components/button/PrimaryButton";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { useSession } from '@/contexts/AuthContext';
import { ASYNC_LECTURE_HISTORY } from '@/storage/asyncStorageKeys';
import { useHistoryMutation, useUpdateHistoryMutation } from "@/utils/mutation";
import { scheduleStreakReminderForTomorrow } from '@/utils/notification';
import { moderateScale } from "@/utils/style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppContext } from '@/contexts/AppContext';

export default function PrayerRecord() {

  const { setShouldRequestReview } = useAppContext();
  const { session } = useSession();

  const {
    lecture_id, duration
  } = useLocalSearchParams<{
    lecture_id: string,
    duration: string
  }>();

  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(true);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const textInputRef = useRef<TextInput>(null); // TextInput의 참조 생성
  const hasCreatedRef = useRef(false);

  const { mutateAsync: insertPrayerHistory } = useHistoryMutation()
  const { mutateAsync: updatePrayerHistory } = useUpdateHistoryMutation({
    params: {
      history_id: historyId ?? '',
      note: note,
    },
    onSuccess: () => null,
    onError: () => null,
  });

  useEffect(() => {
    if (hasCreatedRef.current) {
      return;
    }
    hasCreatedRef.current = true;

    const createHistory = async () => {
      setIsCreating(true);

      try {
        const res = await insertPrayerHistory({ lecture_id, duration, note: '' });
        const { prayer_history_id } = res as { prayer_history_id?: string };
        if (!prayer_history_id) {
          throw new Error('Missing prayer_history_id');
        }
        setHistoryId(prayer_history_id);

        const lectureHistory = await AsyncStorage.getItem(ASYNC_LECTURE_HISTORY);
        const lectureHistoryData = lectureHistory ? JSON.parse(lectureHistory) : {};
        lectureHistoryData[lecture_id] = lectureHistoryData[lecture_id] ? lectureHistoryData[lecture_id] + 1 : 1;
        await AsyncStorage.setItem(ASYNC_LECTURE_HISTORY, JSON.stringify(lectureHistoryData));

        if (session) {
          const { alarm } = JSON.parse(session);
          if (alarm) {
            await scheduleStreakReminderForTomorrow();
          }
        }
      } catch (e) {
        Alert.alert('오류', '기록 저장에 실패했습니다.');
        router.dismissTo('/');
      } finally {
        setIsCreating(false);
      }
    };

    createHistory();
  }, [duration, insertPrayerHistory, lecture_id, session]);

  const submitPrayerRecord = async (noteContent: string) => {
    if (isSaving || isCreating) return;
    if (!historyId) {
      Alert.alert('오류', '기록 저장에 실패했습니다.');
      return;
    }

    setIsSaving(true);

    try {
      await updatePrayerHistory();
      setIsSaving(false);

      // Set the flag to request a review
      setShouldRequestReview(true);

      router.dismissTo({
        pathname: `/calendar`,
        params: {
          backToLink: '/',
        }
      });
    } catch (e) {
      Alert.alert('오류', '기록 저장에 실패했습니다.');

      setIsSaving(false);

      router.dismissTo('/');
    }
  }

  const handlePressSave = async () => {
    await submitPrayerRecord(note);
  }

  const handlePressCancel = async () => {
    await submitPrayerRecord("");
  }

  const handleChangeNote = (text: string) => {
    setNote(text);
  }

  return (
    <>
      <View
        style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 20, 26, 0.4)' }}
      />
      <TouchableWithoutFeedback
        onPress={() => {
          if (!textInputRef.current) return;

          if (Keyboard.isVisible()) {
            textInputRef.current.blur();
          } else {
            textInputRef.current.focus();
          }
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <Header
              style={styles.header}
              prefix={<View></View>}
            />
            <BoldText
              style={styles.title}
              fontSize={24}
              lineHeight={36}
            >
              {"떠오르는 생각들을 기록하며\n기도를 마무리해보세요"}
            </BoldText>

            <View style={styles.textInput}>
              <TextInput
                testID="prayer-record-input"
                ref={textInputRef}
                value={note}
                multiline
                style={styles.text}
                onChange={e => handleChangeNote(e.nativeEvent.text)}
                placeholderTextColor={"#B3B3B3"}
                placeholder="여기를 탭하여 입력하세요(최대 1500자)"
                maxLength={1500}
              />
            </View>
            <View
              style={{
                paddingHorizontal: moderateScale(24),
                marginBottom: Platform.OS === 'ios' ? 0 : moderateScale(24),
              }}
            >
              <View style={styles.buttonList}>
                <CustomButton onPress={handlePressCancel} style={[styles.button, styles.secondaryButton]}>
                  <MediumText
                    fontSize={14}
                  >
                    괜찮습니다
                  </MediumText>
                </CustomButton>
                <PrimaryButton testID="prayer-record-save" onPress={handlePressSave} style={styles.button}>
                  <MediumText
                    fontSize={14}
                  >
                    저장하기
                  </MediumText>
                </PrimaryButton>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    marginBottom: moderateScale(20)
  },
  title: {
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(44)
  },
  textInput: {
    paddingHorizontal: moderateScale(24),
    flex: 1,
    marginBottom: moderateScale(24),
  },
  text: {
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: moderateScale(16),
    lineHeight: moderateScale(28),
    maxHeight: '100%',
    color: "#FFFFFF",
    textAlignVertical: 'top',
    flex: 1,
  },
  buttonList: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  button: {
    flex: 1,
    paddingVertical: moderateScale(12),
  },
  secondaryButton: {
    backgroundColor: 'rgba(15, 20, 26, 0.4)',
  }
})
