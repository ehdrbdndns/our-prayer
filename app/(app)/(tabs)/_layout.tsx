import Feather from '@expo/vector-icons/Feather';

import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs
      labelVisibilityMode="labeled"
      iconColor={{ default: 'default', selected: "#4F5FFF" }}
      backgroundColor="#161B29"
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index">
        <Icon src={<VectorIcon family={Feather} name="home" />} />
        <Label>홈</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plan">
        <Icon src={<VectorIcon family={Feather} name="book-open" />} />
        <Label>기도 플랜</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="prayer-topic">
        <Icon src={<VectorIcon family={Feather} name="check-square" />} />
        <Label>기도 제목</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="mypage">
        <Icon src={<VectorIcon family={Feather} name="settings" />} />
        <Label>설정</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
