import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

interface ScreenTransitionProps {
  isDataLoaded: boolean;
}

export const useScreenTransition = ({ isDataLoaded }: ScreenTransitionProps) => {
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isIntroAnimationDone, setIsIntroAnimationDone] = useState(false);

  const introOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(introOpacity, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setIsIntroAnimationDone(true);
    });
  }, [introOpacity]);

  useEffect(() => {
    if (isDataLoaded && isIntroAnimationDone) {
      Animated.timing(introOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setIsIntroVisible(false);
        setIsContentVisible(true);

        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isDataLoaded, isIntroAnimationDone, introOpacity, contentOpacity]);

  return {
    isIntroVisible,
    isContentVisible,
    introOpacity,
    contentOpacity,
  };
};