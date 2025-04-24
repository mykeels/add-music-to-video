#! /usr/bin/env node

import cac from "cac";

import run from "./run";
import install from "./install";
import uninstall from "./uninstall";
import { Channel } from "./core/music";
import { watch } from "./watch";

const cli = cac("add-music-to-video");

const runCmd = cli.command("[...args]", "Add music to a video");
runCmd
  .option("-i, --input [path]", "Input video file", {})
  .option("-m, --music [source]", "Music source (youtube, local, random)")
  .option("-y, --youtube [url]", "Youtube URL")
  .option("-l, --file-path [path]", "Local music file path")
  .option("-o, --output [path]", "Output video file")
  .action(
    async (
      args,
      options: {
        input: string;
        music: Channel;
        youtube: string;
        filePath: string;
        output: string;
      }
    ) => {
      const { input, music, youtube, filePath, output } = options;
      await run(
        {
          inputVideoFilePath: input,
          musicSource: music,
          youtubeUrl: youtube,
          localMusicPath: filePath,
          outputPath: output,
        },
        {
          getInputVideoFilePath: input ? async () => input : undefined,
        }
      );
    }
  );

// Watch command
cli
  .command("watch", "Watch a folder for new videos and automatically add music")
  .option("-i, --input <path>", "Folder path to watch (required)")
  .option("-m, --music-source <source>", "Music source (youtube, local, random)", {
    default: "random"
  })
  .option("-y, --youtube-url <url>", "Youtube URL (required for youtube source)")
  .option("-l, --local-music-path <path>", "Local music file path (required for local source)")
  .option("-o, --output-path <path>", "Output video file path")
  .action((args) => {
    if (!args.input) {
      console.error("Error: --input option is required");
      process.exit(1);
    }

    const options = {
      inputPath: args.input,
      musicSource: args.musicSource,
      youtubeUrl: args.youtubeUrl,
      localMusicPath: args.localMusicPath,
      outputPath: args.outputPath
    };
    
    return watch(options);
  });

cli.command("install", "Installs this program").action(install);

cli.command("uninstall", "Uninstalls this program").action(uninstall);

(async () => {
  cli.help();
  cli.parse();
})();
