import fs from "fs";
import path from "path";
import getRandomMusic from "get-random-music";
import { execSync } from "child_process";

const expandMp3 = async (audioPath: string, duration: number) => {
  console.log("Expanding Music to fit video of", duration, "seconds");
  const audioRepeatCount = Math.max(Math.ceil(duration / 15), 1);
  const repeatInputFile = path
    .join(__dirname, "audio-repeat.txt")
    .replace(/\\/g, "\\\\");
  fs.writeFileSync(
    repeatInputFile,
    `file '${path.relative(__dirname, audioPath)}'\n`.repeat(audioRepeatCount),
    "utf8"
  );
  const audioDir = path.dirname(audioPath);
  const audioFilename = audioPath
    .replace(audioDir, "")
    .replace(path.delimiter, "")
    .replace(/\.\w+$/, "");
  const audioRepeatedFilePath = path.join(
    path.dirname(audioPath),
    `${audioFilename}_repeated_${duration}s.mp3`
  );
  execSync(
    `ffmpeg -y -t ${duration} -f concat -i ${repeatInputFile} -c copy ${audioRepeatedFilePath}`,
    {
      cwd: path.dirname(repeatInputFile),
    }
  );

  return audioRepeatedFilePath;
};

export const downloadRandomMusic = async (
  duration: number,
  {
    getStream = (outFilePath: string) =>
      getRandomMusic().then((res) => {
        res.data.pipe(fs.createWriteStream(outFilePath));
        return res.data;
      }),
  } = {}
): Promise<string> => {
  console.log("Downloading Random Music");
  const musicFilePath = path.join(__dirname, "random-music.mp3");
  const downloadStream = await getStream(musicFilePath);
  await new Promise((resolve, reject) => {
    downloadStream.on("error", (error) => {
      console.error(error);
      (downloadStream as any).destroy && (downloadStream as any).destroy();
      (downloadStream as any).close && (downloadStream as any).close();
      reject();
    });
    downloadStream.on("close", () => {
      resolve(musicFilePath);
    });
  });

  return expandMp3(musicFilePath, duration);
};
