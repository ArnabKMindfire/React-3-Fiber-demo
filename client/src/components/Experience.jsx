import {
	ContactShadows,
	Environment,
	OrbitControls,
	useCursor,
} from '@react-three/drei';
import { ArnabKundu } from './ArnabKundu';
import { useAtom } from 'jotai';
import { charactersAtom, socket } from './SocketManager';
import { useState, useContext } from 'react';
import { CommandContext } from './SpeechRecognitionComponent';
import * as THREE from 'three';

export const Experience = () => {
	const [characters] = useAtom(charactersAtom);
	const [onFloor, setOnFloor] = useState(false);
	const command = useContext(CommandContext);

	useCursor(onFloor);

	return (
		<>
			<Environment preset='sunset' />
			<ambientLight intensity={0.3} />
			<ContactShadows blur={2} />
			<OrbitControls />
			<mesh
				rotation-x={-Math.PI / 2}
				position-y={-0.001}
				onClick={(e) => socket.emit('move', [e.point.x, 0, e.point.z])}
				onPointerEnter={() => setOnFloor(true)}
				onPointerLeave={() => setOnFloor(false)}
			>
				<planeGeometry args={[10, 10]} />
				<meshStandardMaterial color='#f0f0f0' />
			</mesh>
			{characters.map((character) => (
				<ArnabKundu
					key={character.id}
					position={
						new THREE.Vector3(
							character.position[0],
							character.position[1],
							character.position[2]
						)
					}
					hairColor={character.hairColor}
					topColor={character.topColor}
					bottomColor={character.bottomColor}
					footwearColor={character.footwearColor}
					allAnimations={character.animations}
					allAudios={character.audios}
					allLipSyncData={character.lipSyncData}
					animationCommand={
						character.id === socket.id ? command : character.currentAnimation
					}
				/>
			))}
		</>
	);
};
