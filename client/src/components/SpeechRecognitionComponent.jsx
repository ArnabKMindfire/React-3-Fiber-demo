import { useEffect, useRef, useState, createContext } from 'react';
import { charactersAtom, socket } from './SocketManager';
import { useAtom } from 'jotai';

window.SpeechRecognition =
	window.SpeechRecognition || window.webkitSpeechRecognition;
// const SpeechGrammerList =
// 	window.SpeechGrammerList || window.webkitSpeechGrammerList;

const commands = [
	'dance',
	'dancing',
	'jump',
	'jumping',
	'stand',
	'stand idle',
	'standing idle',
	'stop',
	'standing',
	'walk',
	'walking',
];

export const CommandContext = createContext('');

const SpeechRecognitionComponent = ({ children }) => {
	const [characters] = useAtom(charactersAtom);
	const [command, setCommand] = useState('stand');
	const [speech, setSpeech] = useState('');
	const [isListening, setIsListening] = useState(false);
	const recognition = useRef(null);

	useEffect(() => {
		setCommand(
			(prevCommand) =>
				characters.find((character) => character.id === socket.id)
					?.currentAnimation || prevCommand
		);
	}, []);

	useEffect(() => {
		if ('webkitSpeechRecognition' in window) {
			recognition.current = new window.webkitSpeechRecognition();

			recognition.current.continuous = false;
			recognition.current.lang = 'en-US';
			recognition.current.interimResults = false;

			recognition.current.onresult = (event) => {
				console.log('event', event);

				const text = Array.from(event.results)
					.map((result) => result[0])
					.map((alternative) => alternative.transcript.toLowerCase())
					.join('');

				setCommand(
					(prev) => commands.find((command) => text.includes(command)) || prev
				);

				setSpeech(text);
				setIsListening(false);

				socket.emit(
					'set-animation',
					commands.find((command) => text.includes(command))
				);
			};
		} else {
			console.log('Speech recognition is not working in your browser!');
		}
	}, []);

	const handleStartListening = () => {
		if (recognition.current) {
			recognition.current.start();
			setIsListening(true);
			setSpeech('');
		}
	};

	const handleStopListening = () => {
		if (recognition.current) {
			recognition.current.stop();
			setIsListening(false);
		}
	};

	return (
		<>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<button
					onClick={handleStartListening}
					style={{ width: '20%', cursor: 'pointer' }}
				>
					Give Commands
				</button>
				{isListening ? (
					<button
						onClick={handleStopListening}
						style={{ width: '20%', cursor: 'pointer' }}
					>
						Stop Listening
					</button>
				) : null}
				<p
					style={{ width: '70%', margin: '0', marginLeft: '10px' }}
					id='speech'
				>
					Command: {speech}
				</p>
			</div>
			<CommandContext.Provider value={command}>
				{children}
			</CommandContext.Provider>
		</>
	);
};

export default SpeechRecognitionComponent;
