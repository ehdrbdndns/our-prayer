import { ImageBackground } from 'expo-image';
import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

const BackgroundImage = require("@/assets/images/background.png");

type BackgroundWithImageProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  animation?: 'fade' | 'none';
}>;

export default function BackgroundWithImage({ children, style, animation }: BackgroundWithImageProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animation === 'fade') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [fadeAnim, animation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <ImageBackground
          style={[styles.image, style]}
          source={BackgroundImage}
        >
          {children}
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242527',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
});