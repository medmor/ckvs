import { Plugin } from "@ckeditor/ckeditor5-core/dist/index.js";
import { ButtonView } from "@ckeditor/ckeditor5-ui/dist/index.js";
export default class SaveButtonPlugin extends Plugin {
  init() {
    const editor = this.editor;
    const vscode = editor.config.get("vscode");
    editor.ui.componentFactory.add("saveButton", (locale) => {
      const buttonView = new ButtonView(locale);

      buttonView.set({
        label: "Save",
        icon: null, // You can add an icon here if you want
        tooltip: true,
      });

      // Event listener for the button's click
      buttonView.on("execute", () => {
        // Send message to VS Code with editor content
        vscode.postMessage({
          type: "save",
          text: editor.getData(), // Gets content from CKEditor
        });
      });

      return buttonView;
    });
  }
}
