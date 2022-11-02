/**
 * Created by maximilian on 22.11.17.
 */

type PortDescription = {[name: string]: string};

class EmbeddedBeastController extends BeastController {
    constructor(Callback: Function, protected sensors: PortDescription, protected actuators: PortDescription, localStoragePrefix: string = "") {
        super(Callback, localStoragePrefix);
    }

    public createNewProject(){
        this.persistenceController.createNewProject(this.modifyNewProject);
    }

    protected modifyNewProject = (project: Project) => {
        let index = 0;
        for (const sensorID in this.sensors) {
            project.circuit.devices.push(new ComponentInstance(
                sensorID,
                new GlobalComponentTypeID(BeastController.BASIC_LIB_ID, "In"),
                sensorID,
                50,
                index*60 + 20,
            ));
            index++;
        }

        index = 0;
        for (const actuatorID in this.actuators) {
            project.circuit.devices.push(new ComponentInstance(
                actuatorID,
                new GlobalComponentTypeID(BeastController.BASIC_LIB_ID, "Out"),
                actuatorID,
                900,
                index*60 + 20,
            ));
            index++;
        }
    }
}