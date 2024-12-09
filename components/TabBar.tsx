import Home from "@/assets/images/icon/tab/home.svg";
import MyPage from "@/assets/images/icon/tab/mypage.svg";
import Plan from "@/assets/images/icon/tab/plan.svg";
import Prayer from "@/assets/images/icon/tab/prayer.svg";
import Question from "@/assets/images/icon/tab/question.svg";
import { moderateScale } from "@/utils/style";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { MediumText } from "./text/MediumText";

type TabBarKeys = 'index' | 'calendar' | 'plan' | 'question' | 'mypage';

const ImageSourceDict: {
  [key in TabBarKeys]: { image: (props: { color: string }) => JSX.Element; text: string };
} = {
  index: {
    image: ({ color }) => <Home width={moderateScale(24)} height={moderateScale(24)} color={color} />,
    text: '홈',
  },
  calendar: {
    image: ({ color }) => <Prayer width={moderateScale(35)} height={moderateScale(38)} color={color} />,
    text: '',
  },
  plan: {
    image: ({ color }) => <Plan width={moderateScale(24)} height={moderateScale(24)} color={color} />,
    text: '기도 플랜',
  },
  question: {
    image: ({ color }) => <Question width={moderateScale(24)} height={moderateScale(24)} color={color} />,
    text: '질문하기',
  },
  mypage: {
    image: ({ color }) => <MyPage width={moderateScale(24)} height={moderateScale(24)} color={color} />,
    text: '마이페이지',
  },
};

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { key, name } = route;
        const { options } = descriptors[key];
        const { navigate, emit } = navigation;

        const isFocused = state.index === index;

        const imageSource = ImageSourceDict[name as TabBarKeys];

        const onPress = () => {
          const event = emit({
            type: 'tabPress',
            target: key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigate(name);
          }
        }

        const onLongPress = () => {
          emit({
            type: 'tabLongPress',
            target: key,
          })
        }

        return (
          <Pressable
            style={styles.tabButton}
            onPress={onPress}
            onLongPress={onLongPress}
            key={key}
          >
            {/* ICON */}
            <View style={name === "calendar" ? styles.mainTabButtonImage : styles.tabButtonImage}>
              <imageSource.image color={isFocused ? '#FFFFFF' : '#B9B9B9'} />
            </View>
            {/* TEXT */}
            {imageSource.text && (
              <MediumText
                fontSize={10}
                color="#b9b9b9"
                style={{
                  color: isFocused ? '#FFFFFF' : '#51545D',
                  textAlign: 'center'
                }}>
                {imageSource.text}
              </MediumText>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingTop: moderateScale(6),
    paddingBottom: moderateScale(34),
    paddingHorizontal: moderateScale(30),
    backgroundColor: '#161B29'
  },
  tabButton: {
    justifyContent: 'center'
  },
  tabButtonImage: {
    marginHorizontal: 'auto'
  },
  mainTabButtonImage: {
    width: moderateScale(56),
    height: moderateScale(56),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#363E55',

    borderWidth: 1,
    borderColor: '#5E6577',
    borderRadius: 100,

    // ios shadow
    shadowColor: '#8892B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 15,

    // android shadow
    elevation: 7,
  }
})