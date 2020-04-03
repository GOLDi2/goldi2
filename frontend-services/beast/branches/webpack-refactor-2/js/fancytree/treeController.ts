import FancytreeOptions = Fancytree.FancytreeOptions;

/**
 * Created by dorianmueller on 23.05.2017.
 */
    
    ///<reference path="../d_ts/jquery.d.ts" />
    ///<reference path="../model/model.ts" />


namespace Tree
{
    export type dataStructure = any;
    interface treeData
    {
        data : dataStructure;
    }
    
    export interface treeControllerInterface
    {
        treeModified(Tree : TreeController);
    }
    
    export class TreeController
    {
    
        protected controller : treeControllerInterface;
        protected treeData : treeData;
                  modified : boolean;
                  treeStructure : any;
    
    
        constructor(controller : treeControllerInterface)
            {
    
                this.controller = controller;
                //this.treeData.data = simcir.getDefault();
                this.modified      = setTreeDirty(false);
                this.treeStructure = [
                    {
                        title    : 'Basic Library', selected : true, folder : true, expanded : true, active : true, key : 'id1',
                        children : [
                            {
                                title    : 'Basic Components', folder : true, key : 'id1.1',
                                children : [
                                    {title : 'K1.1.1', key : {blub: 42}},
                                    {title : 'K1.1.2', key : 'id1.1.2'}
                                ]
                            },
                            {
                                title    : 'Compound Components', folder : true, key : 'id1.2',
                                children : [
                                    {title : 'K1.2.1', key : 'id1.2.1'},
                                    {title : 'K1.2.2', key : 'id1.2.2'}
                                ]
                            }
                        ]
                    },
                    {
                        title    : 'Created Components', folder : true, key : 'id2',
                        children : [
                            {
                                title    : 'Set 1', folder : true, key : 'id2.1',
                                children : [
                                    {title : 'K2.1.1', key : 'id2.1.1'},
                                    {title : 'K2.1.2', key : 'id2.1.2'}
                                ]
                            }
                        ]
                    }
                ];
                
                this.buildTree();
    
            }
    
    
        /* Creates the tree in the document*/
        public buildTree()
            {
                $('#tree')
                    .fancytree(<FancytreeOptions> {
                        
                        checkbox   : true,
                        selectMode : 3,
                        source     : this.treeStructure,
                        extensions : ['contextMenu', 'dnd', 'edit'],
                        
                        contextMenu  : {
                            menu    : {
                                'edit'   : {'name' : 'Edit', 'icon' : 'edit'},
                                'cut'    : {name : 'Cut', icon : 'cut'},
                                'paste'  : {name : 'Paste', icon : 'paste'},
                                'sep1'   : '---------',
                                'delete' : {'name' : 'Delete', 'icon' : 'delete'}
                                
                            },
                            actions : function(node, action, options)
                            {
                                alert('Selected action "' + action + '" on node ' + node.key);
                            }
                        },
                        loadChildren : function(event, ctx)
                        {
                            ctx.node.fixSelection3AfterClick();
                        },
                        select       : function(event, data)
                        {
                            // Get a list of all selected nodes, and convert to a key array:
                            let selKeys      = $.map(data.tree.getSelectedNodes(), function(node)
                            {
                                return node.key;
                            });
                            // Get a list of all selected TOP nodes
                            let selRootNodes = data.tree.getSelectedNodes(true);
                            // ... and convert to a key array:
                            let selRootKeys  = $.map(selRootNodes, function(node)
                            {
                                return node.key;
                            });
                        },
                        dblclick     : function(event, data) : boolean
                        {
                            
                            data.node.toggleSelected();
                            return true;
                        },
                        keydown      : function(event, data)
                        {
                            if (event.which === 32)
                            {
                                data.node.toggleSelected();
                                return false;
                            }
                        },
                        dnd          : {
                            autoExpandMS          : 400,
                            focusOnClick          : true,
                            preventVoidMoves      : true, // Prevent dropping nodes 'before self', etc.
                            preventRecursiveMoves : true, // Prevent dropping nodes on own descendants
                            dragStart             : function(node, data)
                            {
                                /** This function MUST be defined to enable dragging for the tree.
                                 *  Return false to cancel dragging of node.
                                 */
                                return true;
                            },
                            dragEnter             : function(node, data)
                            {
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
                            dragDrop              : function(node, data)
                            {
                                /** This function MUST be defined to enable dropping of items on
                                 *  the tree.
                                 */
                                data.otherNode.moveTo(node, data.hitMode);
                            }
                        },
                        activate     : function(event, data)
                        {
                            //        alert("activate " + data.node);
                        }
                        
                    });
                
            };
        
    }
}


function treeModified(Tree)
    {
        setTreeDirty(true);
    };

function setTreeDirty(dirty : boolean)
    {
        return this.modified = dirty;
    };


/**--Event-Handlers--**/

/** By clicking on the delete button selected nodes are deleted **/

function deleteActiveNodes()
    {
        let node     = $('#tree')
            .fancytree('getTree')
            .getSelectedNodes();
        let nodeSize = node.length;
        if (nodeSize > 0)
        {
            if (window.confirm('Do you really want to delete the selected elements?'))
            {
                for (let i = 0; i < nodeSize; i++)
                {
                    node[i].remove();
                }
            }
        }
    };