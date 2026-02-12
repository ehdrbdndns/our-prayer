import { moderateScale } from "@/utils/style";
import { clampMinute, minuteToOffset, offsetToMinute } from "@/utils/timerPicker";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from "react-native";
import { MediumText } from "./text/MediumText";

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 300;
const ITEM_HEIGHT = moderateScale(44);
const VISIBLE_ITEM_COUNT = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEM_COUNT;
const SIDE_PADDING = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;

type TimerPickerProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (minute: number) => void;
};

export default function TimerPicker({
  value,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  onChange,
}: TimerPickerProps) {
  const safeMin = Math.max(1, Math.floor(min));
  const safeMax = Math.max(safeMin, Math.floor(max));
  const clampedValue = clampMinute(value, safeMin, safeMax);
  const [previewMinute, setPreviewMinute] = useState(clampedValue);
  const listRef = useRef<FlatList<number>>(null);
  const lastHapticMinuteRef = useRef(clampedValue);
  const pendingProgrammaticOffsetRef = useRef<number | null>(null);
  const isUserDraggingRef = useRef(false);

  const minutes = useMemo(
    () => Array.from({ length: safeMax - safeMin + 1 }, (_, i) => safeMin + i),
    [safeMin, safeMax]
  );
  const unitOffset = previewMinute >= 100 ? moderateScale(76) : previewMinute >= 10 ? moderateScale(66) : moderateScale(58);

  useEffect(() => {
    setPreviewMinute(clampedValue);
    lastHapticMinuteRef.current = clampedValue;
    pendingProgrammaticOffsetRef.current = minuteToOffset(clampedValue, safeMin, ITEM_HEIGHT);
    listRef.current?.scrollToOffset({
      offset: pendingProgrammaticOffsetRef.current,
      animated: true,
    });
  }, [clampedValue, safeMin]);

  const getMinuteByEvent = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    return offsetToMinute(event.nativeEvent.contentOffset.y, safeMin, safeMax, ITEM_HEIGHT);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const pendingOffset = pendingProgrammaticOffsetRef.current;
    if (pendingOffset !== null && Math.abs(offsetY - pendingOffset) <= 2) {
      pendingProgrammaticOffsetRef.current = null;
      return;
    }

    const nextMinute = getMinuteByEvent(event);
    if (nextMinute !== previewMinute) {
      setPreviewMinute(nextMinute);
    }

    if (isUserDraggingRef.current && lastHapticMinuteRef.current !== nextMinute) {
      lastHapticMinuteRef.current = nextMinute;
      void Haptics.selectionAsync();
    }
  };

  const handleScrollBeginDrag = () => {
    isUserDraggingRef.current = true;
    pendingProgrammaticOffsetRef.current = null;
  };

  const handleScrollEndDrag = () => {
    isUserDraggingRef.current = false;
  };

  const handleMomentumScrollEnd = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const snappedMinute = getMinuteByEvent(event);
    if (snappedMinute !== previewMinute) {
      setPreviewMinute(snappedMinute);
    }

    if (isUserDraggingRef.current && lastHapticMinuteRef.current !== snappedMinute) {
      lastHapticMinuteRef.current = snappedMinute;
      await Haptics.selectionAsync();
    }
    isUserDraggingRef.current = false;

    if (snappedMinute !== clampedValue) {
      onChange(snappedMinute);
    }
  };

  return (
    <View style={styles.wheelContainer}>
      <MediumText testID="timer-selected-minute" style={styles.testValue}>
        {previewMinute}
      </MediumText>
      <FlatList
        ref={listRef}
        testID="timer-picker-list"
        data={minutes}
        keyExtractor={(item) => String(item)}
        showsVerticalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={ITEM_HEIGHT}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={60}
        contentContainerStyle={styles.contentContainer}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item }) => {
          const isSelected = item === previewMinute;

          return (
            <View style={styles.item}>
              <MediumText
                testID={isSelected ? "timer-selected-minute" : undefined}
                fontSize={isSelected ? 28 : 18}
                lineHeight={isSelected ? 36 : 26}
                color="#FFFFFF"
                style={isSelected ? undefined : styles.unselectedText}
              >
                {item}
              </MediumText>
            </View>
          );
        }}
      />

      <View testID="timer-indicator-top" pointerEvents="none" style={styles.indicatorTopLine} />
      <View testID="timer-indicator-bottom" pointerEvents="none" style={styles.indicatorBottomLine} />
      <View pointerEvents="none" style={styles.unitContainer}>
        <MediumText
          color="#FFFFFF"
          fontSize={18}
          lineHeight={26}
          style={[styles.unitText, { marginLeft: unitOffset }]}
        >
          분
        </MediumText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: moderateScale(16),
  },
  selectedLabelRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: moderateScale(4),
  },
  minuteLabel: {
    marginBottom: moderateScale(4),
  },
  timeLabelRow: {
    marginTop: moderateScale(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(4),
  },
  wheelContainer: {
    height: PICKER_HEIGHT,
    borderRadius: moderateScale(12),
    overflow: "hidden",
  },
  contentContainer: {
    paddingVertical: SIDE_PADDING,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  unselectedText: {
    opacity: 0.25,
  },
  indicatorTopLine: {
    position: "absolute",
    left: moderateScale(12),
    right: moderateScale(12),
    top: SIDE_PADDING,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  indicatorBottomLine: {
    position: "absolute",
    left: moderateScale(12),
    right: moderateScale(12),
    top: SIDE_PADDING + ITEM_HEIGHT,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  unitContainer: {
    position: "absolute",
    top: SIDE_PADDING,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  unitText: {
    // Dynamic margin is applied inline based on selected minute digits.
  },
  testValue: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
