import * as monaco from 'monaco-editor';

export interface IFileContent {
    name: string;
    content: string;
    reload: boolean;
    markers: monaco.editor.IMarkerData[];
    severity: monaco.MarkerSeverity;
}

export interface ILanguage {
    name: string;
    BPUType: string;
    hideFiles: boolean;
    NamesRegex: RegExp;
    wrongNamesError: string;
    canAddFiles: boolean;   //kann man auch rausnehmen
    canAddFolders: boolean;
    canDeleteFiles: boolean;
    editorLanguage: string;
    makefile: string;
}

export interface IExample {
    BPUType: string;
    PSPUType: string;
    language: ILanguage;
    name: string;
    files: IFileContent[];
}

export interface IProject {
    BPUType: string;
    PSPUType: string;
    language: ILanguage;
    name: string;
    files: IFileContent[];
}

/**
 * the interface for a general arduino board
 * @typedef IBoard
 * @property name               - the name of the board
 * @property FQBN               - the Fully-Qualified-Board-Name of the board
 * @property config_options     - the configuration-options of the board with all their possible values
 */
export interface IBoard {
    name: string;
    FQBN: string;
    config_options: Array<{option: string, option_label: string, values: Array<{value: string, value_label: string}>}>;
}

/**
 * the interface for a specific arduino board
 * @typedef IBoardConfiguration
 * @property name       - the name of the board
 * @property FQBN       - the Fully-Qualified-Board-Name of the board
 * @property options    - the configuration-options of the board with their chosen value
 */
export interface IBoardConfiguration {
    name: string;
    FQBN: string;
    options: Array<{option: string, option_label: string, value: string, value_label: string}>;
}

export interface IModel {
    files: IFileContent[];
    loadfiles: IFileContent[]; //used for loading a project via zip or .wide
    selectedFile: string;
    parentDirectory: string;
    selected_board: IBoardConfiguration;
    supportedBoards: Array<IBoard>;

    examples: IExample[];
    projects: IProject[];
    currentprojects: IProject[];
    selectedproject: IProject;

    isCompiling: boolean;
    isUploading: boolean;

    consoleOutput: string;
    isConsoleVisible: boolean;
}

const C: ILanguage = {name: "C", BPUType: "MicroController", hideFiles: false, NamesRegex: /^[a-zA-Z0-9|_]{1,}[.]{1}[ch]{1}$/, wrongNamesError: "Can only compile: .c, .h", canAddFiles: true, canAddFolders: true, canDeleteFiles: true, editorLanguage: "cpp", makefile: 'avr-gcc'};
const VHDL: ILanguage = {name: "VHDL", BPUType: "ProgrammableLogicDevice",  hideFiles: false,  NamesRegex: /^out.vhd$/,wrongNamesError: "Can only compile: out.vhd", canAddFiles: false, canAddFolders: false, canDeleteFiles: false, editorLanguage: "vhdl", makefile: 'vhdl'};
const LogIC: ILanguage = {name: "LogIC", BPUType: "ProgrammableLogicDevice",  hideFiles: false, NamesRegex: /^[a-zA-Z0-9|_]{1,}[.]{1}(logic){1}$/, wrongNamesError: "Can only compile: .logic", canAddFiles: false, canAddFolders: false, canDeleteFiles: false, editorLanguage: "logic", makefile: 'elws'};
const Arduino: ILanguage = {name: "Arduino", BPUType: "MicroController", hideFiles: true, NamesRegex: /^[a-zA-Z0-9|_]{1,}[.]{1}(ino){1}$/, wrongNamesError: "Can only compile: .ino", canAddFiles: true, canAddFolders: false, canDeleteFiles: true, editorLanguage: "cpp", makefile: 'arduino'};

export const supportedLanguages = [C, VHDL, LogIC, Arduino];



