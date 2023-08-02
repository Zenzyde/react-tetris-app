import { useCallback } from 'react';
import ReactConfetti from 'react-confetti';
import { ConfettiObject } from '../types';

interface Props {
	confettis: ConfettiObject[],
	onAnimEnd: (id: number) => void
};

function BackgroundConfetti({confettis, onAnimEnd}: Props) {
	
	const x = window.innerWidth / 2.0;
	const y = window.innerHeight / 2.0;
	
	let canRender = confettis && confettis.length > 0;
	
	return (
		<div className='Background-Confetti'>
			{
				canRender && confettis?.map((confetti: ConfettiObject, id: number, arr: ConfettiObject[]) => {
					return (
						<div>
							<ReactConfetti key={"confetti_" + id} tweenDuration={500} recycle={false} numberOfPieces={10 * confetti.size} confettiSource={{ x: x, y: y, w: 2, h: 2 }} onConfettiComplete={() => onAnimEnd(confetti.id)} />
						</div>
					)
				})
			}
		</div>
	);
};

export default BackgroundConfetti;