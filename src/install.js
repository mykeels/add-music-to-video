const path = require("path");
const shellContextMenu = require("shell-context-menu");

const install = async (options) => {
  console.log(options);
  await shellContextMenu.removeCommand("Add Music to Video").catch(() => {});
  await shellContextMenu.registerCommand({
    name: "Add Music to Video",
    command: path.join(__dirname, "run.cmd"),
    menu: "Add Music to Video",
  });
  console.log("Created context menu");
};

module.exports = install;
module.exports.handleCommand = install;
