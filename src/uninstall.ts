import { execSync } from "child_process";
import shellContextMenu from "shell-context-menu";

export const uninstall = async () => {
  await shellContextMenu.removeCommand("Add Music to Video").catch(() => {});
  console.log("Removed context menu");

  execSync("npm uninstall -g add-music-to-video");
};

export default uninstall;
