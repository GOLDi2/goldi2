import FancytreeOptions = Fancytree.FancytreeOptions;

/**
 * Created by dorianmueller on 23.05.2017.
 * Reworked by Dario Götze
 */

/**
 * Interface to access the BeastController
 * getLibraries get the libraries from the BeastController whereas contextDelete() accesses the corresponding in the
 * BeastController
 * TODO either migrate to this and implement it in BEAST Controller or deprecate it
 */
interface treeControllerInterface
{
    
    getLibraries() : Array<Library>;
    deleteComponent(event, treeNode);
    
}

/**
 * This class is responsible for the tree structure and the functionality of the tree.
 * When it's instantiated it creates a controller from treeControllerInterface and creates an array that takes the
 * data created by createLibs(). Then it builds the JSON (getTreeStructure) to allow the fancytree framework
 * to build the tree-UI (buildtree()).
 */
class TreeController
{
    
    public controller : treeControllerInterface;
    
    public beastController : BeastController;
    public tree : any;
    
    constructor(BeastController : BeastController)
        {
            this.beastController = BeastController;
            this.tree            = this.buildTree();
            
        }
    
    private createLibraryNode(lib : Library) : any
        {
            const children : Array<any> = [];
            lib.components.forEach((cmp) =>
                                   {
                                       children.push(this.createComponentNode(cmp.name, new GlobalComponentTypeID(lib.ID, cmp.ID)));
                                   });
            return {
                title : lib.name, folder : true, hideCheckbox : true, key : lib.ID, children : children
            };
        }
    
    private createComponentNode(name : string, ID : GlobalComponentTypeID) : any
        {
            return {
                title : name, key : ID.componentID, data : ID
            };
        }
    
    /**
     * getTreeStructure() constructs the basis data structure.
     */
    private getTreeStructure() : Array<any>
        {
            const treeStructure = [];
            this.beastController.getLibraries()
                .forEach((lib) =>
                         {
                             treeStructure.push(this.createLibraryNode(lib));
                         });
            return treeStructure;
        }
    
    public reloadTree()
        {
            this.tree
                .reload(this.getTreeStructure());
        }
    
    /**
     * addLibrary() adds a new LibraryNode to treeStructure
     * @param lib
     */
    public addLibrary(lib : Library)
        {
            this.tree
                .getRootNode()
                .addChildren(this.createLibraryNode(lib));
        }
    
    public addComponent(componentID : GlobalComponentTypeID)
        {
            this.getNodeByID(componentID.libraryID)
                .addChildren(this.createComponentNode(this.beastController.resolveComponentType(componentID).name, componentID));
        }
    
    public getNodeByID(ID : string) : any
        {
            return this.tree
                       .getNodeByKey(ID);
        }
    
    /**
     * Deletes a single component specified by the given node
     *
     * @param treeNode
     */
    private deleteNode(treeNode)
        {
            if (treeNode.isFolder())
            {
                if (this.beastController.deleteLibrary(treeNode.key))
                {
                    treeNode.remove();
                }
            }
            else
            {
                if (this.beastController.deleteSingleComponent(treeNode.data))
                {
                    treeNode.remove();
                }
            }
        };
    
    private createDeleteDialog(node)
        {
            let message;
            if (node.isFolder() && !BeastController.isBasicLibrary(node.key))
            {
                message = 'Are you sure you want to delete the library "' + node.title + '"?';
            }
            else if (!node.isFolder() && !BeastController.isReadOnlyLibrary(node.parent.key))
            {
                message = 'Are you sure you want to delete the component "' + node.title + '"?';
            }
            else
            {
                //invalid node
                return;
            }
            new DeleteDialog(message, () =>
            {
                this.deleteNode(node);
            }).show();
        }
    
    /**
     * buildTree() creates the tree in the document. This method uses the fancytree framework.
     */
    private buildTree() : any
        {
            let treeController = this; //passed to the callback
            const $tree        = $('#tree');
            $tree.fancytree(<FancytreeOptions> {
                
                checkbox        : false,
                debugLevel      : 0,
                selectMode      : 3,
                source          : this.getTreeStructure(),
                clickFolderMode : 2,
                quicksearch     : true,
                minExpandLevel  : 1,
                extensions      : ['contextMenu', 'dnd', 'edit', 'glyph'],
                //TODO find a way to disable contextMenu
                contextMenu     : {
                    menu    : function(node)
                    {
                        const basic     = BeastController.isBasicLibrary(node.key);
                        const editBut   = node.isFolder() || node.parent.key == BeastController.BASIC_LIB_ID;
                        const deleteBut = basic || BeastController.isReadOnlyLibrary(node.parent.key);
                        return {
                            'edit'   : {name : 'Edit', 'icon' : 'edit', disabled : editBut},
                            'sep1'   : '---------',
                            'delete' : {name : 'Delete', 'icon' : 'delete', disabled : deleteBut}
                        };
                    },
                    actions : function(node, action)
                    {
                        if (action == 'delete')
                        {
                            treeController.createDeleteDialog(node);
                        }
                        if (action == 'edit')
                        {
                            treeController.beastController.workspaceController.openComponent(node.data);
                        }
                    }
                },
                click           : function(event, data) : boolean
                {
                    $('.fancytree-container')
                        .unbind('scroll', avoidHorizontalZoom);
                    if (event.which == 3 && BeastController.isBasicLibrary(data.node.key))
                    {
                        return false;
                    }
                    return true;
                },
                dblclick        : function(event, data) : boolean
                {
                    if (data.node.isFolder() || data.node.data.libraryID === BeastController.BASIC_LIB_ID)
                    {
                        return false;
                    }
                    treeController.beastController.workspaceController.openComponent(data.node.data);
                    return true;
                },
                keydown         : function(event, data)
                {
                    switch (event.which)
                    {
                        case 16:
                            data.node.toggleSelected();
                            return true;
                        case 46:
                            treeController.createDeleteDialog(data.node);
                            return true;
                        default:
                            return true;
                    }
                },
                glyph           : {
                    map : {
                        doc              : 'glyphicon glyphicon-compressed',
                        docOpen          : 'glyphicon glyphicon-file',
                        checkbox         : 'glyphicon glyphicon-unchecked',
                        checkboxSelected : 'glyphicon glyphicon-check',
                        checkboxUnknown  : 'glyphicon glyphicon-share',
                        dragHelper       : 'glyphicon glyphicon-play',
                        dropMarker       : 'glyphicon glyphicon-arrow-right',
                        error            : 'glyphicon glyphicon-warning-sign',
                        expanderClosed   : 'glyphicon glyphicon-menu-right',
                        expanderLazy     : 'glyphicon glyphicon-menu-right',  // glyphicon-plus-sign
                        expanderOpen     : 'glyphicon glyphicon-menu-down',  // glyphicon-collapse-down
                        folder           : 'glyphicon glyphicon-folder-close',
                        folderOpen       : 'glyphicon glyphicon-folder-open',
                        loading          : 'glyphicon glyphicon-refresh glyphicon-spin'
                    }
                },
                icon            : function(event, data)
                {
                    if (data.node.isFolder() && data.node.key === BeastController.DEPOSIT_LIB_ID)
                    {
                        return 'glyphicon glyphicon-save';
                    }
                    else
                    {
                        switch (data.node.data.libraryID)
                        {
                            case BeastController.BASIC_LIB_ID:
                                return 'glyphicon glyphicon-object-align-horizontal';
                            case BeastController.DEPOSIT_LIB_ID:
                                return 'glyphicon glyphicon-wrench';
                        }
                    }
                },
                dnd             : {
                    autoExpandMS          : 400,
                    focusOnClick          : true,
                    preventVoidMoves      : true, // Prevent dropping nodes 'before self', etc.
                    preventRecursiveMoves : true, // Prevent dropping nodes on own descendants
                    dragStart             : function(node, data)
                    {
                        $('.fancytree-container')
                            .bind('scroll', avoidHorizontalZoom);
                        return !BeastController.isBasicLibrary(node.key);
                    },
                    dragEnter             : function(node, data)
                    {
                        
                        //dragging for reordering user defined libraries
                        if (node.parent === data.otherNode.parent && !BeastController.isReadOnlyLibrary(node.key) && !BeastController.isReadOnlyLibrary(node.parent.key))
                        {
                            //TODO maybe allow insert before first child
                            return 'after';
                        }
                        //drag component from deposit into a user defined library
                        //data.otherNode is the dragged component
                        if (data.otherNode.parent.key == BeastController.DEPOSIT_LIB_ID && node.isFolder() && !BeastController.isReadOnlyLibrary(node.key))
                        {
                            return 'over';
                        }
                        return false;
                    },
                    dragDrop              : function(node, data)
                    {
                        /** This function MUST be defined to enable dropping of items on
                         *  the tree.
                         */
                        
                        
                        //TODO according to fancytree docs, there are cases when some of the used fields can be null
                        
                        
                        //assert that both nodes are libraries
                        if (node.isFolder() && data.otherNode.isFolder())
                        {
                            if (node.isFolder() && treeController.beastController.reorderLibraryAfter(node.key, data.otherNode.key))
                            {
                                data.otherNode.moveTo(node, data.hitMode);
                            }
                            else if (treeController.beastController.reorderComponentAfter(node.data, data.otherNode.data))
                            {
                                data.otherNode.moveTo(node, data.hitMode);
                            }
                        }
                        else if (node.isFolder() && data.otherNode.parent.key == BeastController.DEPOSIT_LIB_ID)
                        {
                            treeController.beastController.copyComponent(new GlobalComponentTypeID(data.otherNode.parent.key, data.otherNode.key), node.key);
                        }
                    }
                },
                activate        : function(event, data)
                {
                
                }
                
            });
            
            $('#tree ul')
                .addClass('flex-grow-equal');
            
            return $tree.fancytree('getTree');
        }
}


let avoidHorizontalZoom = function()
{
    if ($('.fancytree-container')
            .scrollLeft() != 0)
    {
        $('.fancytree-container')
            .scrollLeft(0);
    }
};


class DeleteDialog extends Dialog
{
    private message : string;
    private callback : () => void;
    
    constructor(message : string, deleteCallback : () => void)
        {
            super();
            this.message  = message;
            this.callback = deleteCallback;
        }
    
    protected getTitle() : string
        {
            return 'Warning!';
        }
    
    protected getContent() : JQuery
        {
            this.addButton('Delete', 'glyphicon glyphicon-trash', () =>
            {
                this.callback();
                this.close();
            });
            this.addButton('Cancel', 'glyphicon glyphicon-remove', () => this.close());
            return $('<p>' + this.message + '</p>');
        }
}