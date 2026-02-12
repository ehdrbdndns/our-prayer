/**
 * 테스트 설계:
 * 1) free 플랜은 다운로드 상태와 무관하게 freePrayerSetup으로 라우팅되는지 검증한다.
 * 2) non-free 플랜이 미다운로드 상태면 다운로드 Alert 및 showModal 트리거가 동작하는지 검증한다.
 * 3) non-free 플랜이 다운로드 완료 상태면 planDetail로 라우팅되는지 검증한다.
 */
import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import PlanCard from "@/components/PlanCard";
import { useModal } from "@/contexts/ModalContext";
import { PlanType } from "@/utils/dataType";

jest.mock("expo-router", () => ({
  router: {
    navigate: jest.fn(),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
}));

jest.mock("@/contexts/ModalContext", () => ({
  useModal: jest.fn(),
}));

jest.mock("expo-image", () => ({
  ImageBackground: ({ children }: { children: React.ReactNode }) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, null, children);
  },
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children?: React.ReactNode }) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, null, children);
  },
}));

jest.mock("@/assets/images/icon/download.svg", () => {
  return function DownloadIcon() {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, { testID: "download-icon" });
  };
});

const mockUseModal = useModal as jest.MockedFunction<typeof useModal>;

const createPlan = (overrides: Partial<PlanType>): PlanType => ({
  plan_id: "plan-1",
  title: "테스트 플랜",
  description: "테스트 설명",
  author_name: "author",
  author_description: "desc",
  author_profile: "",
  author_deeplink: "",
  is_active: true,
  thumbnail: "thumb",
  s_thumbnail: "small-thumb",
  updated_date: 0,
  created_date: 0,
  type: "topic",
  is_liked: false,
  plan_like_id: "",
  audit_updated_date: 100,
  ...overrides,
});

describe("PlanCard", () => {
  const showModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModal.mockReturnValue({
      isModalVisible: false,
      planId: "",
      thumbnail: "",
      title: "",
      isLiked: false,
      auditDate: 0,
      showModal,
      hideModal: jest.fn(),
    });
  });

  it("routes free plan to freePrayerSetup without download", () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const freePlan = createPlan({ type: "free", plan_id: "free-plan", title: "자유기도 플랜" });

    const { getByText } = render(<PlanCard plan={freePlan} refreshing={false} />);

    fireEvent.press(getByText("자유기도 플랜"));

    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/freePrayerSetup",
      params: {
        plan_id: "free-plan",
        title: "자유기도 플랜",
        banner: "thumb",
        description: "테스트 설명",
        backToLink: "/plan",
      },
    });
    expect(showModal).not.toHaveBeenCalled();
  });

  it("shows download alert and opens modal for non-free undownloaded plan", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const topicPlan = createPlan({ type: "topic", title: "주제별 플랜" });
    const { getByText } = render(<PlanCard plan={topicPlan} refreshing={false} />);

    fireEvent.press(getByText("주제별 플랜"));

    expect(alertSpy).toHaveBeenCalled();
    const alertButtons = (alertSpy.mock.calls[0]?.[2] || []) as Array<{ text: string; onPress?: () => void }>;
    const downloadButton = alertButtons.find((button) => button.text === "다운로드");

    expect(downloadButton).toBeDefined();
    act(() => {
      downloadButton?.onPress?.();
    });

    expect(showModal).toHaveBeenCalledWith({
      planId: "plan-1",
      auditDate: 100,
      thumbnail: "thumb",
      title: "주제별 플랜",
      isLiked: false,
    });

    alertSpy.mockRestore();
  });

  it("routes non-free downloaded plan to planDetail", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ audit_updated_date: 100 }));

    const topicPlan = createPlan({ type: "topic", title: "다운로드된 플랜" });
    const { getByText, queryByTestId } = render(<PlanCard plan={topicPlan} refreshing={false} />);

    await waitFor(() => {
      expect(queryByTestId("download-icon")).toBeNull();
    });

    fireEvent.press(getByText("다운로드된 플랜"));

    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/planDetail/[plan_id]",
      params: {
        plan_id: "plan-1",
        title: "기도 플랜",
        banner: "thumb",
        isLiked: "",
        backToLink: "/plan",
      },
    });
  });
});
