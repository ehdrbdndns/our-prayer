import Feather from '@expo/vector-icons/Feather';

import { BoldText } from '@/components/text/BoldText';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { useTodayKey } from '@/utils/hooks/useTodayKey';
import { useTogglePrayerTopicCheckMutation } from '@/utils/mutation';
import { usePrayerTopicCheckQuery, usePrayerTopicQuery } from '@/utils/queries';
import { PRAYER_TOPIC_PRIORITY_META, sortPrayerTopics } from '@/utils/prayerTopicStorage';
import { moderateScale } from '@/utils/style';
import { useMemo } from 'react';
import { FlatList, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

type PrayerTopicChecklistProps = {
  style?: StyleProp<ViewStyle>;
}

export default function PrayerTopicChecklist({ style }: PrayerTopicChecklistProps) {
  const todayKey = useTodayKey();

  const { data: topics = [] } = usePrayerTopicQuery();
  const { data: checkedMap = {} } = usePrayerTopicCheckQuery(todayKey);
  const { mutate: togglePrayerTopicChecked } = useTogglePrayerTopicCheckMutation();

  const sortedTopics = useMemo(() => {
    return sortPrayerTopics(topics, checkedMap);
  }, [topics, checkedMap]);

  const checkedCount = useMemo(() => {
    return sortedTopics.filter((topic) => Boolean(checkedMap[topic.prayer_topic_id])).length;
  }, [sortedTopics, checkedMap]);

  const handlePressToggleCheck = (prayer_topic_id: string) => {
    const nextChecked = !Boolean(checkedMap[prayer_topic_id]);
    togglePrayerTopicChecked({
      prayer_topic_id,
      checked: nextChecked,
      dateKey: todayKey,
    });
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <BoldText fontSize={16} lineHeight={24}>
          오늘의 기도 제목
        </BoldText>
        <MediumText fontSize={12} lineHeight={18} color="#B3B3B3">
          {sortedTopics.length === 0 ? '0/0' : `${checkedCount}/${sortedTopics.length}`}
        </MediumText>
      </View>
      <MediumText style={styles.resetHint} fontSize={11} lineHeight={16} color="#8892B8">
        체크는 매일 00시에 초기화됩니다.
      </MediumText>

      {sortedTopics.length === 0 ? (
        <View style={styles.emptyBox}>
          <RegularText fontSize={13} lineHeight={22} color="#B3B3B3">
            등록된 기도 제목이 없습니다.
          </RegularText>
        </View>
      ) : (
        <FlatList
          data={sortedTopics}
          keyExtractor={(item) => item.prayer_topic_id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const isChecked = Boolean(checkedMap[item.prayer_topic_id]);
            const priorityMeta = PRAYER_TOPIC_PRIORITY_META[item.priority];

            return (
              <TouchableOpacity
                onPress={() => handlePressToggleCheck(item.prayer_topic_id)}
                style={styles.topicCard}
                activeOpacity={0.9}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked }}
                accessibilityLabel={`기도 제목: ${item.content}`}
                accessibilityHint="두 번 탭하여 오늘 기도 여부를 변경합니다."
                testID={`prayer-topic-drawer-row-${item.prayer_topic_id}`}
              >
                <View style={styles.cardTopRow}>
                  <Feather
                    name={isChecked ? 'check-square' : 'square'}
                    size={moderateScale(18)}
                    color={isChecked ? '#4F5FFF' : '#7781A0'}
                  />
                  <View style={[styles.priorityBadge, { backgroundColor: priorityMeta.backgroundColor }]}>
                    <MediumText fontSize={10} lineHeight={14} color={priorityMeta.textColor}>
                      {priorityMeta.label}
                    </MediumText>
                  </View>
                </View>

                <RegularText
                  style={[styles.topicContent, isChecked && styles.checkedText]}
                  fontSize={13}
                  lineHeight={22}
                >
                  {item.content}
                </RegularText>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(16),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(4),
  },
  resetHint: {
    marginBottom: moderateScale(10),
    textAlign: 'right',
  },
  emptyBox: {
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(12),
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: moderateScale(24),
  },
  separator: {
    height: moderateScale(8),
  },
  topicCard: {
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: moderateScale(8),
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    borderRadius: moderateScale(100),
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(3),
  },
  topicContent: {
    color: '#FFFFFF',
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#8892B8',
  },
});
