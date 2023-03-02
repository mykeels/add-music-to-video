import prompts from "prompts";
import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";

const downloadFromYoutube = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const file = path.join(__dirname, "random-video.mp4");
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

export const downloadYoutubeVideo = async ({
  getYoutubeUrl = () =>
    prompts({
      type: "text",
      name: "url",
      message: "Enter a valid youtube URL",
    }).then((res) => res.url as string),
  download = downloadFromYoutube,
} = {}): Promise<string> => {
  const url = await getYoutubeUrl();
  console.log("Downloading:", url);
  return download(url);
};
