import chokidar from "chokidar";
import fs from "fs";
import { CliOptions } from "./types/cli";
import run from "./run";

export interface WatchOptions extends CliOptions {
  inputPath: string;
}

const canBeProcessed = (filePath: string): boolean => {
  return filePath.endsWith(".mp4") && !filePath.endsWith("_with_music.mp4");
};

export const watch = async (options: WatchOptions) => {
  const { inputPath, ...cliOptions } = options;

  console.log(`Watching ${inputPath} for new video files...`);

  const watcher = chokidar.watch(inputPath, {
    depth: 2,
    ignoreInitial: false,
    persistent: true,
    ignored: ["**/*.mp4"],
  });

  const filesProcessed = new Set<string>();

  watcher.on("all", async (event: string, filePath: string) => {
    if (!canBeProcessed(filePath)) {
      return;
    }

    if (filesProcessed.has(filePath)) {
      return;
    }

    filesProcessed.add(filePath);

    console.log(`Processing new video: ${filePath}`);

    try {
      // Process the video
      await run({
        inputVideoFilePath: filePath,
        ...cliOptions,
      });

      // Delete the original file
      fs.unlinkSync(filePath);
      console.log(`Deleted original file: ${filePath}`);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  });

  // Handle errors
  watcher.on("error", (error: Error) => {
    console.error("Watch error:", error);
  });

  // Return the watcher so it can be closed if needed
  return watcher;
};

export default watch;
