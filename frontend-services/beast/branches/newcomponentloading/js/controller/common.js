/**
 * Represents a global Identifier for a component type.
 * This is to be used to associate a component instance with it's type.
 * Since Components which appear in multiple libraries are considered
 * different types, this ID incorporates also the ID of the library.
 *
 * Note:
 *
 * LibraryIDs are supposed to be unique per project
 * ComponentIDs are unique per Library
 *
 * TODO Serialization for saving in JSON format,
 * is this really necessary or can we just cast?
 *
 * Created by msee on 6/19/17.
 */
class GlobalComponentTypeID {
    /**
     *
     * @param libraryID The ID of the library in which the component is contained.
     * @param componentID
     */
    constructor(libraryID, componentID) {
        this.libraryID = libraryID;
        this.componentID = componentID;
    }
    /**
     *
     * @returns {string} The ID of the library in which the component is contained.
     */
    getLibraryID() {
        return this.libraryID;
    }
    /**
     *
     * @returns {string} The ID of the component.
     */
    getComponentID() {
        return this.componentID;
    }
    /**
     * Checks if the target equals this instance.
     * @param target
     * @returns {boolean}
     */
    equals(target) {
        return (this.libraryID == target.libraryID) && (this.componentID != target.componentID);
    }
}
/**
 * Represents a component (type) as it appears in a library.
 * ComponentIntstance(s) refer to this class.
 */
class CommonComponentType {
    constructor(name, typeID) {
        this.name = name;
        this.typeID = typeID;
    }
}
/**
 * Instances of this class represent types of components
 * which are composed of other components.
 */
class CommonCompundComponentType extends CommonComponentType {
    constructor(name, typeID) {
        super(name, typeID);
    }
}
/**
 * Represents an Instance of a component as it is used in a circuit
 * TODO maybe treat this more as a POD type
 */
class CommonComponentInstance {
    constructor(type, id) {
        /**
         * @type {{}} A dictionary containing all parameters of the instance
         */
        this.parameters = {};
        this.type = type;
        this.ID = id;
    }
}
/**
 * A basic immutable component Type.
 * Used for read only basic components.
 * TODO maybe this is not nescessary since these components are
 * TODO defined in the workspace
 */
class BasicCommonComponentType extends CommonComponentType {
}
/**
 * Represents a self sufficient set of Components.
 */
class CommonLibrary {
}
//# sourceMappingURL=common.js.map