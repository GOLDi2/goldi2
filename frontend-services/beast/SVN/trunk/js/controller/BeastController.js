/**
 * Created by mseeber on 5/10/17.
 */
///<reference path="../model/model.ts" />
///<reference path="../d_ts/jquery.d.ts" />
//fixme replace with interface description of real modules
//forward declaration (remove when modules are implemented)
class BeastUI {
}
class BeastExternalInterface {
}
class BeastPersistence {
}
/**
 * This class contains all startup logic for BEAST and thus marks the entry point
 * when using beast.
 */
class BeastController {
    constructor() {
        this.model = new BeastPersistence();
        //this.view            = new BeastUI();
        this.treeController = new Tree.TreeController(this);
        this.workspaceController = new WorkspaceController();
        this.externalControl = new BeastExternalInterface();
    }
    treeModified() {
        //Called when tree is modified
    }
    //example method for adding Javascript
    static registerDefaultComponent(circuit) {
    }
}
$(document)
    .ready(function () {
    new BeastController();
});
//# sourceMappingURL=BeastController.js.map