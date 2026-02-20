import Feather from '@expo/vector-icons/Feather';

import PrimaryButton from '@/components/button/PrimaryButton';
import ScreenLayout from '@/components/ScreenLayout';
import { BoldText } from '@/components/text/BoldText';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { useCreatePrayerTopicMutation, useDeletePrayerTopicMutation, useRestorePrayerTopicMutation, useTogglePrayerTopicCheckMutation, useUpdatePrayerTopicMutation } from '@/utils/mutation';
import { PrayerTopicPriority, PrayerTopicType } from '@/utils/dataType';
import { usePrayerTopicCheckQuery, usePrayerTopicQuery } from '@/utils/queries';
import { useTodayKey } from '@/utils/hooks/useTodayKey';
import { PRAYER_TOPIC_PRIORITY_META, sortPrayerTopics } from '@/utils/prayerTopicStorage';
import { moderateScale } from '@/utils/style';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, InputAccessoryView, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const MAX_PRAYER_TOPIC_LENGTH = 120;
const UNDO_DURATION_MS = 4000;
const PRIORITY_OPTIONS: PrayerTopicPriority[] = ['high', 'medium', 'low'];
const PRAYER_TOPIC_INPUT_ACCESSORY_ID = 'prayer-topic-input-accessory';
const UNDO_BAR_TAB_OFFSET = Platform.OS === 'ios' ? 72 : 114;

type DeletedTopicState = {
  topic: PrayerTopicType;
  wasChecked: boolean;
}

const validatePrayerTopicContent = (content: string) => {
  const normalized = content.replace(/\r\n/g, '\n');
  const trimmed = normalized.trim();

  if (!trimmed) {
    return {
      isValid: false,
      message: '기도 제목을 입력해주세요.',
      value: '',
    };
  }

  if (normalized.length > MAX_PRAYER_TOPIC_LENGTH) {
    return {
      isValid: false,
      message: `기도 제목은 최대 ${MAX_PRAYER_TOPIC_LENGTH}자까지 입력 가능합니다.`,
      value: '',
    };
  }

  return {
    isValid: true,
    message: '',
    value: normalized,
  };
}

export default function PrayerTopicPage() {
  const todayKey = useTodayKey();
  const insets = useSafeAreaInsets();

  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<PrayerTopicPriority>('medium');
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingPriority, setEditingPriority] = useState<PrayerTopicPriority>('medium');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [deletedTopic, setDeletedTopic] = useState<DeletedTopicState | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: topics = [] } = usePrayerTopicQuery();
  const { data: checkedMap = {} } = usePrayerTopicCheckQuery(todayKey);

  const { mutate: createPrayerTopic, isPending: isCreating } = useCreatePrayerTopicMutation();
  const { mutate: updatePrayerTopic, isPending: isUpdating } = useUpdatePrayerTopicMutation();
  const { mutate: deletePrayerTopic } = useDeletePrayerTopicMutation();
  const { mutate: restorePrayerTopic, isPending: isRestoring } = useRestorePrayerTopicMutation();
  const { mutate: togglePrayerTopicChecked } = useTogglePrayerTopicCheckMutation();

  const sortedTopics = useMemo(() => {
    return sortPrayerTopics(topics, checkedMap);
  }, [topics, checkedMap]);

  const checkedCount = useMemo(() => {
    return sortedTopics.filter((topic) => Boolean(checkedMap[topic.prayer_topic_id])).length;
  }, [sortedTopics, checkedMap]);

  const clearUndoTimer = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }

  const scheduleUndoDismiss = () => {
    clearUndoTimer();
    undoTimerRef.current = setTimeout(() => {
      setDeletedTopic(null);
    }, UNDO_DURATION_MS);
  }

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      clearUndoTimer();
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const resetEditor = () => {
    setEditingTopicId(null);
    setEditingContent('');
    setEditingPriority('medium');
  }

  const handlePressAdd = () => {
    const validated = validatePrayerTopicContent(content);
    if (!validated.isValid) {
      Alert.alert(validated.message);
      return;
    }

    createPrayerTopic(
      {
        content: validated.value,
        priority,
      },
      {
        onSuccess: () => {
          setContent('');
          setPriority('medium');
          setCreateModalVisible(false);
        },
        onError: () => {
          Alert.alert('오류', '기도 제목을 추가하지 못했습니다.');
        },
      }
    );
  }

  const handlePressStartEdit = (topic: PrayerTopicType) => {
    setEditingTopicId(topic.prayer_topic_id);
    setEditingContent(topic.content);
    setEditingPriority(topic.priority);
  }

  const handlePressSaveEdit = () => {
    if (!editingTopicId) {
      return;
    }

    const validated = validatePrayerTopicContent(editingContent);
    if (!validated.isValid) {
      Alert.alert(validated.message);
      return;
    }

    updatePrayerTopic(
      {
        prayer_topic_id: editingTopicId,
        content: validated.value,
        priority: editingPriority,
      },
      {
        onSuccess: () => {
          resetEditor();
        },
        onError: () => {
          Alert.alert('오류', '기도 제목을 수정하지 못했습니다.');
        },
      }
    );
  }

  const handlePressDelete = (prayer_topic_id: string) => {
    Alert.alert('삭제', '삭제된 기도 제목은 복구할 수 없습니다.', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: () => {
          const topic = topics.find((item) => item.prayer_topic_id === prayer_topic_id);
          const wasChecked = Boolean(checkedMap[prayer_topic_id]);

          deletePrayerTopic(prayer_topic_id, {
            onSuccess: () => {
              if (!topic) {
                return;
              }

              setDeletedTopic({ topic, wasChecked });
              scheduleUndoDismiss();
            },
            onError: () => {
              Alert.alert('오류', '기도 제목을 삭제하지 못했습니다.');
            },
          });
        },
      },
    ]);
  }

  const handlePressUndoDelete = () => {
    if (!deletedTopic) {
      return;
    }

    clearUndoTimer();
    restorePrayerTopic(
      {
        topic: deletedTopic.topic,
        checked: deletedTopic.wasChecked,
        dateKey: todayKey,
      },
      {
        onSuccess: () => {
          setDeletedTopic(null);
        },
        onError: () => {
          Alert.alert('오류', '삭제 취소에 실패했습니다.');
        },
      }
    );
  }

  const handlePressToggleCheck = (prayer_topic_id: string) => {
    const nextChecked = !Boolean(checkedMap[prayer_topic_id]);
    togglePrayerTopicChecked({
      prayer_topic_id,
      checked: nextChecked,
      dateKey: todayKey,
    });
  }

  const handlePressOpenCreateModal = () => {
    setContent('');
    setPriority('medium');
    setCreateModalVisible(true);
  }

  const handlePressCloseCreateModal = () => {
    setCreateModalVisible(false);
  }

  const handlePressCreateModalBackdrop = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
      return;
    }

    handlePressCloseCreateModal();
  }

  const renderPrioritySelector = ({
    selectedPriority,
    onSelect,
  }: {
    selectedPriority: PrayerTopicPriority;
    onSelect: (nextPriority: PrayerTopicPriority) => void;
  }) => {
    return (
      <View style={styles.priorityList}>
        {PRIORITY_OPTIONS.map((item) => {
          const meta = PRAYER_TOPIC_PRIORITY_META[item];
          const isSelected = selectedPriority === item;

          return (
            <TouchableOpacity
              key={item}
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`집중도 ${meta.label}`}
              accessibilityHint="두 번 탭하여 집중도를 선택합니다."
              style={[
                styles.priorityChip,
                {
                  backgroundColor: isSelected ? meta.backgroundColor : 'rgba(255, 255, 255, 0.04)',
                  borderColor: isSelected ? meta.textColor : 'rgba(255, 255, 255, 0.06)',
                },
              ]}
            >
              <MediumText
                fontSize={12}
                lineHeight={18}
                color={isSelected ? meta.textColor : '#B3B3B3'}
              >
                {meta.label}
              </MediumText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  const renderTopicItem = (topic: PrayerTopicType, isChecked: boolean) => {
    if (editingTopicId === topic.prayer_topic_id) {
      return (
        <View style={styles.topicCard}>
          <TextInput
            value={editingContent}
            onChangeText={setEditingContent}
            placeholder="기도 제목을 입력해주세요."
            placeholderTextColor="#7781A0"
            maxLength={MAX_PRAYER_TOPIC_LENGTH}
            style={styles.editingInput}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            inputAccessoryViewID={Platform.OS === 'ios' ? PRAYER_TOPIC_INPUT_ACCESSORY_ID : undefined}
          />

          <MediumText style={styles.selectorLabel} fontSize={12} lineHeight={18} color="#B3B3B3">
            집중도
          </MediumText>
          {renderPrioritySelector({
            selectedPriority: editingPriority,
            onSelect: setEditingPriority,
          })}

          <View style={styles.editActionRow}>
            <TouchableOpacity onPress={resetEditor} style={styles.secondaryActionButton}>
              <MediumText fontSize={13} color="#B3B3B3">취소</MediumText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePressSaveEdit}
              style={styles.primaryActionButton}
              disabled={isUpdating}
            >
              <MediumText fontSize={13} color="#FFFFFF">저장</MediumText>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const priorityMeta = PRAYER_TOPIC_PRIORITY_META[topic.priority];

    return (
      <Pressable
        style={styles.topicCard}
        onPress={() => handlePressToggleCheck(topic.prayer_topic_id)}
        testID={`prayer-topic-check-${topic.prayer_topic_id}`}
        accessible
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
        accessibilityLabel={`기도 제목: ${topic.content}`}
        accessibilityHint="두 번 탭하여 오늘 기도 여부를 변경합니다."
      >
        <View style={styles.topicRow}>
          <View style={styles.checkButton}>
            <Feather
              name={isChecked ? 'check-square' : 'square'}
              size={moderateScale(20)}
              color={isChecked ? '#4F5FFF' : '#7781A0'}
            />
          </View>

          <View style={styles.topicContentContainer}>
            <RegularText
              style={[styles.topicText, isChecked && styles.checkedTopicText]}
              fontSize={15}
              lineHeight={24}
            >
              {topic.content}
            </RegularText>

            <View style={styles.topicMetaRow}>
              <View style={[styles.badge, { backgroundColor: priorityMeta.backgroundColor }]}>
                <MediumText fontSize={11} lineHeight={16} color={priorityMeta.textColor}>
                  {priorityMeta.label}
                </MediumText>
              </View>

              <View style={styles.rowActionList}>
                <TouchableOpacity
                  onPress={(event) => {
                    event.stopPropagation();
                    handlePressStartEdit(topic);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`기도 제목 수정: ${topic.content}`}
                  accessibilityHint="두 번 탭하여 기도 제목 편집을 시작합니다."
                  hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                  testID={`prayer-topic-edit-${topic.prayer_topic_id}`}
                >
                  <Feather name="edit-2" size={moderateScale(16)} color="#B3B3B3" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={(event) => {
                    event.stopPropagation();
                    handlePressDelete(topic.prayer_topic_id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`기도 제목 삭제: ${topic.content}`}
                  accessibilityHint="두 번 탭하면 삭제 확인 창이 열립니다."
                  hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                  testID={`prayer-topic-delete-${topic.prayer_topic_id}`}
                >
                  <Feather name="trash-2" size={moderateScale(16)} color="#B3B3B3" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={sortedTopics}
          keyExtractor={(item) => item.prayer_topic_id}
          renderItem={({ item }) => renderTopicItem(item, Boolean(checkedMap[item.prayer_topic_id]))}
          ItemSeparatorComponent={() => <View style={styles.topicSeparator} />}
          ListHeaderComponent={(
            <View>
              <BoldText style={styles.title} fontSize={24} lineHeight={36}>
                기도 제목을 관리해보세요
              </BoldText>
              <RegularText style={styles.desc} fontSize={14} lineHeight={24} color="#B3B3B3">
                오늘 기도할 내용을 정리하고, 기도 중에 체크하며 놓친 기도 제목이 없는지 확인할 수 있어요.
              </RegularText>

              <View style={styles.composerSection}>
                <TouchableOpacity
                  style={styles.openComposerButton}
                  onPress={handlePressOpenCreateModal}
                  accessibilityRole="button"
                  accessibilityLabel="새 기도 제목 추가"
                  accessibilityHint="두 번 탭하면 기도 제목 추가 모달이 열립니다."
                  testID="prayer-topic-open-add-modal"
                >
                  <View style={styles.openComposerIcon}>
                    <Feather name="plus" size={moderateScale(14)} color="#959FFF" />
                  </View>
                  <BoldText fontSize={15} lineHeight={22}>
                    새 기도 제목 추가
                  </BoldText>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <BoldText fontSize={16} lineHeight={24}>기도 제목</BoldText>
                  <MediumText fontSize={12} lineHeight={18} color="#B3B3B3">
                    {sortedTopics.length === 0 ? '전체 0개 / 완료 0개' : `전체 ${sortedTopics.length}개 / 완료 ${checkedCount}개`}
                  </MediumText>
                </View>
                <MediumText style={styles.resetHint} fontSize={12} lineHeight={18} color="#8892B8">
                  체크 상태는 매일 00시에 초기화됩니다.
                </MediumText>
              </View>
            </View>
          )}
          ListEmptyComponent={(
            <View style={styles.emptyCard}>
              <RegularText fontSize={14} lineHeight={24} color="#B3B3B3">
                아직 기도 제목이 없습니다.
              </RegularText>
            </View>
          )}
          ListFooterComponent={<View style={styles.bottomSpacer} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />

        <Modal
          transparent
          animationType="fade"
          visible={isCreateModalVisible}
          onRequestClose={handlePressCloseCreateModal}
        >
          <View style={styles.modalBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={handlePressCreateModalBackdrop} />

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'android' ? moderateScale(8) : 0}
              style={[
                styles.modalKeyboardContainer,
                Platform.OS === 'android' && isKeyboardVisible && styles.modalKeyboardContainerKeyboardVisible,
              ]}
            >
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <BoldText fontSize={16} lineHeight={24}>
                    새 기도 제목 추가
                  </BoldText>
                  <TouchableOpacity
                    onPress={handlePressCloseCreateModal}
                    accessibilityRole="button"
                    accessibilityLabel="기도 제목 추가 모달 닫기"
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Feather name="x" size={moderateScale(18)} color="#B3B3B3" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="새로운 기도 제목을 입력하세요."
                  placeholderTextColor="#7781A0"
                  maxLength={MAX_PRAYER_TOPIC_LENGTH}
                  style={styles.input}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  inputAccessoryViewID={Platform.OS === 'ios' ? PRAYER_TOPIC_INPUT_ACCESSORY_ID : undefined}
                />

                <MediumText style={styles.selectorLabel} fontSize={12} lineHeight={18} color="#B3B3B3">
                  집중도
                </MediumText>
                {renderPrioritySelector({
                  selectedPriority: priority,
                  onSelect: setPriority,
                })}

                <View style={styles.createActionRow}>
                  <PrimaryButton
                    onPress={handlePressAdd}
                    style={styles.modalAddButton}
                    disabled={isCreating}
                    testID="prayer-topic-add"
                  >
                    <MediumText fontSize={14} lineHeight={22}>
                      추가하기
                    </MediumText>
                  </PrimaryButton>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {deletedTopic && (
          <View style={[styles.undoBar, { bottom: insets.bottom + moderateScale(UNDO_BAR_TAB_OFFSET) }]}>
            <RegularText
              style={styles.undoMessage}
              fontSize={13}
              lineHeight={20}
              color="#FFFFFF"
              numberOfLines={1}
            >
              기도 제목을 삭제했습니다.
            </RegularText>
            <TouchableOpacity
              onPress={handlePressUndoDelete}
              disabled={isRestoring}
              style={styles.undoButton}
              accessibilityRole="button"
              accessibilityLabel="삭제 취소"
              accessibilityHint="두 번 탭하여 삭제한 기도 제목을 복구합니다."
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color="#4F5FFF" />
              ) : (
                <MediumText fontSize={13} lineHeight={20} color="#4F5FFF">
                  되돌리기
                </MediumText>
              )}
            </TouchableOpacity>
          </View>
        )}

        {Platform.OS === 'ios' && (
          <InputAccessoryView nativeID={PRAYER_TOPIC_INPUT_ACCESSORY_ID}>
            <View style={styles.inputAccessoryBar}>
              <TouchableOpacity
                onPress={Keyboard.dismiss}
                accessibilityRole="button"
                accessibilityLabel="키보드 내리기"
              >
                <MediumText fontSize={14} lineHeight={20} color="#4F5FFF">
                  완료
                </MediumText>
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        )}
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(120),
  },
  title: {
    marginTop: moderateScale(40),
    marginBottom: moderateScale(12),
  },
  desc: {
    marginBottom: moderateScale(16),
  },
  composerSection: {
    marginBottom: moderateScale(20),
  },
  openComposerButton: {
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  openComposerIcon: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79, 95, 255, 0.16)',
  },
  resetHint: {
    marginBottom: moderateScale(2),
    alignSelf: 'stretch',
    textAlign: 'right',
  },
  selectorLabel: {
    marginBottom: moderateScale(2),
  },
  input: {
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    color: '#FFFFFF',
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    backgroundColor: 'rgba(15, 20, 26, 0.44)',
    minHeight: moderateScale(92),
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
  },
  modalKeyboardContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  modalKeyboardContainerKeyboardVisible: {
    justifyContent: 'flex-end',
    paddingBottom: moderateScale(12),
  },
  modalCard: {
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#1F1F1F',
    padding: moderateScale(14),
    gap: moderateScale(12),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createActionRow: {
    marginTop: moderateScale(2),
    width: '100%',
  },
  modalAddButton: {
    width: '100%',
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(10),
  },
  sectionContainer: {
    marginBottom: moderateScale(10),
    gap: moderateScale(6),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyCard: {
    borderRadius: moderateScale(10),
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
  },
  topicCard: {
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  topicSeparator: {
    height: moderateScale(8),
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(10),
  },
  checkButton: {
    paddingTop: moderateScale(2),
  },
  topicContentContainer: {
    flex: 1,
    gap: moderateScale(10),
  },
  topicText: {
    flex: 1,
  },
  checkedTopicText: {
    textDecorationLine: 'line-through',
    color: '#8892B8',
  },
  topicMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(10),
  },
  badge: {
    borderRadius: moderateScale(100),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
  },
  rowActionList: {
    flexDirection: 'row',
    gap: moderateScale(14),
    alignItems: 'center',
  },
  priorityList: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  priorityChip: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(100),
    borderWidth: 1,
  },
  editingInput: {
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    color: '#FFFFFF',
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    backgroundColor: 'rgba(15, 20, 26, 0.44)',
    minHeight: moderateScale(92),
    marginBottom: moderateScale(12),
  },
  editActionRow: {
    marginTop: moderateScale(12),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: moderateScale(10),
    paddingVertical: moderateScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: moderateScale(10),
    paddingVertical: moderateScale(10),
    backgroundColor: '#4F5FFF',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: moderateScale(8),
  },
  undoBar: {
    position: 'absolute',
    left: moderateScale(24),
    right: moderateScale(24),
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    backgroundColor: 'rgba(22, 27, 41, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(10),
  },
  undoMessage: {
    flex: 1,
  },
  undoButton: {
    minWidth: moderateScale(70),
    paddingVertical: moderateScale(6),
    alignItems: 'flex-end',
  },
  inputAccessoryBar: {
    width: '100%',
    backgroundColor: '#1F1F1F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    alignItems: 'flex-end',
  },
});
