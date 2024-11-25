import { Dimensions } from "react-native";

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const widthRatio = deviceWidth / BASE_WIDTH;
const heightRatio = deviceHeight / BASE_HEIGHT;

// Scale the size of the component based on the screen size
const scale = (size: number) => widthRatio * size;

// Scale the size of the component based on the screen height
export const verticalScale = (size: number) => heightRatio * size;

// Scale the size of the component based on the screen width with a factor( default is 0.5 )
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Normalize the font size based on the screen width
export const normalizeFontSize = (size: number) => Math.round(size * widthRatio);