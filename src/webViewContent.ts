import * as vscode from "vscode";

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  content: string
): string {
  const bundleJsPath = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "bundle.js")
  );
  const ckeditorCssPath = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "ckeditor5.css")
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Rich Text Editor</title>
    </head>
    <body>
      <textarea id="editor">${content}</textarea>
      <button id="save">Save</button>
    </body>
    </html>`;
}
