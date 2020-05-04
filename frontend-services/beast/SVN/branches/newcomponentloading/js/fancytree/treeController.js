/**
 * This class is responsible for the tree structure and the functionality of the tree.
 * When it's instantiated it creates a controller from treeControllerInterface and creates an array that takes the
 * data created by createLibs(). Then it builds the JSON (createBasicStructure) to allow the fancytree framework to
 * build the tree-UI (buildtree()).
 */
class TreeController {
    constructor(controller, BeastController) {
        /**
         * Deletes a single component specified by the given node
         *
         * @param treeNode
         */
        this.deleteComponent = (treeNode) => {
            let key = treeNode.key;
            console.log("test");
            if (this.BeastController.deleteSingleComponent(key)) {
                treeNode.remove();
            }
            else {
                //TODO generate a Dialog here or in the BeastController
            }
        };
        /**
         * Delete a component from a library and notify the controller about the change on the library
         * TODO simplify so far, that components get deleted by specifying their gobal ID
         * @param event
         * @param treeNode
         * @param lib
         */
        this.deleteComponents = (event, treeNode, lib) => {
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
            let controller = this.BeastController;
            if (nodeSize > 0) {
                $('<div></div>')
                    .dialog({
                    title: 'Do you really want to delete the selected node(s)?',
                    modal: true,
                    width: 450,
                    buttons: [
                        {
                            text: 'Delete', click: function () {
                                for (let n of node) {
                                    let key = n.key;
                                    //FIXME
                                    //controller.removeComponent(key);
                                    n.remove();
                                }
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
        this.BeastController = BeastController;
        this.controller = controller;
        this.treeData = this.BeastController.getLibraries();
        this.createBasicStructure();
        this.buildTree(this.controller);
        $('#delete')
            .on('click', { mode: 'multi' }, this.deleteComponents);
    }
    /**
     * createBasicStructure() constructs the basis data structure.
     */
    createBasicStructure() {
        let nodeStructure = [];
        let libraries = this.treeData;
        let i = 0;
        for (let lib in libraries) {
            let libNode = {
                title: libraries[i].name, folder: true, hideCheckbox: true, key: libraries[i].ID
            };
            nodeStructure.push(libNode);
            nodeStructure[i].children = [];
            let components = libraries[i].components;
            let j = 0;
            for (let comp in components) {
                let compNode = {
                    title: components[j].name, data: new GlobalComponentTypeID(libraries[i].ID, components[j].ID)
                };
                nodeStructure[i].children.push(compNode);
                j += 1;
            }
            i += 1;
        }
        this.treeStructure = nodeStructure;
    }
    /**
     * addLibrary() adds a new LibraryNode to treeStructure
     * @param lib
     */
    addLibrary(lib) {
        let tree = $('#tree')
            .fancytree('getTree');
        let activeNode = tree.getRootNode();
        activeNode.addChildren({
            title: lib.name, folder: true, hideCheckbox: true, key: lib.ID
        });
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
    searchTree(lib, key, parent) {
        let isBasic = false;
        let indexLib = -1;
        let indexComp = -1;
        for (let library in lib) {
            //if node represents a component
            if (lib[library].ID == parent) {
                //FIXME keys have changed
                isBasic = (parent == 'Basic Components' || parent == 'Compound Components') ? true : false;
                for (let comp in lib[library].components) {
                    if (lib[library].components[comp].ID == key) {
                        indexLib = Number(library);
                        indexComp = Number(comp);
                    }
                }
            }
            else if (lib[library].ID == key) {
                //FIXME keys have changed
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
     * buildTree() creates the tree in the document. This method uses the fancytree framework.
     * @param controller
     */
    buildTree(controller) {
        let treeController = this; //passed to the callback
        $('#tree')
            .fancytree({
            checkbox: true,
            debugLevel: 0,
            selectMode: 3,
            source: this.treeStructure,
            extensions: ['contextMenu', 'dnd', 'edit'],
            contextMenu: {
                menu: {
                    'edit': { name: 'Edit', 'icon': 'edit' },
                    'sep1': '---------',
                    'delete': { name: 'Delete', 'icon': 'delete' }
                },
                actions: function (node, action, options) {
                    if (action = 'Delete') {
                        treeController.deleteComponent(node);
                    }
                }
            },
            loadChildren: function (event, ctx) {
                ctx.node.fixSelection3AfterClick();
            },
            select: function (event, data) {
                // Get a list of all selected nodes, and convert to a key array:
                let selKeys = $.map(data.tree.getSelectedNodes(), function (node) {
                    return node.key;
                });
                // Get a list of all selected TOP nodes
                let selRootNodes = data.tree.getSelectedNodes(true);
                // ... and convert to a key array:
                let selRootKeys = $.map(selRootNodes, function (node) {
                    return node.key;
                });
            },
            dblclick: function (event, data) {
                // edit function
                return true;
            },
            keydown: function (event, data) {
                if (event.which === 16) {
                    data.node.toggleSelected();
                    return true;
                }
            },
            dnd: {
                autoExpandMS: 400,
                focusOnClick: true,
                preventVoidMoves: true,
                preventRecursiveMoves: true,
                dragStart: function (node, data) {
                    let source = data.node;
                    //FIXME Keys have changed
                    let sourceValid = !(source.parent.key == 'Basic Components' || source.parent.key == 'Compound Components');
                    if (!sourceValid) {
                        return false;
                    }
                    else {
                        return true;
                    }
                },
                dragEnter: function (node, data) {
                    /** data.otherNode may be null for non-fancytree droppables.
                     *  Return false to disallow dropping on node. In this case
                     *  dragOver and dragLeave are not called.
                     *  Return 'over', 'before, or 'after' to force a hitMode.
                     *  Return ['before', 'after'] to restrict available hitModes.
                     *  Any other return value will calc the hitMode from the cursor position.
                     */
                    // Prevent dropping a parent below another parent (only sort
                    // nodes under the same parent)
                    /*           if(node.parent !== data.otherNode.parent){
                     return false;
                     }
                     // Don't allow dropping *over* a node (would create a child)
                     return ["before", "after"];
                     */
                    let target = data.node;
                    let title = target.title;
                    let parentkey = target.parent.key;
                    //FIXME keys have changed
                    let targetValid = (title == 'Compound Components' || title == 'Basic Components' || parentkey == 'Compound Components' || parentkey == 'Basic Components');
                    if (targetValid) {
                        return false;
                    }
                    else {
                        return true;
                    }
                },
                dragDrop: function (node, data) {
                    /** This function MUST be defined to enable dropping of items on
                     *  the tree.
                     */
                    data.otherNode.moveTo(node, data.hitMode);
                }
            },
            activate: function (event, data) {
            }
        });
        $('#tree ul')
            .addClass('flex-grow-equal');
    }
    ;
}
//# sourceMappingURL=treeController.js.map