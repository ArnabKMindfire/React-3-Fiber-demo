import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { SocketManager } from './components/SocketManager';
import SpeechRecognitionComponent from './components/SpeechRecognitionComponent';

function App() {
	return (
		<>
			<SocketManager />
			<SpeechRecognitionComponent>
				<Canvas shadows camera={{ position: [8, 8, 8], fov: 30 }}>
					<color attach='background' args={['#ececec']} />
					<Experience />
				</Canvas>
			</SpeechRecognitionComponent>
		</>
	);
}

export default App;
