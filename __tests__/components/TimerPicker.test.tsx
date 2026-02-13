/**
 * 테스트 설계:
 * 1) controlled value가 렌더링 텍스트와 동기화되는지 검증한다.
 * 2) 스크롤 중(onScroll) 분 값이 변경될 때마다 약한 햅틱이 울리고 onChange는 호출되지 않는지 검증한다.
 * 3) 스크롤 종료(onMomentumScrollEnd)에서만 nearest minute가 계산되어 onChange가 호출되는지 검증한다.
 * 4) 경계값(min/max) 밖 오프셋이 들어와도 clamp 적용이 유지되는지 검증한다.
 * 5) iOS 스타일 인디케이터(상/하 흰색 라인 2개)가 렌더링되는지 검증한다.
 */
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import TimerPicker from "@/components/TimerPicker";

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

describe("TimerPicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders controlled value", () => {
    const { getByTestId } = render(<TimerPicker value={15} onChange={jest.fn()} />);
    expect(getByTestId("timer-selected-minute")).toHaveTextContent("15");
  });

  it("triggers haptic on scroll value change without emitting onChange", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<TimerPicker value={1} onChange={onChange} />);
    const list = getByTestId("timer-picker-list");

    fireEvent(list, "scrollBeginDrag");
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { x: 0, y: 440 },
        contentSize: { width: 320, height: 13200 },
        layoutMeasurement: { width: 320, height: 220 },
      },
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it("does not trigger duplicate haptic for same minute", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<TimerPicker value={1} onChange={onChange} />);
    const list = getByTestId("timer-picker-list");

    fireEvent(list, "scrollBeginDrag");
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { x: 0, y: 440 },
        contentSize: { width: 320, height: 13200 },
        layoutMeasurement: { width: 320, height: 220 },
      },
    });
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { x: 0, y: 440 },
        contentSize: { width: 320, height: 13200 },
        layoutMeasurement: { width: 320, height: 220 },
      },
    });

    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it("emits onChange only when momentum scroll ends", async () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<TimerPicker value={1} onChange={onChange} />);
    const list = getByTestId("timer-picker-list");

    fireEvent(list, "scrollBeginDrag");
    await act(async () => {
      await list.props.onMomentumScrollEnd({
        nativeEvent: {
          contentOffset: { x: 0, y: 440 },
        },
      });
    });

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const emitted = onChange.mock.calls[0][0];
    expect(Number.isInteger(emitted)).toBe(true);
    expect(emitted).toBeGreaterThanOrEqual(1);
    expect(emitted).toBeLessThanOrEqual(300);
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it("emits onChange on scroll end drag when momentum does not start", async () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<TimerPicker value={1} onChange={onChange} />);
    const list = getByTestId("timer-picker-list");

    fireEvent(list, "scrollBeginDrag");
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { x: 0, y: 440 },
        contentSize: { width: 320, height: 13200 },
        layoutMeasurement: { width: 320, height: 220 },
      },
    });

    act(() => {
      list.props.onScrollEndDrag({
        nativeEvent: {
          contentOffset: { x: 0, y: 440 },
        },
      });
    });

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0];
    expect(Number.isInteger(emitted)).toBe(true);
    expect(emitted).toBeGreaterThan(1);
    expect(emitted).toBeLessThanOrEqual(300);
  });

  it("clamps to max on huge offset", async () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<TimerPicker value={1} min={1} max={120} onChange={onChange} />);
    const list = getByTestId("timer-picker-list");

    fireEvent(list, "scrollBeginDrag");
    await act(async () => {
      await list.props.onMomentumScrollEnd({
        nativeEvent: {
          contentOffset: { x: 0, y: 99999 },
        },
      });
    });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(120));
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it("syncs selected value on rerender", () => {
    const { getByTestId, rerender } = render(<TimerPicker value={30} onChange={jest.fn()} />);
    expect(getByTestId("timer-selected-minute")).toHaveTextContent("30");

    rerender(<TimerPicker value={90} onChange={jest.fn()} />);
    expect(getByTestId("timer-selected-minute")).toHaveTextContent("90");
  });

  it("renders white top/bottom indicator lines", () => {
    const { getByTestId } = render(<TimerPicker value={30} onChange={jest.fn()} />);
    expect(getByTestId("timer-indicator-top")).toBeTruthy();
    expect(getByTestId("timer-indicator-bottom")).toBeTruthy();
  });
});
