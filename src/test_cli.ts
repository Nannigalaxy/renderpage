// 1. Mock 'vscode' module before any other imports
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id: string) {
  if (id === 'vscode') {
    return {
      workspace: {
        getConfiguration: () => ({
          get: (key: string, defaultValue: any) => defaultValue
        })
      },
      window: {
        showWarningMessage: () => {}
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

import * as fs from 'fs';
import * as path from 'path';
import { parseNotebook } from './parser/notebookParser';
import { renderNotebookToHtml } from './parser/htmlRenderer';
import { printHtmlToPdf } from './printer/chromePrinter';

function locateChromeCLI(): string {
  const platform = process.platform;
  let paths: string[] = [];

  if (platform === 'win32') {
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    paths = [
      path.join(programFiles, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(programFiles, 'Microsoft\\Edge\\Application\\msedge.exe'),
    ];
  } else if (platform === 'darwin') {
    paths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ];
  } else if (platform === 'linux') {
    paths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ];
  }

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error('Could not find Google Chrome or Microsoft Edge.');
}

async function runNotebook(name: string) {
  const workspaceDir = path.join(__dirname, '../samples');
  const ipynbPath = path.join(workspaceDir, `${name}.ipynb`);
  const htmlPath = path.join(workspaceDir, `${name}.html`);
  const pdfPath = path.join(workspaceDir, `${name}.pdf`);

  console.log(`\n--- Converting ${name}.ipynb ---`);
  if (!fs.existsSync(ipynbPath)) {
    throw new Error(`File not found: ${ipynbPath}`);
  }

  console.log(`1. Reading ${name}.ipynb...`);
  const jsonContent = fs.readFileSync(ipynbPath, 'utf8');

  console.log('2. Parsing notebook...');
  const notebook = parseNotebook(jsonContent);

  console.log('3. Rendering notebook to HTML...');
  const isShowcase = ['signal_processing', 'computer_vision', 'statistics'].includes(name);
  const htmlContent = await renderNotebookToHtml(notebook, name, {
    margin: isShowcase ? '10mm' : '15mm',
    paperSize: 'A4',
    enableHeaderBlock: !isShowcase
  });

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`   HTML written to: ${htmlPath}`);

  console.log('4. Locating Chrome and printing to PDF...');
  const chromePath = locateChromeCLI();
  await printHtmlToPdf(htmlPath, pdfPath, chromePath);
  console.log(`5. PDF generated successfully at: ${pdfPath}`);
}

async function run() {
  const notebooks = [
    'sample', 'sample_languages', 'sample_r', 'large_cell',
    'signal_processing', 'computer_vision', 'statistics'
  ];
  for (const name of notebooks) {
    await runNotebook(name);
  }
}

run().catch(err => {
  console.error('CLI test execution failed:', err);
  process.exit(1);
});
