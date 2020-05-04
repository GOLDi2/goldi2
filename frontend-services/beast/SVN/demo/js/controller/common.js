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
     * Checks if the target equals this instance.
     * @param target
     * @returns {boolean}
     */
    equals(target) {
        return ((this.libraryID == target.libraryID) && (this.componentID == target.componentID));
    }
}
/**
 * Removes on instance of the specified element from the array.
 * This function mutates the array and returns a reference on the array.
 *
 * If the element is not found in the array, the array will not
 * be changed.
 *
 * @param array
 * @param element
 * @returns {T[]}
 */
function arrayRemoveElementOnce(array, element) {
    let index = array.indexOf(element, 0);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}
//# sourceMappingURL=common.js.map