declare module "shell-context-menu" {
  export function registerOpenWithCommand(
    extensions: string[],
    options: {
      name: string;
      command: string;
    }
  );
  export function registerCommand(options: {
    name: string;
    command: string;
    icon?: string;
    menu?: string;
  });
  export function registerDirectoryCommand(options: {
    name: string;
    command: string;
    icon?: string;
    menu?: string;
  });
  export function removeCommand(command: string);
  export function removeDirectoryCommand(command: string);
  export function removeOpenWithCommand(command: string);
}
