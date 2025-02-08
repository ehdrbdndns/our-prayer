import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import api from './axios';

export const AUDIO_DIR = FileSystem.documentDirectory + 'audio/';
const audioFileUri = ({
  path
}: {
  path: string
}) => AUDIO_DIR + `${path}`;

async function ensureDirExists(path: string) {
  const dirInfo = await FileSystem.getInfoAsync(path);
  if (!dirInfo.exists) {
    // console.log("audio directory doesn't exist, creating…");
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  } else {
    // console.log("audio directory exists!");
  }
}

const getFileExtensionFromMimeType = (mimeType: string) => {
  let extension = '';

  switch (mimeType) {
    case 'audio/mpeg':
      extension = 'mp3';
      break;
    case 'audio/mp4':
    case 'audio/x-m4a':
      extension = 'm4a';
      break;
    case 'audio/x-wav':
      extension = 'wav';
      break;
    // 필요한 경우 다른 MIME 타입을 추가
    default:
      throw new Error('Unsupported MIME type: ' + mimeType);
  }

  return extension;
};

const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export async function addAudio({
  path, audioUri
}: {
  path: string, audioUri: string
}) {
  try {
    const response = await api.get(audioUri, { responseType: 'blob' });
    const mimeType = response.headers['content-type'];
    const extension = getFileExtensionFromMimeType(mimeType || '');

    const fileUri = audioFileUri({ path: `${path}.${extension}` });

    if (Platform.OS === 'ios') {
      // Todo: 서버로부터 확장자 정보를 가져와서 downloadAsync를 사용하도록 수정
      const directory = fileUri.substring(0, fileUri.lastIndexOf('/'));
      await ensureDirExists(directory);

      const audioBlob = await response.data;
      const base64Audio = await blobToBase64(audioBlob);

      await FileSystem.writeAsStringAsync(fileUri, base64Audio, { encoding: FileSystem.EncodingType.Base64 });
    } else {
      await FileSystem.downloadAsync(audioUri, fileUri);
    }

    return fileUri;
  } catch (e) {
    console.error("Couldn't download audio files:", e);
    throw e;
  }
}

export async function getSingleAudio({
  path, audio
}: {
  path: string, audio: string
}) {
  const fileUri = audioFileUri({ path });
  await ensureDirExists(fileUri);

  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    console.log("Gif isn't cached locally. Downloading…");
    await FileSystem.downloadAsync(audio, fileUri);
  }

  return fileUri;
}

export async function deleteAudio({
  path
}: {
  path: string
}) {
  console.log('Deleting audio file…');
  const fileUri = audioFileUri({ path });
  await FileSystem.deleteAsync(fileUri);
}