//const DiscordRPC = require('discord-rpc');
const PKAPI = require('pkapi.js');
//const clientId = '779297298814599188';
//DiscordRPC.register(clientId);
//const client = new DiscordRPC.Client({transport: 'ipc'});
const API = new PKAPI();
const fs = require('fs');
const me = 'mouse' // TODO: make this not hardcoded, but eh, effort
var system;

async function setFront() {
    // Wait for information from pluralkit
    try {
        if(!system) {
            system = await API.getSystem({system: me});
        }
        var front = await system.getFronters();
        front.members = Array.from(front.members, ([k, v]) => v);

    // If >0 people are fronting
    if(front.members.length > 0) {
        firstFront = " " + front.members[0]?.name.replace(/\d+/g, '') + " "
        fs.writeFileSync("front.txt", firstFront)
        console.log(firstFront)
    }

    // If no one fronting
    if (front.members.length == 0){
        fs.writeFileSync("front.txt", " zzz ")
    }

    await new Promise(resolve => setTimeout(setFront, 15000));
    }  catch(e) {
        console.error(e)
    }
}
setFront()