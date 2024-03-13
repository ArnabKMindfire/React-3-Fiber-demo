import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAtom, atom } from 'jotai';

export const socket = io('http://localhost:3000');

export const charactersAtom = atom([]);

export const SocketManager = () => {
	const [characters, setCharacters] = useAtom(charactersAtom);

	useEffect(() => {
		const onConnected = () => {
			console.log('connected');
		};

		const onDisconnected = () => {
			console.log('disconnected');
		};

		function base64ToArrayBuffer(base64) {
			const binaryString = atob(base64);

			const arrayBuffer = new ArrayBuffer(binaryString.length);
			const uintArray = new Uint8Array(arrayBuffer);
			for (let i = 0; i < binaryString.length; i++) {
				uintArray[i] = binaryString.charCodeAt(i);
			}

			const blob = new Blob([uintArray], { type: 'application/octet-stream' });
			return URL.createObjectURL(blob);
		}

		const onCharacters = (value) => {
			const characters = value.map((character) => {
				character.animations = character.animations.map((animation) =>
					base64ToArrayBuffer(animation)
				);

				character.audios = character.audios.map((audio) =>
					base64ToArrayBuffer(audio)
				);

				character.lipSyncData = character.lipSyncData.map((data) =>
					base64ToArrayBuffer(data)
				);
				return character;
			});

			setCharacters(characters);
			console.log('characters', characters);
		};

		const onCharacter = (value) => {
			setCharacters((prevCharacters) => {
				const characters = [...prevCharacters];
				const index = characters.findIndex(
					(character) => character.id === value.id
				);
				value.animations = [...characters[index].animations];
				value.audios = [...characters[index].audios];
				value.lipSyncData = [...characters[index].lipSyncData];
				characters.splice(index, 1, value);
				return characters;
			});
		};

		socket.on('connect', onConnected);
		socket.on('disconnect', onDisconnected);
		socket.on('characters', onCharacters);
		socket.on('character', onCharacter);

		return () => {
			socket.off('connect', onConnected);
			socket.off('disconnect', onDisconnected);
			socket.off('characters', onCharacters);
			socket.off('character', onCharacter);
		};
	}, []);
};
