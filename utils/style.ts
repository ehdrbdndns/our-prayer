import { Dimensions } from "react-native";

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const deviceWidth = Dimensions.get('window').width;
export const deviceHeight = Dimensions.get('window').height;

const widthRatio = deviceWidth / BASE_WIDTH;
const heightRatio = deviceHeight / BASE_HEIGHT;

// Scale the size of the component based on the screen size
const scaleWidth = (size: number) => widthRatio * size;

// Scale the size of the component based on the screen height
export const scaleHeight = (size: number) => heightRatio * size;

// Scale the size of the component based on the screen width with a factor( default is 0.5 )
export const moderateScale = (size: number, factor = 0.5) => size + (scaleWidth(size) - size) * factor;

// Normalize the font size based on the screen width
export const normalizeFontSize = (size: number) => Math.round(size * widthRatio);

// Get the letter spacing based on the scaled font size
export const getLetterSpacing = (scaledFontSize: number, percent: number) => scaledFontSize * (percent / 100);
