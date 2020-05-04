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
class GlobalComponentTypeID
{
    public readonly libraryID : string;
    public readonly componentID : string;
    
    /**
     *
     * @param libraryID The ID of the library in which the component is contained.
     * @param componentID
     */
    constructor(libraryID : string, componentID : string)
        {
            this.libraryID   = libraryID;
            this.componentID = componentID;
        }
    
    /**
     * Checks if the target equals this instance.
     * @param target
     * @returns {boolean}
     */
    public equals(target : GlobalComponentTypeID) : boolean
        {
            return (this.libraryID == target.libraryID) && (this.componentID != target.componentID);
        }
}

/**
 * Represents a component (type) as it appears in a library.
 * ComponentIntstance(s) refer to this class.
 */
abstract class CommonComponentType
{
    private name : string;
    private typeID : string;
    
    constructor(name : string, typeID : string)
        {
            this.name = name;
            this.typeID = typeID;
        }
}


/**
 * Instances of this class represent types of components
 * which are composed of other components.
 */
class CommonCompundComponentType extends CommonComponentType
{
    constructor(name : string, typeID : string)
        {
            super(name , typeID);
        }
    
    private components : CommonComponentInstance[];
    
    //TODO Connector from model?
    private connections : Connector[];
}

/**
 * Represents an Instance of a component as it is used in a circuit
 * TODO maybe treat this more as a POD type
 */
class CommonComponentInstance
{
    
    private type : GlobalComponentTypeID;
    private ID : string;
    
    /**
     * @type {{}} A dictionary containing all parameters of the instance
     */
    private parameters = {};
    
    constructor(type : GlobalComponentTypeID, id : string)
        {
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
class BasicCommonComponentType extends CommonComponentType
{
}


/**
 * Represents a self sufficient set of Components.
 */
class CommonLibrary
{
    private libraryID : string;
    private name : string;
    
    private components : CommonComponentType[];
}
