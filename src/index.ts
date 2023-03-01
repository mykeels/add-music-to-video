#! /usr/bin/env node

import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

import run from "./run";
import install from "./install";
import uninstall from "./uninstall";

const usage = commandLineUsage([
  {
    header: "add-music-to-video",
    content: "Adds background music to a video",
  },
  {
    header: "Synopsis",
    content: "npx add-music-to-video <command> <options>",
  },
  {
    header: "Commands",
    content: [
      {
        name: "install",
        summary: "Installs this program",
        defaultOption: "[default]",
      },
      { name: "run", summary: "Runs this program" },
      { name: "uninstall", summary: "Uninstalls this program" },
    ],
  },
  {
    header: "Options",
    optionList: [
      {
        name: "help",
        description: "Print this usage guide.",
      },
    ],
  },
]);

const mainOptions = commandLineArgs(
  [
    { name: "help", alias: "h", type: Boolean },
    { name: "command", defaultOption: true },
  ],
  { stopAtFirstUnknown: true }
) as commandLineArgs.CommandLineOptions & { command: CLICommand, help: boolean };
const argv = mainOptions._unknown || [];

(async () => {
  const handlers: Record<CLICommand, () => Promise<any>> = {
    install: () => install(),
    uninstall: () => uninstall(),
    run: () => run({ argv }).catch(console.error),
  };
  const help = () => {
    console.log(usage);
    process.exit(0);
  };
  if (mainOptions.help) {
    help();
  }
  const command = (mainOptions.command?.toLowerCase() || "install") as CLICommand;
  (handlers[command] || help)();
})();

type CLICommand = "install" | "run" | "uninstall";
