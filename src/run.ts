import fs from "fs";
import fg from "fast-glob";
import path from "path";
import FFMpeg from "ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { execSync } from "child_process";

import { assert } from "./utils/assert.utils";
import { selectVideoFile } from "./core/video";
import { Channel, downloadMusic } from "./core/music";
import { CliOptions, DEFAULT_OPTIONS } from "./types/cli";

(FFMpeg as any).bin = ffmpegPath;

const cleanupFiles = async () => {
  console.log("Cleaning up files");
  const files = await fg(["*.mp3", "*.txt", "*.m4a"], {
    cwd: __dirname,
  });
  for (let file of files) {
    fs.unlinkSync(path.join(__dirname, file));
    console.log("Removed", path.join(__dirname, file));
  }
};

const addMusicToVideo = async (
  musicFilePath: string,
  videoFilePath: string
) => {
  const outDir = path.dirname(videoFilePath);
  const filename = videoFilePath
    .replace(outDir, "")
    .replace(path.delimiter, "")
    .replace(/\.\w+$/, "");
  const outVideoFilePath = path.join(
    outDir,
    `${filename}_with_music.mp4`.replace(/ /g, "_")
  );
  execSync(
    `ffmpeg -y -i "${videoFilePath}" -i "${musicFilePath}" -c:v copy -map 0:v:0 -map 1:a:0 -f mp4 "${outVideoFilePath}"`
  );

  return outVideoFilePath;
};

export const run = async (
  options: CliOptions,
  {
    getInputVideoFilePath = selectVideoFile,
    getVideoDuration = async (filePath: string) => {
      const video = await new FFMpeg(filePath);
      return assert(video.metadata.duration).seconds;
    },
    getMusicFilePath = downloadMusic,
    cleanup = cleanupFiles,
    join = addMusicToVideo,
  } = {}
) => {
  // Get input video file path
  const inVideoFilePath =
    options.inputVideoFilePath || (await getInputVideoFilePath());

  const allowedFormats = [".mp4"];
  if (!allowedFormats.some((format) => inVideoFilePath.endsWith(format))) {
    console.error("Input file not matching allowedFormats", {
      allowedFormats,
      file: inVideoFilePath,
    });
    process.exit(0);
  }
  console.log("Input:", inVideoFilePath);

  const duration = await getVideoDuration(inVideoFilePath);

  const audioFilePath =
    options.outputPath || (await getMusicFilePath(duration, options));

  const outVideoFilePath = await join(audioFilePath, inVideoFilePath);

  await cleanup();

  console.log("Output:", outVideoFilePath);

  return outVideoFilePath;
};

export default run;
