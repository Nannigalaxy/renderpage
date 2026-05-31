import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import * as vscode from 'vscode';

/**
 * Searches the local machine to find Google Chrome, Microsoft Edge, Chromium, or Brave.
 * Supports Windows, macOS, and Linux out-of-the-box.
 */
export function locateChrome(): string {
  const platform = process.platform;
  
  // 1. Get settings override if specified by the user
  const config = vscode.workspace.getConfiguration('renderpage');
  const customPath = config.get<string>('chromePath');
  
  if (customPath && customPath.trim()) {
    const resolvedPath = path.resolve(customPath.trim());
    if (fs.existsSync(resolvedPath)) {
      return resolvedPath;
    }
    vscode.window.showWarningMessage(
      `Custom Chrome path not found: "${customPath}". Attempting auto-detection...`
    );
  }

  // 2. Standard system paths based on Operating System
  let paths: string[] = [];

  if (platform === 'win32') {
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const localAppData = process.env['LOCALAPPDATA'] || path.join(process.env['USERPROFILE'] || 'C:\\Users\\Default', 'AppData\\Local');

    paths = [
      // Google Chrome
      path.join(programFiles, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(programFilesX86, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(localAppData, 'Google\\Chrome\\Application\\chrome.exe'),
      // Microsoft Edge
      path.join(programFiles, 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(programFilesX86, 'Microsoft\\Edge\\Application\\msedge.exe'),
      // Brave Browser
      path.join(programFiles, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
      path.join(programFilesX86, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
      path.join(localAppData, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
    ];
  } else if (platform === 'darwin') {
    paths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
  } else if (platform === 'linux') {
    paths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/brave-browser',
      '/usr/bin/microsoft-edge',
      '/usr/bin/microsoft-edge-stable',
      '/snap/bin/chromium',
      '/var/lib/flatpak/exports/bin/org.chromium.Chromium',
    ];
  }

  // 3. Filter paths that actually exist
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // 4. Fallback: try locating from PATH env variable using 'which' or 'where'
  try {
    const checkCmd = platform === 'win32' ? 'where' : 'which';
    const binaries = platform === 'win32' 
      ? ['chrome.exe', 'msedge.exe', 'brave.exe'] 
      : ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'brave-browser', 'microsoft-edge'];

    // We block synchronously here just for path check during setup
    const { execSync } = require('child_process');
    for (const bin of binaries) {
      try {
        const result = execSync(`${checkCmd} ${bin}`, { stdio: [] }).toString().trim().split('\n')[0];
        if (result && fs.existsSync(result)) {
          return result;
        }
      } catch {
        // Continue searching
      }
    }
  } catch {
    // Ignore error
  }

  throw new Error(
    'Could not locate a compatible Chromium browser (Google Chrome, Microsoft Edge, Chromium, or Brave) on your system.\n' +
    'Please install Google Chrome or Edge, or specify the browser executable path in the settings ("renderpage.chromePath").'
  );
}

/**
 * Spawns headless Chrome background process to print static HTML to PDF offline.
 */
export async function printHtmlToPdf(
  htmlFilePath: string,
  pdfOutputPath: string,
  chromePath: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Arguments to run Chrome securely and silently in headless printing mode
    const args = [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--incognito',
      '--disable-cache',
      '--disk-cache-size=0',
      '--media-cache-size=0',
      '--no-pdf-header-footer', // Disable browser default headers in favor of custom styles
      `--print-to-pdf=${pdfOutputPath}`,
      htmlFilePath
    ];

    execFile(chromePath, args, (error, stdout, stderr) => {
      if (error) {
        reject(
          new Error(
            `Chrome execution failed.\n` +
            `Error message: ${error.message}\n` +
            `Details: ${stderr || stdout}`
          )
        );
      } else {
        resolve();
      }
    });
  });
}
