import * as FileSystem from 'expo-file-system';

export const AUDIO_DIR = 'audio/';
const audioFileUri = (path: string) => AUDIO_DIR + `${path}`;

async function ensureDirExists(path: string) {
  const dirInfo = await FileSystem.getInfoAsync(path);
  if (!dirInfo.exists) {
    // console.log("audio directory doesn't exist, creating…");
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  } else {
    // console.log("audio directory exists!");
  }
}

export async function addAudio({
  path, audioUri
}: {
  path: string, audioUri: string
}) {
  try {
    const fileUri = audioFileUri(path);
    const fullFileUri = FileSystem.documentDirectory + fileUri;

    const directory = fullFileUri.substring(0, fullFileUri.lastIndexOf('/'));
    await ensureDirExists(directory);

    await FileSystem.downloadAsync(audioUri, fullFileUri);

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
  const fileUri = audioFileUri(path);
  const fullFileUri = FileSystem.documentDirectory + fileUri;

  await ensureDirExists(fullFileUri);

  const fileInfo = await FileSystem.getInfoAsync(fullFileUri);

  if (!fileInfo.exists) {
    console.log("Gif isn't cached locally. Downloading…");
    await FileSystem.downloadAsync(audio, fullFileUri);
  }

  return fileUri;
}

export async function deleteAudio({
  path
}: {
  path: string
}) {
  console.log('Deleting audio file…');
  const fileUri = audioFileUri(path);
  const fullFileUri = FileSystem.documentDirectory + fileUri;

  await FileSystem.deleteAsync(fullFileUri);
}