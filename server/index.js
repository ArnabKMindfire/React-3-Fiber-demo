import { Server } from "socket.io";
import fs from "fs/promises";

const io = new Server({
    cors: {
        origin: "*"
    }
});

io.listen(3000);

const characters = [];
let animations = [];
let audios = [];
let lipSyncData = [];

const generateRandomPosition = () => [Math.random() * 3, 0, Math.random() * 3];

const generateRandomHexColor = () => {

    while (1) {
        const hexColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
        const hexRegex = /^#?([0-9A-F]{3}){1,2}$/i;
        if (hexRegex.test(hexColor)) return hexColor;
    }
};

const readFile = async (path) => {
    let file = '';
    try {
        file = await fs.readFile(path);
    } catch (error) {
        console.log(error);
    } finally {
        return file;
    }
}

const encodeFileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {

        try {
            const base64String = file.toString('base64');
            resolve(base64String);
        } catch (error) {
            reject(error);
        }
    })
}

const encodeAudioFileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {

        try {
            const base64String = new Buffer.from(file, 'binary').toString('base64');
            resolve(base64String);
        } catch (error) {
            reject(error);
        }
    })
}

const generateBase64OfAnimations = async (animation) => {

    const filepath = `./animations/${animation}.fbx`;

    const file = await readFile(filepath);

    if (!file) {
        return null;
    }

    try {
        const base64File = await encodeFileToBase64(file);

        return base64File;
    } catch (error) {
        return null;
    }
}

const generateBase64OfAudio = async (audio, format) => {

    const filepath = `./audios/${audio}.${format}`;

    const file = await readFile(filepath);

    if (!file) {
        return null;
    }

    try {

        let base64File;

        if (format === "mp3") {
            base64File = await encodeAudioFileToBase64(file);
        } else {
            base64File = btoa(file);
        }

        return base64File;
    } catch (error) {
        return null;
    }
}

const convertAnimationsToBase64 = async () => {
    animations = [];
    animations.push(await generateBase64OfAnimations('Standing Idle'));
    animations.push(await generateBase64OfAnimations('Walking'));
    animations.push(await generateBase64OfAnimations('Dancing'));
    animations.push(await generateBase64OfAnimations('Jumping'));
}

const convertAudiosToBase64 = async () => {
    audios = [];
    lipSyncData = [];

    audios.push(await generateBase64OfAudio('myIntro', 'mp3'));
    lipSyncData.push(await generateBase64OfAudio('myIntro', 'json'));
}

const createCharacters = (id) => {

    const character = {
        id: id,
        position: generateRandomPosition(),
        hairColor: generateRandomHexColor(),
        topColor: generateRandomHexColor(),
        bottomColor: generateRandomHexColor(),
        footwearColor: generateRandomHexColor(),
        animations: animations,
        audios: audios,
        lipSyncData: lipSyncData,
        currentAnimation: 'stand'
    }

    return character;
}


io.on("connection", async (socket) => {

    console.log("user connected");

    await convertAnimationsToBase64();

    await convertAudiosToBase64();

    characters.push(createCharacters(socket.id));

    io.emit("characters", characters);

    socket.on("set-animation", (animation) => {
        const character = characters.find(character => character.id === socket.id);
        character.currentAnimation = animation || character.currentAnimation;
        io.emit("character", character);
    })

    socket.on("move", (position) => {
        const character = characters.find(character => character.id === socket.id);
        character.position = position;
        io.emit("character", character);
    })

    socket.on("disconnect", () => {
        console.log("user disconnected");

        characters.splice(characters.findIndex(character => character.id === socket.id), 1);

        io.emit("characters", characters);
    });
});