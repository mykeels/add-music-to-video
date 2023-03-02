import fs from "fs";
import fg from "fast-glob";
import path from "path";
import prompts from "prompts";
import FFMpeg from "ffmpeg";
import ffmpegPath from "ffmpeg-static";
import getRandomMusic from "get-random-music";
import selectFile from "cli-file-select";
import ytdl from "ytdl-core";
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

const downloadRandomMusic = async (duration: number): Promise<string> => {
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
  const files = await fg(["*.mp3", "*.txt", "*.m4a"], {
    cwd: __dirname,
  });
  for (let file of files) {
    fs.unlinkSync(path.join(__dirname, file));
    console.log("Removed", path.join(__dirname, file));
  }
};

const downloadVideoFromYoutube = async (): Promise<string> => {
  const { url } = (await prompts({
    type: "text",
    name: "url",
    message: "Enter a valid youtube URL",
  })) as { url: string };
  const file = path.join(__dirname, "random-video.mp4");
  console.log("Downloading:", url);
  return new Promise((resolve, reject) => {
    const downloadStream = ytdl(url).pipe(fs.createWriteStream(file));
    downloadStream.on("error", (error) => {
      console.error(error);
      (downloadStream as any).destroy && (downloadStream as any).destroy();
      (downloadStream as any).close && (downloadStream as any).close();
      reject();
    });
    downloadStream.on("close", () => {
      resolve(file);
    });
  });
};

const downloadAudioFromYoutube = async (): Promise<string> => {
  const { url } = (await prompts({
    type: "text",
    name: "url",
    message: "Enter a valid youtube URL",
  })) as { url: string };
  const file = path.join(__dirname, "random-music.m4a");
  console.log("Downloading:", url);
  await new Promise((resolve, reject) => {
    const downloadStream = ytdl(url, {
      filter: "audioonly",
    }).pipe(fs.createWriteStream(file));
    downloadStream.on("error", (error) => {
      console.error(error);
      (downloadStream as any).destroy && (downloadStream as any).destroy();
      (downloadStream as any).close && (downloadStream as any).close();
      reject();
    });
    downloadStream.on("close", () => {
      resolve(file);
    });
  });
  const outFile = path.join(__dirname, "random-music.mp3");
  execSync(
    `ffmpeg -i "${file}" -c:v copy -c:a libmp3lame -q:a 4 "${outFile}"`
  );
  return outFile;
};

const chooseAudioFile = async (duration: number): Promise<string> => {
  const choices = [
    {
      title: "Local File System",
      value: "local",
    },
    {
      title: "Youtube",
      value: "youtube",
    },
    {
      title: "Random",
      value: "random",
    },
  ] as const;
  const { entry } = (await prompts({
    type: "select",
    name: "entry",
    message: "Where can your music be found?",
    choices: choices as any,
  })) as { entry: typeof choices[number]["value"] };

  if (entry === "local") {
    return selectFile();
  } else if (entry === "youtube") {
    return downloadAudioFromYoutube();
  } else {
    return downloadRandomMusic(duration);
  }
};

const chooseVideoFile = async (): Promise<string> => {
  const choices = [
    {
      title: "Local File System",
      value: "local",
    },
    {
      title: "Youtube",
      value: "youtube",
    },
  ] as const;
  const { entry } = (await prompts({
    type: "select",
    name: "entry",
    message: "Where can your video be found?",
    choices: choices as any,
  })) as { entry: typeof choices[number]["value"] };

  if (entry === "local") {
    return selectFile();
  } else {
    return downloadVideoFromYoutube();
  }
};

export const run = async (options: {
  argv: string[];
  help?: boolean;
  command?: string;
}) => {
  const file = options.argv?.join(" ") || (await chooseVideoFile());
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
  const musicFilePath = await chooseAudioFile(
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
