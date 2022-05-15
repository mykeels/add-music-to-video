#! /usr/bin/env node

const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");

const run = require("./run");
const install = require("./install");

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

/**
 * @type {commandLineArgs.CommandLineOptions & { command: CLICommands, help: boolean }}
 */
const mainOptions = commandLineArgs(
  [
    { name: "help", alias: "h", type: Boolean },
    { name: "command", defaultOption: true },
  ],
  { stopAtFirstUnknown: true }
);
const argv = mainOptions._unknown || [];

(async () => {
  /** @type {{ [key: BuilderCommands]: () => Promise<any> }} */
  const handlers = {
    install: () => install({ argv }),
    run: () => run({ argv }).catch(console.error),
  };
  const help = () => {
    console.log(usage);
    process.exit(0);
  };
  if (mainOptions.help) {
    help();
  }
  (handlers[mainOptions.command?.toLowerCase() || "install"] || help)();
})();

/**
 * @typedef {"install" | "run"} CLICommands
 */
