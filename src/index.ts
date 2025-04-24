#! /usr/bin/env node

import cac from "cac";

import run from "./run";
import install from "./install";
import uninstall from "./uninstall";
import { Channel, downloadMusic } from "./core/music";

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

cli.command("install", "Installs this program").action(install);

cli.command("uninstall", "Uninstalls this program").action(uninstall);

(async () => {
  cli.help();
  cli.parse();
})();
