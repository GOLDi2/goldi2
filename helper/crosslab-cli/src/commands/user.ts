import { APIClient } from "@cross-lab-project/api-client";
import { Command } from "commander";
import { prompt } from "./prompt";

export function user(program: Command, getClient: () => APIClient) {
    const device = program.command('user')

    device.command('list').alias('ls').action(async () => {
        const client = getClient();

        console.log(await client.listUsers())
    })

    device.command('inspect').argument('[user url]').action(async (url?: string) => {
        const client = getClient();

        if (url == undefined){
            console.log("Please provide a user url")
            return
        }

        console.log(await client.getUser(url))
    })

    device.command('create').action(async (options) => {
        const client = getClient();
        let username: string = options.username;
        let password: string = options.password;

        if (username == undefined) username = await prompt("Username: ");
        if (password == undefined) password = await prompt("Password: ", true);


        client.createUser({username, password, roles: [{name: 'user'}]})
    })
}