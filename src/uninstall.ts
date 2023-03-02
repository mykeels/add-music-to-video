import { execSync } from "child_process";
import shellContextMenu from "shell-context-menu";
import os from "os";

export const uninstall = async () => {
  if (os.platform() !== "win32") {
    console.log("OS:", os.platform());
    console.log("Not on Windows, skipping context menu uninstallation");
    return;
  }
  await shellContextMenu.removeCommand("Add Music to Video").catch(() => {});
  console.log("Removed context menu");

  execSync("npm uninstall -g add-music-to-video");
};

export default uninstall;
