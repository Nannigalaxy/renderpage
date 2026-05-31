export interface NotebookCellOutput {
  output_type: 'stream' | 'display_data' | 'execute_result' | 'error';
  name?: 'stdout' | 'stderr';
  text?: string | string[];
  data?: {
    [key: string]: string | string[] | any;
  };
  ename?: string;
  evalue?: string;
  traceback?: string[];
  execution_count?: number;
  metadata?: any;
}

export interface NotebookCell {
  cell_type: 'markdown' | 'code' | 'raw';
  execution_count?: number | null;
  metadata: any;
  source: string | string[];
  outputs?: NotebookCellOutput[];
}

export interface NotebookMetadata {
  kernelspec?: {
    display_name?: string;
    language?: string;
    name?: string;
  };
  language_info?: {
    name?: string;
    file_extension?: string;
    mimetype?: string;
    codemirror_mode?: any;
    pygments_lexer?: string;
  };
  [key: string]: any;
}

export interface Notebook {
  cells: NotebookCell[];
  metadata: NotebookMetadata;
  nbformat: number;
  nbformat_minor: number;
}

/**
 * Normalizes multi-line string arrays (typical in Jupyter JSON) into a single string.
 */
export function joinSource(source: string | string[]): string {
  if (Array.isArray(source)) {
    return source.join('');
  }
  return source || '';
}

/**
 * Parses raw JSON string into a structured Notebook object.
 */
export function parseNotebook(jsonContent: string): Notebook {
  try {
    const raw = JSON.parse(jsonContent);
    
    if (!raw.cells || !Array.isArray(raw.cells)) {
      throw new Error("Invalid Jupyter Notebook: 'cells' is missing or not an array.");
    }
    
    return {
      cells: raw.cells.map((cell: any) => ({
        cell_type: cell.cell_type,
        execution_count: cell.execution_count,
        metadata: cell.metadata || {},
        source: cell.source || '',
        outputs: cell.outputs || []
      })),
      metadata: raw.metadata || {},
      nbformat: raw.nbformat || 4,
      nbformat_minor: raw.nbformat_minor || 0
    };
  } catch (err: any) {
    throw new Error(`Failed to parse Jupyter Notebook: ${err.message}`);
  }
}
