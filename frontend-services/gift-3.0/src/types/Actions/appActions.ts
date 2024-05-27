
import { EditorStateActionTypes } from './editorStateActions';
import { ViewConfigActionTypes } from './viewConfig';

export const UNDO = "UNDO"
export const REDO = "REDO"





export const LOAD_STATE_FROM_FILE = "LOAD_STATE_FROM_FILE"
















export interface UndoAction{
    type: typeof UNDO;
}

export interface RedoAction{
    type: typeof REDO;
}

export interface LoadStateFromFile{
    type: typeof LOAD_STATE_FROM_FILE;
    payload: JSON
}

/**
 * Alle moeglichen Actions 
 */
export type AppActions = ViewConfigActionTypes | EditorStateActionTypes | UndoAction | RedoAction | LoadStateFromFile;