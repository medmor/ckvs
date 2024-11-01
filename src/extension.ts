import * as vscode from "vscode";
import { getWebviewContent } from "./webViewContent";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.openCKEditor",
      async (uri: vscode.Uri) => {
        // Create a new webview panel
        const panel = vscode.window.createWebviewPanel(
          "ckeditorPanel",
          "Rich Text Editor",
          vscode.ViewColumn.One,
          { enableScripts: true }
        );

        // Read the initial content of the HTML file
        const fileContent = await vscode.workspace.fs.readFile(uri);
        let htmlContent = fileContent.toString();

        // Load the HTML content into the webview
        panel.webview.html = getWebviewContent(
          panel.webview,
          context.extensionUri,
          htmlContent
        );

        // Watch for changes in the original HTML file
        const fileWatcher = vscode.workspace.createFileSystemWatcher(
          uri.fsPath
        );
        fileWatcher.onDidChange(async () => {
          const updatedContent = (
            await vscode.workspace.fs.readFile(uri)
          ).toString();
          panel.webview.postMessage({
            type: "updateContent",
            text: updatedContent,
          });
        });

        // Dispose of the watcher when the panel is closed
        panel.onDidDispose(() => {
          fileWatcher.dispose();
        });

        // Handle messages received from the webview
        panel.webview.onDidReceiveMessage(
          async (message) => {
            if (message.type === "save") {
              const updatedContent = message.text;
              await vscode.workspace.fs.writeFile(
                uri,
                Buffer.from(updatedContent, "utf8")
              );
              vscode.window.showInformationMessage("File saved!");
            }
          },
          undefined,
          context.subscriptions
        );
      }
    )
  );
}

export function deactivate() {}
