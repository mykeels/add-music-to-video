import prompts from "prompts";

import { downloadRandomMusic } from "./random.music";
import { downloadYoutubeMusic } from "./youtube.music";
import { downloadLocalMusic } from "./local.music";

const channels = [
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

type Channel = typeof channels[number]["value"];

const selectChannel = async (): Promise<Channel> => {
  return prompts({
    type: "select",
    name: "channel",
    message: "Where can your music be found?",
    choices: channels as any,
  }).then((res) => res.channel as Channel);
};

export const downloadMusic = async (
  duration: number,
  {
    select = selectChannel,
    getLocalMusic = downloadLocalMusic,
    getYoutubeMusic = downloadYoutubeMusic,
    getRandomMusic = downloadRandomMusic,
  } = {}
): Promise<string> => {
  const channel = await select();
  if (channel === "local") {
    return getLocalMusic(duration);
  } else if (channel === "youtube") {
    return getYoutubeMusic(duration);
  } else {
    return getRandomMusic(duration);
  }
};
