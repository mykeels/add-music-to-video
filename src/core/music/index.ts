import prompts from "prompts";

import { downloadRandomMusic } from "./random.music";
import { downloadYoutubeMusic } from "./youtube.music";
import { downloadLocalMusic } from "./local.music";
import { CliOptions } from "../../types/cli";

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

export type Channel = (typeof channels)[number]["value"];

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
  options: CliOptions = {},
  {
    select = selectChannel,
    getLocalMusic = downloadLocalMusic,
    getYoutubeMusic = downloadYoutubeMusic,
    getRandomMusic = downloadRandomMusic,
  } = {}
): Promise<string> => {
  const channel = options.musicSource || (await select());

  if (channel === "local") {
    if (!options.localMusicPath) {
      throw new Error(
        "Local music path is required when using local music source"
      );
    }
    return getLocalMusic(duration, {
      getFilePath: async () => options.localMusicPath!,
    });
  } else if (channel === "youtube") {
    if (!options.youtubeUrl) {
      throw new Error(
        "YouTube URL is required when using YouTube music source"
      );
    }
    return getYoutubeMusic(duration, {
      getYoutubeUrl: async () => options.youtubeUrl!,
    });
  } else {
    return getRandomMusic(duration);
  }
};
