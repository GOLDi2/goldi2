/**
 * Created by mseeber on 5/10/17.
 */
///<reference path="../model/model.ts" />
///<reference path="../d_ts/jquery.d.ts" />
//fixme replace with interface description of real modules
//forward declaration (remove when modules are implemented)
/**
 * This class contains all startup logic for BEAST and thus marks the entry point
 * when using beast.
 */
class BeastController {
    constructor() {
        /**
         * deleteComponent() allows deleting selected elements in the tree, while also deleting it in the data structure.
         *
         * @param event
         */
        this.deleteComponent = (event, treeNode) => {
            let mode = (event == null) ? 'single' : event.data.mode;
            let nodeSize = 0;
            let node;
            let lib;
            let key;
            let parent;
            let searchResults;
            let indexLib;
            let indexComp;
            let isBasic;
            lib = this.getLibraries();
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
                                    searchResults = searchTree(lib, key, parent);
                                    isBasic = searchResults.isBasic;
                                    indexLib = searchResults.indexLib;
                                    indexComp = searchResults.indexComp;
                                    console.log(searchResults);
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
        };
        /**
         * setLibraries is a setter for 'libraries' that belongs to the object of the BeastController
         * @param libraries
         */
        this.setLibraries = (libraries) => {
            this.libraries = libraries;
        };
        this.persistenceController = new PersistenceController(this);
        this.libraries = createBasicLibs();
        this.treeController = new treeController(this);
        this.workspaceController = new WorkspaceController();
        this.menubarController = new menubarController(this);
        $('#delete')
            .on('click', { mode: 'multi' }, this.deleteComponent);
    }
    /**
     * modelChanged() is called when the model is changed.
     * @param type DataType which changed
     */
    modelChanged(type) {
        //TODO Call the responding controllers for updates
        switch (type) {
            case DataType.Connectors:
            case DataType.Components:
            case DataType.Libraries:
            case DataType.Project:
        }
    }
    /**
     *
     * @returns {PersistenceController}
     */
    getPersistenceController() {
        return this.persistenceController;
    }
    /**
     * Example method for adding Javascript
     * @param circuit
     */
    static registerDefaultComponent(circuit) {
    }
    /**
     *
     * @returns {Array<Library>}
     */
    getLibraries() {
        return this.libraries;
    }
}
/**
 * createBasicLibs() creates the demo libraries to be worked on.
 * @returns {[Library,Library]}
 */
function createBasicLibs() {
    //Changed some device names back to the original simcir
    // ones to be able to add these devices to the workspace
    //    -Engelhardt, 9.6.
    const Lib1 = new Library('Basic Components');
    Lib1.components = [
        new Component('Toggle', [], []),
        new Component('PushOn', [], []),
        new Component('PushOff', [], []),
        new Component('NOT', [], []),
        new Component('AND', [], []),
        new Component('OR', [], []),
        new Component('NAND', [], []),
        new Component('NOR', [], []),
        new Component('EOR', [], []),
        new Component('ENOR', [], []),
        new Component('Buffer', [], []),
        new Component('Oscillator', [], []),
        new Component('DC', [], []),
        new Component('7seg', [], []),
        //new Component('7-Segment-Display', [], []),
        new Component('16seg', [], []),
        //new Component('16-Segment-Display', [], []),
        new Component('Rotary-Encoder', [], []),
        new Component('BusIn', [], []),
        new Component('BusOut', [], []),
        new Component('4Bit7Seg', [], []),
        new Component('DSO', [], []),
        new Component('Label', [], [])
    ];
    const Lib2 = new Library('Compound Components');
    Lib2.components = [
        new Component('RS Flip-Flop', [], []),
        new Component('T Flip-Flop', [], []),
        new Component('D Flip-Flop', [], []),
        new Component('JK Flip-Flop', [], []),
        new Component('8 Bit Counter', [], []),
        new Component('Half Adder', [], []),
        new Component('Full Adder', [], []),
        new Component('4bit Adder', [], []),
        new Component('2to4 Binary Decoder', [], []),
        new Component('3to8 Binary Decoder', [], []),
        new Component('4to16 Binary Decoder', [], [])
    ];
    return [Lib1, Lib2];
}
/**
 * Provides a search function, that returns the position of an element in the tree structure. It also finds out, if
 * the element is basic or not.
 *
 *
 * @param lib
 * @param key
 * @param parent
 * @returns {{isBasic: any, indexLib: number, indexComp: number}}
 */
function searchTree(lib, key, parent) {
    let isBasic = false;
    let indexLib = -1;
    let indexComp = -1;
    for (let library in lib) {
        //if node represents a component
        if (lib[library].name == parent) {
            isBasic = (parent == 'Basic Components' || parent == 'Compound Components') ? true : false;
            for (let comp in lib[library].components) {
                if (lib[library].components[comp].name == key) {
                    indexLib = Number(library);
                    indexComp = Number(comp);
                }
            }
        }
        else if (lib[library].name == key) {
            isBasic = (key == 'Basic Components' || key == 'Compound Components') ? true : false;
            indexLib = Number(library);
            indexComp = -1;
        }
    }
    return {
        isBasic: isBasic,
        indexLib: indexLib,
        indexComp: indexComp
    };
}
;
/**
 * creates a new BeastController
 */
$(document)
    .ready(function () {
    new BeastController();
});
//# sourceMappingURL=BeastController.js.map