import * as FileSystem from 'expo-file-system';

export const AUDIO_DIR = FileSystem.documentDirectory + 'audio/';
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

    const directory = fileUri.substring(0, fileUri.lastIndexOf('/'));
    await ensureDirExists(directory);

    await FileSystem.downloadAsync(audioUri, fileUri);

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
  const fileUri = audioFileUri(path);
  await FileSystem.deleteAsync(fileUri);
}