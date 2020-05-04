/**
 * Created by mseeber on 5/10/17.
 */
///<reference path="./common.ts" />
///<reference path="../model/model.ts" />
///<reference path="../fancytree/treeController.ts" />
///<reference path="../d_ts/jquery.d.ts" />
///<reference path="../d_ts/simcir.d.ts" />
/**
 * This class contains all startup logic for BEAST and thus marks the entry point
 * when using beast.
 */
class BeastController {
    constructor() {
        this.READ_ONLY_LIB_IDS = ['beast-basic', 'beast-basic-compound', 'beast-deposit'];
        /**
         * deleteComponent() allows deleting selected elements in the tree, while also deleting it in the data structure.
         *
         * @param event
         */
        this.deleteComponent = (event, treeNode) => {
            let persist = this.persistenceController;
            let p = persist.getCurrentProject();
            let lib = p.libraries;
            let key;
            let parent;
            let searchResults;
            let indexLib;
            let indexComp;
            let isBasic;
            let mode = (event == null) ? 'single' : event.data.mode;
            let nodeSize = 0;
            let node;
            if (mode == 'multi') {
                node = $('#tree')
                    .fancytree('getTree')
                    .getSelectedNodes();
                nodeSize = node.length;
            }
            else if (mode == 'single') {
                node = treeNode;
                nodeSize = 1;
            }
            //needed to access tree controller from callback
            let treeController = this.getTreeController();
            //TODO move into treecontroller.ts
            if (nodeSize > 0) {
                $('<div></div>')
                    .dialog({
                    title: 'Do you really want to delete the selected node?',
                    modal: true,
                    width: 450,
                    buttons: [
                        {
                            text: 'Delete', click: function () {
                                for (let i = 0; i < nodeSize; i++) {
                                    if (mode == 'multi') {
                                        key = node[i].key;
                                        parent = node[i].parent.key;
                                    }
                                    else if (mode == 'single') {
                                        key = node.key;
                                        parent = node.parent.key;
                                    }
                                    //TODO maybe change to instance method call?
                                    searchResults = treeController.searchTree(lib, key, parent);
                                    isBasic = searchResults.isBasic;
                                    indexLib = searchResults.indexLib;
                                    indexComp = searchResults.indexComp;
                                    if (true /*!isBasic*/) {
                                        //Component selected.
                                        if (indexComp != -1) {
                                            lib[indexLib].components.splice(Number(indexComp), 1);
                                        }
                                        else {
                                            lib.splice(Number(indexLib), 1);
                                        }
                                        if (mode == 'multi') {
                                            node[i].remove();
                                        }
                                        else if (mode == 'single') {
                                            node.remove();
                                        }
                                    }
                                }
                                // Applies the changes to the data structure.
                                // TODO save the structure change in project and sessionstorage
                                //this.setLibraries(lib);
                                $(this)
                                    .dialog('destroy');
                            }
                        }, {
                            text: 'Cancel', click: function () {
                                $(this)
                                    .dialog('destroy');
                            }
                        }
                    ]
                });
            }
            //TODO is this assignment nescessary? isn't this pass by reference anyway?
            persist.getCurrentProject().libraries = p.libraries;
            persist.markDirty(DataType.Project);
            throw ("YOU SHALL NOT CALL THIS FUNCTION, it is deprecated");
        };
        /**
         * TODO FIXME this should not be public
         * setLibraries is a setter for 'libraries' that belongs to the object of the BeastController
         * @param libraries
         */
        this.setLibraries = (libraries) => {
            // this.userLibrarys = libraries;
        };
        this.persistenceController = new PersistenceController(this);
        this.organizeData();
        this.treeController = new TreeController(this, this);
        this.workspaceController = new WorkspaceController(this);
        this.menubarController = new menubarController(this);
    }
    getTreeController() {
        return this.treeController;
    }
    /**
     * returns the Library of the given key or null if no
     * Library with the given key exists.
     *
     * @param id Project-unique Library ID
     * @returns {any} Library or null
     */
    resolveLibrary(id) {
        //handle the special libs
        if (id == this.basicComponents.ID)
            return this.basicComponents;
        if (id == this.basicComplexComponents.ID)
            return this.basicComplexComponents;
        if (id == this.deposit.ID)
            return this.deposit;
        //handle the user libs
        for (let lib of this.userLibraries) {
            if (lib.ID == id) {
                return lib;
            }
        }
        //lib not found
        return null;
    }
    /**
     * Returns a Component Type from it's global ID
     *
     * @param id
     * @returns {Component} Component or null if no Component with corresponding key is found
     */
    resolveComponentType(id) {
        let lib = this.resolveLibrary(id.getLibraryID());
        for (let component of lib.components) {
            if (component.ID == id.getComponentID()) {
                return component;
            }
        }
        //component not found
        return null;
    }
    /**
     * modelChanged() is called when the model is changed.
     * @param type DataType which changed
     */
    modelChanged(type) {
        //TODO Call the responding controllers for updates
        switch (type) {
            case DataType.Info:
            case DataType.Connectors:
            case DataType.Components:
            case DataType.Libraries:
            case DataType.Project:
        }
    }
    /**
     * Allows the persistent use of data.
     * FIXME correct this comment ad function
     */
    organizeData() {
        let persist = this.persistenceController;
        let basics = this.createBasicLibs();
        this.basicComponents = basics[0];
        this.basicComplexComponents = basics[1];
        this.userLibraries = persist.getLibraries();
        this.deposit = new Library('beast-deposit', 'Deposit');
        //TODO encapsulate in a "save libs method"?
        persist.getCurrentProject().libraries = this.userLibraries.concat(this.deposit);
        persist.markDirty(DataType.Project);
    }
    /**
     * Checks if the specified Library is a basic read only Library
     *
     * @param library
     */
    isReadOnlyLibrary(library) {
        //is there a match in the list?
        return (this.READ_ONLY_LIB_IDS.indexOf(library.ID) >= 0);
    }
    /**
     * Deletes a single Component from the Project, specified by it's key
     * If the component can not be deleted due to dependencies,
     * this method returns false else true.
     *
     * @param key the global key of the component as string TODO new key format
     * @returns {boolean} false if the component can not be deleted.
     */
    deleteSingleComponent(key) {
        //FIXME implement me!
        //assert component is not in a readOnly Lib
        return false;
    }
    /**
     *
     * @returns {PersistenceController}
     */
    getPersistenceController() {
        return this.persistenceController;
    }
    /**
     * Registers a component as a basic component to BEAST
     * Registered components can later be referenced in the
     * Library for basic components
     */
    static registerDefaultComponent(component, key) {
    }
    /**
     * returns a list of all available libraries even read only ones
     *
     * @returns {Array<Library>}
     */
    getLibraries() {
        let libraries = Array();
        libraries.push(this.basicComponents);
        libraries.push(this.basicComplexComponents);
        libraries.concat(this.userLibraries);
        libraries.push(this.deposit);
        return libraries;
    }
    /**
     * createBasicLibs() creates the demo libraries to be worked on.
     * @returns {[Library,Library]}
     */
    createBasicLibs() {
        const BasicComponents = new Library('beast-basic', 'Basic Components');
        BasicComponents.components = [
            // id, name, components, connections
            new Component('Toggle', 'Toggle', [], []),
            new Component('PushOn', 'PushOn', [], []),
            new Component('PushOff', 'PushOff', [], []),
            new Component('NOT', 'NOT', [], []),
            new Component('AND', 'AND', [], []),
            new Component('OR', 'OR', [], []),
            new Component('NAND', 'NAND', [], []),
            new Component('NOR', 'NOR', [], []),
            new Component('XOR', 'XOR', [], []),
            new Component('ENOR', 'XNOR', [], []),
            new Component('BUF', 'Buffer', [], []),
            new Component('OSC', 'Oscillator', [], []),
            new Component('DC', 'DC', [], []),
            new Component('7seg', '7 Segment Display', [], []),
            new Component('16seg', '16 Segment Display', [], []),
            new Component('Rotary-Encoder', 'Rotary Encoder', [], []),
            new Component('BusIn', 'Bus In', [], []),
            new Component('BusOut', 'Bus Out', [], []),
            new Component('DSO', 'Digital Signal Oscilloscope', [], []),
            new Component('Label', 'Text Label', [], []),
            new Component('Transmitter', 'Transmitter', [], [])
        ];
        const CompoundComponents = new Library('beast-basic-compound', 'Compound Components');
        CompoundComponents.components = [
            new Component('RS-FF', 'RS Flip-Flop', [], []),
            new Component('T-FF', 'T Flip-Flop', [], []),
            new Component('D-FF', 'D Flip-Flop', [], []),
            new Component('JK-FF', 'JK Flip-Flop', [], []),
            new Component('8bitCounter', '8 Bit Counter', [], []),
            new Component('HalfAdder', 'Half Adder', [], []),
            new Component('FullAdder', 'Full Adder', [], []),
            new Component('4bitAdder', '4 Bit Adder', [], []),
            new Component('2to4BinaryDecoder', '2 to 4 Binary Decoder', [], []),
            new Component('3to8BinaryDecoder', '3 to 8 Binary Decoder', [], []),
            new Component('4to16BinaryDecoder', '4 to 16 Binary Decoder', [], [])
        ];
        return [BasicComponents, CompoundComponents];
    }
}
/**
 * creates a new BeastController
 */
$(document)
    .ready(function () {
    new BeastController();
});
//# sourceMappingURL=BeastController.js.map