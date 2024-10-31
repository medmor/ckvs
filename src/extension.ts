import * as vscode from "vscode";

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

function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  content: string
): string {
  const ckeditorPath = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "node_modules",
      "@ckeditor",
      "ckeditor5-build-classic",
      "build",
      "ckeditor.js"
    )
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Rich Text Editor</title>
      <script src="${ckeditorPath}"></script>
    </head>
    <body>
      <textarea id="editor">${content}</textarea>
      <button id="save">Save</button>
      <script>
        let editorInstance;
        ClassicEditor
          .create(document.querySelector('#editor'))
          .then(editor => {
            editorInstance = editor;
          })
          .catch(error => console.error(error));

        // Function to send a save message to the extension
        const vscode = acquireVsCodeApi();
        document.getElementById('save').addEventListener('click', () => {
          vscode.postMessage({
            type: 'save',
            text: editorInstance.getData() // Get content from CKEditor
          });
        });

        // Listen for content updates from the extension
        window.addEventListener('message', event => {
          const message = event.data;
          if (message.type === 'updateContent' && editorInstance) {
            editorInstance.setData(message.text); // Update editor content
          }
        });
      </script>
    </body>
    </html>`;
}

export function deactivate() {}
