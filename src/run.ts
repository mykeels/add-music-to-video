import fs from "fs";
import fg from "fast-glob";
import path from "path";
import FFMpeg from "ffmpeg";
import ffmpegPath from "ffmpeg-static";
import getRandomMusic from "get-random-music";
import { execSync } from "child_process";
import { assert } from "./utils/assert.utils";

(FFMpeg as any).bin = ffmpegPath;

const getRepeatedAudioPath = async (audioPath: string, duration: number) => {
  console.log("Expanding Music to fit video of", duration, "seconds");
  const audioRepeatCount = Math.ceil(duration / 15);
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

const makeMusic = async (duration: number): Promise<string> => {
  console.log("Making Music");
  const musicFilePath = path.join(__dirname, "random-music.mp3");
  const outStream = fs.createWriteStream(musicFilePath);
  const downloadStream = await getRandomMusic().then((res) => res.data);
  await new Promise((resolve, reject) => {
    downloadStream.pipe(outStream);
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

  return getRepeatedAudioPath(musicFilePath, duration);
};

const cleanupFiles = async () => {
  console.log("Cleaning up files");
  const files = await fg(["*.mp3", "*.txt"], {
    cwd: __dirname,
  });
  for (let file of files) {
    fs.unlinkSync(path.join(__dirname, file));
    console.log("Removed", path.join(__dirname, file));
  }
};

export const run = async (options: {
  argv: string[];
  help?: boolean;
  command?: string;
}) => {
  const file = options.argv?.join(" ");
  const allowedFormats = [".mp4"];
  if (!allowedFormats.some((format) => file.endsWith(format))) {
    console.error("Input file not matching allowedFormats", {
      allowedFormats,
      file,
    });
    process.exit(0);
  }
  console.log("Input:", file);
  const outDir = path.dirname(file);
  const filename = file
    .replace(outDir, "")
    .replace(path.delimiter, "")
    .replace(/\.\w+$/, "");

  const video = await new FFMpeg(file);
  const musicFilePath = await makeMusic(
    assert(video.metadata.duration).seconds
  );
  const videoOutputFile = path.join(
    outDir,
    `${filename}_with_music.mp4`.replace(/ /g, "_")
  );

  execSync(
    `ffmpeg -y -i "${file}" -i "${musicFilePath}" -c:v copy -map 0:v:0 -map 1:a:0 -f mp4 "${videoOutputFile}"`
  );

  await cleanupFiles();
};

export default run;
