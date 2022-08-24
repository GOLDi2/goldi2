import { APIClient } from "@cross-lab-project/api-client";
import { DeviceHandler } from "@cross-lab-project/soa-client";
import {ElectricalConnection} from "./electricalConnection"
import { Webcam } from "./webcam";

const device_id='60895feb-00cb-4f60-bb96-2ee5a8edab14'
const client = new APIClient('https://api.goldi-labs.de');
const deviceHandler = new DeviceHandler()


async function main() {
    await client.postLogin({username: 'REDACTED', password: 'REDACTED', method: 'tui'})
    const {body: token}=(await client.getDevicesByDeviceIdToken({device_id}))

    const ecs = new ElectricalConnection()
    ecs.register(deviceHandler)
    document.body.appendChild(ecs)

    const webcam = new Webcam()
    webcam.register(deviceHandler)
    document.body.appendChild(webcam)
    
    deviceHandler.connect({ endpoint: "wss://api.goldi-labs.de/devices/ws", id: "https://api.goldi-labs.de/devices/"+device_id, token })
}


main()