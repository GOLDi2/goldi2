/**
 * This class is responsible for the tree structure and the functionality of the tree.
 * When it's instantiated it creates a controller from treeControllerInterface and creates an array that takes the
 * data created by createLibs(). Then it builds the JSON (createBasicStructure) to allow the fancytree framework to
 * build the tree-UI (buildtree()).
 */
class treeController {
    constructor(controller) {
        this.controller = controller;
        this.basicLibs = this.controller.getLibraries();
        this.createBasicStructure();
        this.buildTree(this.controller);
    }
    /**
     * createBasicStructure() constructs the basis data structure.
     */
    createBasicStructure() {
        this.treeStructure = [
            {
                title: this.basicLibs[0].name, folder: true, hideCheckbox: true, key: 'Basic Components',
                children: []
            },
            {
                title: this.basicLibs[1].name, folder: true, hideCheckbox: true, key: 'Compound Components',
                children: []
            },
            {
                title: 'Deposit', folder: true, hideCheckbox: true, key: 'deposit',
                children: []
            }
        ];
        let iter1 = 0;
        for (let elem in this.basicLibs[0].components) {
            this.treeStructure[0].children[iter1] = { title: this.basicLibs[0].components[iter1].name, key: this.basicLibs[0].components[iter1].name };
            iter1 += 1;
        }
        let iter2 = 0;
        for (let elem in this.basicLibs[1].components) {
            this.treeStructure[1].children[iter2] = { title: this.basicLibs[1].components[iter2].name, key: this.basicLibs[1].components[iter2].name };
            iter2 += 1;
        }
    }
    /**
     * buildTree() creates the tree in the document. This method uses the fancytree framework.
     * @param controller
     */
    buildTree(controller) {
        $('#tree')
            .fancytree({
            checkbox: true,
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
                        controller.deleteComponent(null, node);
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
                data.node.toggleSelected();
                return true;
            },
            keydown: function (event, data) {
                if (event.which === 32) {
                    data.node.toggleSelected();
                    return false;
                }
            },
            dnd: {
                autoExpandMS: 400,
                focusOnClick: true,
                preventVoidMoves: true,
                preventRecursiveMoves: true,
                dragStart: function (node, data) {
                    /** This function MUST be defined to enable dragging for the tree.
                     *  Return false to cancel dragging of node.
                     */
                    return true;
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
                    return true;
                },
                dragDrop: function (node, data) {
                    /** This function MUST be defined to enable dropping of items on
                     *  the tree.
                     */
                    data.otherNode.moveTo(node, data.hitMode);
                }
            },
            activate: function (event, data) {
                //        alert("activate " + data.node);
            }
        });
        $('#tree ul').addClass('flex-child');
    }
    ;
}
//# sourceMappingURL=treeController.js.map