import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';
import * as Prism from 'prismjs';
import * as katex from 'katex';

// Load language support for syntax highlighting
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-julia';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

import { Notebook, NotebookCell, NotebookCellOutput, joinSource } from './notebookParser';
import { getBaseStyles, StyleOptions } from '../styles/defaultCss';

/**
 * Detects the primary programming language of the notebook.
 */
function getNotebookLanguage(notebook: Notebook): string {
  if (notebook.metadata?.language_info?.name) {
    return notebook.metadata.language_info.name.toLowerCase();
  }
  if (notebook.metadata?.kernelspec?.language) {
    return notebook.metadata.kernelspec.language.toLowerCase();
  }
  return 'python';
}

/**
 * Determines the language of an individual cell, checking for Jupyter magic commands.
 */
function getCellLanguage(rawSource: string, defaultLanguage: string): { language: string; isMagic: boolean } {
  const trimmed = rawSource.trim();
  if (trimmed.startsWith('%%')) {
    const lines = trimmed.split('\n');
    const firstLine = lines[0].trim();
    // Match '%%lang' or '%%lang optional arguments'
    const match = firstLine.match(/^%%([a-zA-Z0-9_\-+]+)/);
    if (match) {
      const magicName = match[1].toLowerCase();
      
      // Map common cell magic commands to standard language identifiers
      const magicMapping: { [key: string]: string } = {
        'bash': 'bash',
        'sh': 'bash',
        'shell': 'bash',
        'javascript': 'javascript',
        'js': 'javascript',
        'typescript': 'typescript',
        'ts': 'typescript',
        'html': 'html',
        'css': 'css',
        'sql': 'sql',
        'latex': 'markdown', // Map LaTeX cell magic to markdown for offline representation
        'markdown': 'markdown',
        'md': 'markdown',
        'python': 'python',
        'py': 'python',
        'python3': 'python',
        'r': 'r',
        'julia': 'julia',
        'ruby': 'ruby',
        'perl': 'perl',
      };

      if (magicMapping[magicName]) {
        return {
          language: magicMapping[magicName],
          isMagic: true
        };
      }
    }
  }

  return {
    language: defaultLanguage,
    isMagic: false
  };
}

/**
 * Retrieves the Prism language name and grammar definition.
 * Falls back to plaintext if the language is unsupported.
 */
function getPrismLanguage(lang: string): { name: string; definition: any } {
  const normalized = lang.toLowerCase();
  
  const mapping: { [key: string]: string } = {
    'python3': 'python',
    'py': 'python',
    'r': 'r',
    'julia': 'julia',
    'javascript': 'javascript',
    'js': 'javascript',
    'typescript': 'typescript',
    'ts': 'typescript',
    'bash': 'bash',
    'sh': 'bash',
    'shell': 'bash',
    'c++': 'cpp',
    'cpp': 'cpp',
    'c': 'c',
    'sql': 'sql',
    'java': 'java',
    'scala': 'scala',
    'rust': 'rust',
    'go': 'go',
    'yaml': 'yaml',
    'yml': 'yaml',
    'json': 'json',
    'markdown': 'markdown',
    'md': 'markdown',
    'html': 'markup',
    'xml': 'markup',
    'svg': 'markup',
    'css': 'css'
  };

  const target = mapping[normalized] || normalized;
  
  if (Prism.languages[target]) {
    return { name: target, definition: Prism.languages[target] };
  }

  // Fallback to plain text if not found
  return { 
    name: 'plaintext', 
    definition: Prism.languages.plaintext || Prism.languages.plain || {} 
  };
}


/**
 * Strips ANSI color escape codes from Jupyter error tracebacks.
 */
function stripAnsiCodes(text: string): string {
  return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

/**
 * Extracts LaTeX math patterns from Markdown text and replaces them with temporary placeholders.
 * Renders the math to KaTeX HTML synchronously to ensure 100% offline accuracy.
 */
function extractAndRenderMath(text: string): { processed: string; placeholders: Map<string, string> } {
  const placeholders = new Map<string, string>();
  let tempText = text;
  let counter = 0;

  // 1. Process Display Math: $$ ... $$
  tempText = tempText.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false
      });
      const key = `%%DISPLAY_MATH_PLACEHOLDER_${counter++}%%`;
      placeholders.set(key, rendered);
      return key;
    } catch (e) {
      return `$$${math}$$`;
    }
  });

  // 2. Process Inline Math: $ ... $ (avoid matching single dollar signs like currency $10)
  tempText = tempText.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    if (/^\d+(?:\.\d+)?$/.test(math.trim())) {
      return `$${math}$`;
    }
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false
      });
      const key = `%%INLINE_MATH_PLACEHOLDER_${counter++}%%`;
      placeholders.set(key, rendered);
      return key;
    } catch (e) {
      return `$${math}$`;
    }
  });

  return { processed: tempText, placeholders };
}

/**
 * Replaces math placeholders with their pre-rendered KaTeX HTML.
 */
function restoreMath(html: string, placeholders: Map<string, string>): string {
  let result = html;
  for (const [placeholder, katexHtml] of placeholders.entries()) {
    result = result.replaceAll(placeholder, katexHtml);
  }
  return result;
}

/**
 * Generates beautiful static HTML representation of a Jupyter Notebook.
 */
export async function renderNotebookToHtml(
  notebook: Notebook,
  notebookName: string,
  options: StyleOptions
): Promise<string> {
  
  // Try to load KaTeX offline styles dynamically
  let katexCss = '';
  try {
    const distPath = path.dirname(require.resolve('katex'));
    const katexCssPath = path.join(distPath, 'katex.min.css');
    if (fs.existsSync(katexCssPath)) {
      let cssContent = fs.readFileSync(katexCssPath, 'utf8');
      // Convert font relative paths to absolute file:// paths to prevent FOIT (Flash of Invisible Text) in headless print
      const absoluteFontsPath = path.join(distPath, 'fonts').replace(/\\/g, '/');
      const fileUrlBase = absoluteFontsPath.startsWith('/') ? `file://${absoluteFontsPath}` : `file:///${absoluteFontsPath}`;
      cssContent = cssContent.replace(/url\(fonts\//g, `url(${fileUrlBase}/`);
      // Also change font-display: block to font-display: swap to prevent invisible text
      cssContent = cssContent.replace(/font-display:block/g, 'font-display:swap');
      katexCss = cssContent;
    }
  } catch (err) {
    console.warn('Failed to load KaTeX offline CSS styles:', err);
  }

  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const baseStyles = getBaseStyles({
    ...options,
    notebookName,
    dateStr
  });

  // 1. Determine if the notebook uses multiple programming languages
  const notebookLang = getNotebookLanguage(notebook);
  const uniqueLanguages = new Set<string>();
  for (const cell of notebook.cells) {
    if (cell.cell_type === 'code') {
      const rawSource = joinSource(cell.source);
      const cellLangInfo = getCellLanguage(rawSource, notebookLang);
      const { name: prismLangName } = getPrismLanguage(cellLangInfo.language);
      uniqueLanguages.add(prismLangName);
    }
  }
  const hasMultipleLanguages = uniqueLanguages.size > 1;

  // 2. Render individual notebook cells
  const renderedCells: string[] = [];
  
  for (const cell of notebook.cells) {
    const rawSource = joinSource(cell.source);
    
    if (cell.cell_type === 'markdown') {
      if (!rawSource.trim()) {continue;}
      // 1. Process KaTeX math formulas offline
      const { processed, placeholders } = extractAndRenderMath(rawSource);
      // 2. Render standard Markdown
      const htmlMarkdown = await marked.parse(processed);
      // 3. Restore KaTeX equations into markdown
      const finalHtml = restoreMath(htmlMarkdown, placeholders);
      
      renderedCells.push(`
        <div class="cell markdown-cell">
          ${finalHtml}
        </div>
      `);
    } else if (cell.cell_type === 'code') {
      const cellLangInfo = getCellLanguage(rawSource, notebookLang);
      const { name: prismLangName, definition: prismLangDef } = getPrismLanguage(cellLangInfo.language);
      
      // Syntax highlight the code cell
      const highlightedCode = Prism.highlight(rawSource, prismLangDef, prismLangName);
      
      const executionCount = cell.execution_count !== undefined && cell.execution_count !== null
        ? `[${cell.execution_count}]`
        : '[ ]';

      // Render cell outputs
      let outputsHtml = '';
      if (cell.outputs && cell.outputs.length > 0) {
        outputsHtml = `
          <div class="cell-outputs">
            ${cell.outputs.map(out => renderCellOutput(out)).join('')}
          </div>
        `;
      }

      const cellInfoText = hasMultipleLanguages
        ? `In ${executionCount} &middot; ${prismLangName}`
        : `In ${executionCount}`;

      renderedCells.push(`
        <div class="cell code-cell">
          <div class="cell-info">${cellInfoText}</div>
          <div class="cell-input">
            <pre class="cell-source"><code class="language-${prismLangName}">${highlightedCode}</code></pre>
          </div>
          ${outputsHtml}
        </div>
      `);
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(options.title || notebookName)}</title>
      <style>
        ${baseStyles}
        ${katexCss}
      </style>
    </head>
    <body>
      <div class="notebook-container">
        ${options.enableHeaderBlock !== false ? `
        <div class="notebook-header-block">
          <h1 class="notebook-title">${escapeHtml(options.title || notebookName)}</h1>
          
          ${(options.author || options.enableDate !== false) ? `
          <div class="notebook-meta-row">
            ${options.author ? `<span class="meta-author">By <b>${escapeHtml(options.author)}</b></span>` : ''}
            ${options.enableDate !== false ? `<span class="meta-date">Date: <b>${dateStr}</b></span>` : ''}
          </div>
          ` : ''}
          
          ${options.description ? `
          <div class="notebook-description">
            ${escapeHtml(options.description.split(/\s+/).slice(0, 200).join(' ')).replace(/\n/g, '<br/>')}
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        <div class="notebook-cells">
          ${renderedCells.join('<hr />')}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Renders individual execution outputs from Jupyter code cells.
 */
function renderCellOutput(output: NotebookCellOutput): string {
  switch (output.output_type) {
    case 'stream':
      const text = joinSource(output.text || '');
      return `
        <div class="output-container output-stream">
          <div class="output-info">${output.name || 'output'}</div>
          <pre class="output-text">${escapeHtml(text)}</pre>
        </div>
      `;

    case 'execute_result':
    case 'display_data':
      if (!output.data) {return '';}
      
      // 1. Check for PNG/JPEG image outputs
      if (output.data['image/png']) {
        const base64 = joinSource(output.data['image/png']).trim().replace(/\s/g, '');
        return `
          <div class="output-container output-image">
            <img class="output-image-element" src="data:image/png;base64,${base64}" alt="Figure Output" />
          </div>
        `;
      }
      if (output.data['image/jpeg']) {
        const base64 = joinSource(output.data['image/jpeg']).trim().replace(/\s/g, '');
        return `
          <div class="output-container output-image">
            <img class="output-image-element" src="data:image/jpeg;base64,${base64}" alt="Figure Output" />
          </div>
        `;
      }
      
      // 2. Check for SVG image outputs
      if (output.data['image/svg+xml']) {
        const svgContent = joinSource(output.data['image/svg+xml']);
        // Inline SVG safely
        return `
          <div class="output-container output-image output-svg">
            <div class="output-content">${svgContent}</div>
          </div>
        `;
      }

      // 3. Check for HTML outputs (like Pandas dataframes or rich widget tables)
      if (output.data['text/html']) {
        const html = joinSource(output.data['text/html']);
        return `
          <div class="output-container output-html">
            <div class="output-content output-html-content">${html}</div>
          </div>
        `;
      }

      // 4. Fallback to standard Text output
      if (output.data['text/plain']) {
        const textPlain = joinSource(output.data['text/plain']);
        return `
          <div class="output-container output-result">
            <div class="output-info">output</div>
            <pre class="output-text">${escapeHtml(textPlain)}</pre>
          </div>
        `;
      }
      return '';

    case 'error':
      const traceback = (output.traceback || []).join('\n');
      const cleanTraceback = stripAnsiCodes(traceback);
      return `
        <div class="output-container output-error">
          <div class="output-info">error [${output.ename || 'Exception'}]</div>
          <pre class="output-error-text">${escapeHtml(cleanTraceback || output.evalue || '')}</pre>
        </div>
      `;

    default:
      return '';
  }
}

/**
 * Escapes HTML special characters.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
