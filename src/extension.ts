import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parseNotebook } from './parser/notebookParser';
import { renderNotebookToHtml } from './parser/htmlRenderer';
import { locateChrome, printHtmlToPdf } from './printer/chromePrinter';
import { showExportDialog } from './exportDialog';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "renderpage" is now active.');

  // Register command to convert ipynb to PDF
  const convertCommand = vscode.commands.registerCommand(
    'renderpage.convertToPdf',
    async (uri: vscode.Uri | undefined) => {
      // 1. Resolve the notebook URI
      let notebookUri = uri;
      if (!notebookUri) {
        // If triggered from command palette or toolbar without arguments, try finding the active notebook
        const activeNotebook = vscode.window.activeNotebookEditor?.notebook;
        if (activeNotebook) {
          notebookUri = activeNotebook.uri;
        } else {
          // If no notebook active, check active text editor (which might open .ipynb as JSON)
          const activeTextDoc = vscode.window.activeTextEditor?.document;
          if (activeTextDoc && activeTextDoc.fileName.endsWith('.ipynb')) {
            notebookUri = activeTextDoc.uri;
          }
        }
      }

      if (!notebookUri) {
        vscode.window.showErrorMessage(
          'No Jupyter Notebook file is currently open or selected.'
        );
        return;
      }

      const filePath = notebookUri.fsPath;
      if (!filePath.endsWith('.ipynb')) {
        vscode.window.showErrorMessage(
          'Selected file is not a Jupyter Notebook (.ipynb).'
        );
        return;
      }

      const parsedPath = path.parse(filePath);
      const notebookName = parsedPath.name;
      const notebookDir = parsedPath.dir;
      const pdfOutputPath = path.join(notebookDir, `${notebookName}.pdf`);
      const tempHtmlPath = path.join(notebookDir, `.${notebookName}.temp_export.html`);

      // 2. Load configurations
      const config = vscode.workspace.getConfiguration('renderpage');
      const margin = config.get<string>('margin', '15mm');
      const paperSize = config.get<string>('paperSize', 'A4');

      // 2b. Show export configuration dialog
      const exportOptions = await showExportDialog(notebookName, { margin, paperSize });
      if (!exportOptions) {
        return; // User cancelled
      }

      // 3. Perform conversion with progress notification
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Converting ${notebookName} to PDF`,
          cancellable: false
        },
        async (progress) => {
          let hasTempFile = false;
          try {
            // Step 1: Detect Chrome executable
            progress.report({ message: 'Locating Chromium/Chrome...' });
            const chromePath = locateChrome();

            // Step 2: Read and parse .ipynb JSON
            progress.report({ message: 'Parsing Jupyter Notebook...' });
            const jsonContent = fs.readFileSync(filePath, 'utf8');
            const notebook = parseNotebook(jsonContent);

            // Step 3: Render to beautiful offline HTML
            progress.report({ message: 'Generating offline document...' });
            const htmlContent = await renderNotebookToHtml(notebook, notebookName, {
              margin: exportOptions.margin,
              paperSize: exportOptions.paperSize,
              title: exportOptions.title,
              author: exportOptions.author,
              description: exportOptions.description,
              enableDate: exportOptions.enableDate,
              enableHeader: exportOptions.enableHeader,
              headerText: exportOptions.headerText,
              enableFooter: exportOptions.enableFooter,
              footerText: exportOptions.footerText
            });

            // Step 4: Write temporary HTML file (for relative image resolution)
            fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
            hasTempFile = true;

            // Step 5: Print HTML to PDF using headless Chrome
            progress.report({ message: 'Printing PDF document...' });
            await printHtmlToPdf(tempHtmlPath, pdfOutputPath, chromePath);

            // Step 6: Success Feedback with actions
            vscode.window.showInformationMessage(
              `Successfully exported: ${notebookName}.pdf`,
              'Reveal in Explorer',
              'Open PDF'
            ).then((selection) => {
              if (selection === 'Reveal in Explorer') {
                vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(pdfOutputPath));
              } else if (selection === 'Open PDF') {
                // Open file using system default PDF viewer
                vscode.env.openExternal(vscode.Uri.file(pdfOutputPath));
              }
            });

          } catch (err: any) {
            vscode.window.showErrorMessage(
              `Failed to convert Notebook to PDF:\n${err.message || err}`
            );
          } finally {
            // Always clean up temporary HTML file to keep project directories pristine
            if (hasTempFile && fs.existsSync(tempHtmlPath)) {
              try {
                fs.unlinkSync(tempHtmlPath);
              } catch (e) {
                console.error('Failed to delete temp HTML file:', e);
              }
            }
          }
        }
      );
    }
  );

  context.subscriptions.push(convertCommand);
}

export function deactivate() {
  console.log('Extension "renderpage" deactivated.');
}
