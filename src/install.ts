import path from "path";
import shellContextMenu from "shell-context-menu";
import os from "os";

export const install = async () => {
  if (os.platform() !== "win32") {
    console.log("OS:", os.platform());
    console.log("Not on Windows, skipping context menu installation");
    return;
  }
  console.log("Installing to", __dirname);
  await shellContextMenu.removeCommand("Add Music to Video").catch(() => {});
  await shellContextMenu.registerCommand({
    name: "Add Music to Video",
    icon: "C:\\WINDOWS\\system32\\cmd.exe",
    command: path.join(__dirname, "run.cmd"),
    menu: "Add Music to Video",
  });
  console.log("Created context menu");
};

export default install;
