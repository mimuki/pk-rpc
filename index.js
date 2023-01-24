const DiscordRPC = require('discord-rpc');
const PKAPI = require('pkapi.js');
const clientId = '779297298814599188';
DiscordRPC.register(clientId);
const client = new DiscordRPC.Client({transport: 'ipc'});
const API = new PKAPI();
const fs = require('fs');


var defaultAvatar = "https://i.imgur.com/sYaY3dz.png"
var noFrontAvatar = "https://i.imgur.com/CRMS1c5.png"
var errorAvatar = "https://i.imgur.com/3K5Xb0Z.png"

var members = []
var pronounList = []
var pronounsEven = []
var frontText = []
var bonusText = ["a", "Ominous Button", "Forbidden Knowledge", "Click At Your Own Risk", "Secret Button", "Click This To Die Instantly", "Don't Click This Button", "Do Not Press", "beans", "demon weasel", "click to punch a racist", "send me a goat", "nothing bad will happen", "you are safe", "pillow fight!", "mincraft", "i <3 u", "push for confetti", "LEMONS COMING FROM ABOVE", "ratsssssecretssss", "click to summon lipamanka", "not the banana!", "Feed the computer wizard", "Do a kickflip!"]
var system;


function reverseString(str) {
    // Step 1. Use the split() method to return a new array
    var splitString = str.split(""); // var splitString = "hello".split("");
    // ["h", "e", "l", "l", "o"]

    // Step 2. Use the reverse() method to reverse the new created array
    var reverseArray = splitString.reverse(); // var reverseArray = ["h", "e", "l", "l", "o"].reverse();
    // ["o", "l", "l", "e", "h"]

    // Step 3. Use the join() method to join all elements of the array into a string
    var joinArray = reverseArray.join(""); // var joinArray = ["o", "l", "l", "e", "h"].join("");
    // "olleh"

    //Step 4. Return the reversed string
    return joinArray; // "olleh"
}

async function setFront() {
    // Wait for information from pluralkit
    try {
		if(!system) {
			system = await API.getSystem({system: client.user.id});
		}

		var front = await system.getFronters();
		front.members = Array.from(front.members, ([k, v]) => v);

        // Do this for each member in front
        for (var i = 0; i < front.members.length; i++) {
            // If they don't have any pronouns set at all
            if (front.members[i]?.pronouns == null) {
                pronounList[i] = "unknown"
                console.log("\u001B[33m[   WARN   ]\u001B[0m " + front.members[i]?.name + "'s pronouns are either unset or private.")
            }
            // If they do
            if (front.members[i]?.pronouns !== null) {
                // Remove URLs (i.e. a link explaining that member's neopronouns)
                var pronouns = front.members[i]?.pronouns.replace(/\[|\]|\(.*\)/g, '')
                // Splits into pronoun sections like "he", "him", etc.
                // Unless our pronouns are set wrong, this will always be divisible by 2
                var pronouns = pronouns.split(/[\s\/]+/)

                // No / in pronouns, so display as is.
                if (pronouns.length == 1 ) {
                    pronounList[i] = pronouns
                    console.log("\u001B[34m[   INFO   ]\u001B[0m " + front.members[i]?.name + "'s pronouns aren't in the pro/noun format.\n       This might be fine (e.g. pronouns are set to 'any', 'ask' etc), or not fine (e.g. my regex broke)")
                }

                //if they have exactly 1 set of pronouns, just add it as is
                if (pronouns.length == 2) {
                    pronounList[i] = pronouns.join('/')
                }


                // if they have more than one pronoun (aka he/him, they/them)
                if (pronouns.length > 2) {
                    // Save the first one of each pair to pronounsEven
                    // "he/him they/them" becomes "he/they"
                    for (var e = 0; e < pronouns.length; e++) {
                        if (e % 2 == 0) {
                            pronounsEven.push(pronouns[e])
                        }
                    }
                    pronounList[i] = pronounsEven.join('/')
                    // TODO: find out how to do variables that reset better
                    pronounsEven = []
                }
            }
            // The first member is listed as their name
            if (i == 0) {
                members = front.members[i]?.name.replace(/\d+/g, '')
            }

            // The non-start and non-end members should be listed as ", name"
            if (i > 0 && i < front.members.length-1) {
                members = members + ", " + front.members[i]?.name.replace(/\d+/g, '')
            }

            // the last members should be listed as " and name"
            // NOTE: There is no special handling with the oxforc comma. If you want that, do it yourself.
                // i.e. this will output "Tom and Jerry" and "Tom, Dick and Harry"
                // NOT "Tom and Jerry" and "Tom, Dick, and Harry"
            if (i == front.members.length-1 && front.members.length != 1) {
                members = members + " and " + front.members[i]?.name.replace(/\d+/g, '')
            }
        }
        // Shorten lists that are too long for Discord.
        // TODO: Make this continually check this, and cut off at the end of a member with "and others" or something
		if (members.length > 127) {
	        members = members.slice(0, 120) + "...";
		}


// If >0 people are fronting
if(front.members.length > 0) {
    console.log("\u001B[34m[" +  new Date().toLocaleTimeString() + "]\u001B[0m Front: " + members)
    firstFront = " " + front.members[0]?.name.replace(/\d+/g, '') + " "
    fs.writeFileSync("front.txt", firstFront)

    var topButtonLabel = "About " + front.members[0]?.name.replace(/\d+/g, '') + " (" + pronounList[0] + ")";
    // Long names + long pronouns can cause Discord to get mad
    if(topButtonLabel.length > 32) {
        topButtonLabel = "About " + front.members[0]?.name.replace(/\d+/g, '')
    }
    // Unusually member names may also cause this
    if(topButtonLabel.length > 32 ) {
        topButtonLabel = "About me"
    }

    i = Math.floor(Math.random()*(bonusText.length))
    bottomButtonLabel = bonusText[i]
    if(i == 0){
        bottomButtonLabel = reverseString(topButtonLabel)
    }


    var topButtonURL =  "https://dash.pluralkit.me/profile/m/" + front.members[0]?.id
    console.log("selected text " + bottomButtonLabel)
    var stateText = members
    var activity = {
                "state": stateText,
                startTimestamp: new Date(front.timestamp),

                "buttons": [
                    {"label": topButtonLabel, "url": topButtonURL },
                    {"label": bottomButtonLabel, "url": "https://ko-fi.com/therats"}
                ],
    }

    // If avatar set, show it
	if(front.members[0]?.avatar_url) {
		activity.largeImageKey = front.members[0].avatar_url.replace('cdn.discordapp.com', 'media.discordapp.net');
      // Discord bad, so warn the user if their icons might not work.
        if(front.members[0].avatar_url.includes("media.discordapp.net") || front.members[0].avatar_url.includes("cdn.discordapp.com")) {
    		activity.largeImageKey = errorAvatar;
	}

	}
    // If avatar unset, use a generic one
	if(!front.members[0]?.avatar_url && members.length != 0) {
		activity.largeImageKey = defaultAvatar;
        console.log("\u001B[33m[   WARN   ]\u001B[0m " + front.members[0]?.name + "'s avatar is either unset or private. Using fallback instead.")
		}

}

// If no one fronting
if (front.members.length == 0){
    console.log("\u001B[34m[" +  new Date().toLocaleTimeString() + "]\u001B[0m Front is empty! If that's unexpected, check your sysetem privacy settings. If not, sleep well :)")
    fs.writeFileSync("front.txt", "zzz")
    var topButtonLabel = "About Us"
    var topButtonURL = "https://dash.pluralkit.me/profile/s/mouse"
    var stateText = "Sleeping"
    // Check when the next 6AM is, and set that as the "x minutes remaining"
    var now = new Date();
    var next6am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0);
    if (now.getHours() >= 6) {
        next6am.setDate(next6am.getDate() + 1);
    }

    var activity = {
            "state": stateText,
            endTimestamp: new Date(next6am),

            "buttons": [
                {"label": topButtonLabel, "url": topButtonURL },
                {"label": "Secret Button", "url": "https://ko-fi.com/therats"}
            ],
    }
    // TODO: putting this in the main activity thing would be tidier
	activity.largeImageKey = noFrontAvatar;
	activity.largeImageText = "zzz"
}

// If system has a URL set, use it for the small icon.
if(system.avatar_url) {
	activity.smallImageKey = system.avatar_url.replace('cdn.discordapp.com', 'media.discordapp.net');
}

// this is where the magic happens
		client.setActivity(activity)
	} catch(e) {
		if(e.response) {
			if(e.response.data == "Account not found.") {
				console.error("Account doesn't have a system registered.");
			} else if(e.response.response == "Unauthorized to view fronter.") {
				console.error("Account's front is set to private.");
			} else if(e.response.response == "System has no registered switches.") {
				console.error("Account has no registered switches.");
			} else console.error(e.response.data);
		} else console.error(e.message);
		process.exit(1);
	}
}

client.on('ready', ()=> {
	setFront();
    // This seems to be about 5 seconds.
	setInterval(()=> setFront(), 15000);
})

client.login({clientId}).catch(console.error).then(()=> console.log("RPC running!"));
