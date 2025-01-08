import * as FileSystem from 'expo-file-system';

export const AUDIO_DIR = FileSystem.documentDirectory + 'audio/';
const audioFileUri = ({
  path
}: {
  path: string
}) => AUDIO_DIR + `${path}`;

async function ensureDirExists(path: string) {
  const dirInfo = await FileSystem.getInfoAsync(path);
  if (!dirInfo.exists) {
    console.log("audio directory doesn't exist, creating…");
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  } else {
    console.log("audio directory exists!");
  }
}

export async function addAudio({
  path, audio
}: {
  path: string, audio: string
}) {
  try {
    const fileUri = audioFileUri({ path });
    // console.log('download audio file: ', audio);
    // console.log('fileUri: ' + fileUri);
    await ensureDirExists(fileUri);

    const { uri } = await FileSystem.downloadAsync(audio, fileUri);

    console.log('downloaded audio file: ', uri);

    console.log(await FileSystem.getInfoAsync(uri));

    return uri;
  } catch (e) {
    console.error("Couldn't download audio files:", e);
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

// export async function addAudio({
//   planId, audioId, audio
// }: {
//   planId: string, audioId: string, audio: string
// }) {
//   try {
//     await ensureDirExists();

//     console.log('Downloading audio file…');

//     const fileUri = audioFileUri({ planId, audioId });

//     const downloadResumable = FileSystem.createDownloadResumable(audio, fileUri, {}
//       , ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
//         const progress = totalBytesWritten / totalBytesExpectedToWrite;
//         console.log(`Download progress: ${progress}`);
//       }
//     );

//     const result = await downloadResumable.downloadAsync();

//     return result;
//   } catch (e) {
//     console.error("Couldn't download audio files:", e);
//   }
// }