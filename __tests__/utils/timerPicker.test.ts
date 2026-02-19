/**
 * 테스트 설계:
 * 1) clampMinute가 경계값에서 항상 유효 범위를 보장하는지 검증한다.
 * 2) minuteToOffset / offsetToMinute 조합이 스냅 계산 기준(반올림)대로 동작하는지 검증한다.
 * 3) minuteToTimeLabel이 화면 표시 포맷("X시간 Y분")을 일관되게 생성하는지 검증한다.
 */
import { clampMinute, minuteToOffset, minuteToTimeLabel, offsetToMinute } from "@/utils/timerPicker";

describe("timerPicker utils", () => {
  it("clamps minute in range", () => {
    expect(clampMinute(0, 1, 300)).toBe(1);
    expect(clampMinute(301, 1, 300)).toBe(300);
    expect(clampMinute(42.6, 1, 300)).toBe(43);
  });

  it("converts minute and offset using nearest snap", () => {
    expect(minuteToOffset(1, 1, 44)).toBe(0);
    expect(minuteToOffset(10, 1, 44)).toBe(396);

    expect(offsetToMinute(395, 1, 300, 44)).toBe(10);
    expect(offsetToMinute(418, 1, 300, 44)).toBe(11);
    expect(offsetToMinute(99999, 1, 120, 44)).toBe(120);
  });

  it("formats duration label", () => {
    expect(minuteToTimeLabel(1)).toBe("0시간 1분");
    expect(minuteToTimeLabel(120)).toBe("2시간 0분");
    expect(minuteToTimeLabel(300)).toBe("5시간 0분");
  });
});
