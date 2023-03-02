import selectFile from "cli-file-select/dist";
import prompts from "prompts";
import { downloadYoutubeVideo } from "./youtube.video";

const channels = [
  {
    title: "Local File System",
    value: "local",
  },
  {
    title: "Youtube",
    value: "youtube",
  },
] as const;

type Channel = typeof channels[number]["value"];

const selectChannel = async (): Promise<Channel> => {
  return prompts({
    type: "select",
    name: "channel",
    message: "Where can your video be found?",
    choices: channels as any,
  }).then((res) => res.channel as Channel);
};

export const selectVideoFile = async ({
  select = selectChannel,
  getLocalVideo = selectFile,
  getYoutubeVideo = downloadYoutubeVideo,
} = {}): Promise<string> => {
  const channel = await select();
  if (channel === "local") {
    return getLocalVideo();
  } else {
    return getYoutubeVideo();
  }
};
