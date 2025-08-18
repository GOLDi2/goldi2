import * as vscode from "vscode";
import { CompilationService__Consumer } from "@cross-lab-project/soa-service-compilation";
import { FileSystemServiceConsumer } from "@cross-lab-project/soa-service-filesystem";
import { CollaborationServiceProsumer } from "@cross-lab-project/soa-service-collaboration";
import { ProgrammingServiceConsumer } from "@cross-lab-project/soa-service-programming";
import {
  openSettingsDatabase,
  writeSetting,
} from "@crosslab-ide/editor-settings";
import JSZip from "jszip";
import { Directory, File } from "@cross-lab-project/filesystem-schemas";

export async function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "crosslab-compilation-extension" is now active in the web extension host!'
  );

  await vscode.commands.executeCommand(
    "setContext",
    "crosslab.canCompile",
    false
  );
  context.globalState.update("crosslab.canCompile", false);

  await vscode.commands.executeCommand(
    "setContext",
    "crosslab.canProgram",
    false
  );
  context.globalState.update("crosslab.canProgram", false);

  // check for collaboration extension
  const collaborationExtension = vscode.extensions.all.find(
    (extension) =>
      extension.id === "crosslab.@crosslab-ide/crosslab-collaboration-extension"
  );
  const collaborationApi = collaborationExtension?.isActive
    ? collaborationExtension?.exports
    : undefined;
  const collaborationServiceProsumer = collaborationApi?.getProsumer() as
    | CollaborationServiceProsumer
    | undefined;
  if (!collaborationServiceProsumer?.hasRoom("status")) {
    collaborationServiceProsumer?.createRoom("status", "yjs");
  }
  const awareness = collaborationServiceProsumer?.getAwareness("status");
  awareness?.setLocalState({
    ...awareness.getLocalState(),
    isCompiling: false,
  });

  awareness?.on("change", async (_changes, origin) => {
    console.log(
      "status-update (compilation):",
      _changes,
      origin,
      Array.from(awareness.getStates().entries())
    );
    if (origin === "local") {
      return;
    }

    const states = awareness.getStates();
    let isCompiling = false;
    for (const state of states.values()) {
      isCompiling ||= !!state.isCompiling;
    }

    await vscode.commands.executeCommand(
      "setContext",
      "crosslab.isCompiling",
      isCompiling
    );
  });

  const fileSystemService__Consumer = new FileSystemServiceConsumer(
    "compilation:filesystem"
  );
  const compilationService__Consumer = new CompilationService__Consumer(
    "compilation"
  );
  const programmingService__Consumer = new ProgrammingServiceConsumer(
    "programming"
  );

  const programmingTargetId = new Promise<string>((resolve) =>
    programmingService__Consumer.on("new-producer", (producerId) => {
      resolve(producerId);
      vscode.commands.executeCommand("setContext", "crosslab.canProgram", true);
      context.globalState.update("crosslab.canProgram", true);
    })
  );

  const outputchannel = vscode.window.createOutputChannel("compilation");

  const compilationServiceProducerId = new Promise<string>((resolve) => {
    compilationService__Consumer.once("new-producer", (producerId) => {
      resolve(producerId);
      vscode.commands.executeCommand("setContext", "crosslab.canCompile", true);
      context.globalState.update("crosslab.canCompile", true);
    });
  });

  const fileSystemServiceProducerId = new Promise<string>((resolve) => {
    fileSystemService__Consumer.once("new-producer", (producerId) =>
      resolve(producerId)
    );
  });

  async function compile() {
    awareness?.setLocalStateField("isCompiling", true);

    await vscode.commands.executeCommand(
      "setContext",
      "crosslab.isCompiling",
      true
    );

    const workspaceFolder =
      Array.isArray(vscode.workspace.workspaceFolders) &&
      vscode.workspace.workspaceFolders.length > 0
        ? (vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder)
        : undefined;

    if (!workspaceFolder) {
      awareness?.setLocalStateField("isCompiling", false);
      vscode.window.showInformationMessage(
        "Unable to compile since no workspace folder is open!"
      );
      await vscode.commands.executeCommand(
        "setContext",
        "crosslab.isCompiling",
        false
      );
      return;
    }

    const directory = await fileSystemService__Consumer.readDirectory(
      await fileSystemServiceProducerId,
      workspaceFolder.uri.path
    );

    const result = await compilationService__Consumer.compile(
      await compilationServiceProducerId,
      directory
    );

    outputchannel.clear();
    await vscode.commands.executeCommand("workbench.panel.output.focus");
    outputchannel.show();
    outputchannel.appendLine("starting compilation!\n");

    outputchannel.appendLine(
      result.success
        ? result.message ?? "The compilation was successful!"
        : result.message ?? "Something went wrong during the compilation!"
    );

    awareness?.setLocalStateField("isCompiling", false);

    await vscode.commands.executeCommand(
      "setContext",
      "crosslab.isCompiling",
      false
    );

    return result;
  }

  async function upload() {
    const result = await compile();

    if (result && result.success) {
      outputchannel.appendLine("Uploading result!");
      await programmingService__Consumer.program(
        await programmingTargetId,
        result.result
      );
      outputchannel.appendLine("Uploaded result!");
    }
  }

  function addEntryToZip(zip: JSZip, entry: File | Directory) {
    if (entry.type === "file") {
      zip.file(entry.name, entry.content);
    } else {
      const dirZip = zip.folder(entry.name);

      if (!dirZip) {
        return;
      }

      for (const [name, content] of Object.entries(entry.content)) {
        addEntryToZip(dirZip, { ...content, name });
      }
    }
  }

  async function download() {
    const canCompile = context.globalState.get("crosslab.canCompile");

    if (canCompile) {
      const action = await vscode.window.showQuickPick([
        { label: "Download current project", id: "project" },
        { label: "Compile current project & download result", id: "compile" },
      ]);

      if (!action) {
        return;
      }

      if (action.id === "compile") {
        const compilationResponse = await compile();

        if (compilationResponse?.success && compilationResponse.result) {
          if (compilationResponse.result.type === "file") {
            return {
              name: compilationResponse.result.name,
              content: new Blob([compilationResponse.result.content]),
            };
          }
          const root = compilationResponse.result;
          const zip = new JSZip();
          addEntryToZip(zip, root);
          return {
            name: `${compilationResponse.result.name}.zip`,
            content: await zip.generateAsync({ type: "blob" }),
          };
        } else {
          return undefined;
        }
      }
    }

    const workspaceFolder =
      Array.isArray(vscode.workspace.workspaceFolders) &&
      vscode.workspace.workspaceFolders.length > 0
        ? (vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder)
        : undefined;

    if (!workspaceFolder) {
      vscode.window.showInformationMessage(
        "Unable to download current project since no workspace folder is open!"
      );
      return;
    }

    const directory = await fileSystemService__Consumer.readDirectory(
      await fileSystemServiceProducerId,
      workspaceFolder.uri.path
    );

    const zip = new JSZip();
    addEntryToZip(zip, directory);
    return {
      name: `${directory.name}.zip`,
      content: await zip.generateAsync({ type: "blob" }),
    };
  }

  const compileDisposable = vscode.commands.registerCommand(
    "crosslab-compilation-extension.compile",
    async () => {
      await compile();
    }
  );

  const uploadDisposable = vscode.commands.registerCommand(
    "crosslab-compilation-extension.upload",
    async () => {
      await upload();
    }
  );

  const downloadDisposable = vscode.commands.registerCommand(
    "crosslab-compilation-extension.download",
    async () => {
      const file = await download();

      if (!file) return;

      const settingsDatabase = await openSettingsDatabase();
      await writeSetting(settingsDatabase, "crosslab.download", file);
    }
  );

  context.subscriptions.push(
    compileDisposable,
    uploadDisposable,
    downloadDisposable
  );

  return {
    loadCrosslabServices: (_configuration: { [k: string]: unknown }) => {
      return [
        fileSystemService__Consumer,
        compilationService__Consumer,
        programmingService__Consumer,
      ];
    },
  };
}

export function deactivate() {}
