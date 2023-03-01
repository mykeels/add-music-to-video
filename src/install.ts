import path from "path";
import shellContextMenu from "shell-context-menu";

export const install = async () => {
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
