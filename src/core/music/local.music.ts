import { execSync } from "child_process";
import selectFile from "cli-file-select";
import path from "path";

const truncateMp3 = async (mp3File: string, duration: number) => {
  const truncatedMp3File = path.join(__dirname, "truncated-random-music.mp3");
  execSync(`ffmpeg -i "${mp3File}" -ss ${0} -to ${duration} "${truncatedMp3File}"`);
  return truncatedMp3File;
};

export const downloadLocalMusic = async (
  duration: number,
  { truncate = truncateMp3 } = {}
): Promise<string> => {
  const file = await selectFile();
  return truncate(file, duration);
};
