import fs from "fs";
import path from "path";
import prompts from "prompts";
import ytdl from "ytdl-core";
import { execSync } from "child_process";

const downloadFromYoutube = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const file = path.join(__dirname, "random-music.m4a");
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
};

const convertM4aToMp3 = async (m4aFile: string) => {
  const mp3File = path.join(__dirname, "random-music.mp3");
  execSync(
    `ffmpeg -i "${m4aFile}" -c:v copy -c:a libmp3lame -q:a 4 "${mp3File}"`
  );
  return mp3File;
};

const truncateMp3 = async (mp3File: string, duration: number) => {
  const truncatedMp3File = path.join(__dirname, "truncated-random-music.mp3");
  execSync(`ffmpeg -i "${mp3File}" -ss ${0} -to ${duration} "${truncatedMp3File}"`);
  return truncatedMp3File;
};

export const downloadYoutubeMusic = async (
  duration: number,
  {
    getYoutubeUrl = () =>
      prompts({
        type: "text",
        name: "url",
        message: "Enter a valid youtube URL",
      }).then((res) => res.url as string),
    download = downloadFromYoutube,
    convert = convertM4aToMp3,
    truncate = truncateMp3,
  } = {}
): Promise<string> => {
  const url = await getYoutubeUrl();

  console.log("Downloading:", url);

  const m4aFile = await download(url);

  const mp3File = await convert(m4aFile);

  return truncate(mp3File, duration);
};
