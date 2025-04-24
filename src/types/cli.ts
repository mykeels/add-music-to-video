export interface CliOptions {
  inputVideoFilePath?: string;
  musicSource?: "random" | "youtube" | "local";
  youtubeUrl?: string;
  localMusicPath?: string;
  outputPath?: string;
  help?: boolean;
}

export const DEFAULT_OPTIONS: CliOptions = {
  musicSource: "random",
};
