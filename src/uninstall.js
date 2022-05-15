const { execSync } = require("child_process");
const path = require("path");
const shellContextMenu = require("shell-context-menu");

const uninstall = async (options) => {
  await shellContextMenu.removeCommand("Add Music to Video").catch(() => {});
  console.log("Removed context menu");

  execSync("npm uninstall -g add-music-to-video");
};

module.exports = uninstall;
module.exports.handleCommand = uninstall;
