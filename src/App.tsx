import { useEffect, useState } from 'react';
import './App.css';
import Board from './components/Board';
import { useTetris } from './hooks/useTetris';
import UpcomingBlocks from './components/UpcomingBlocks';
import BackgroundConfetti from './components/BackgroundConfetti';
import CountUpModule from 'react-countup';
import AnimatedBackground from './components/AnimatedBackground';

const CountUp = (CountUpModule as any).default ?? CountUpModule;

function App() {
	
	// Setup the hook which provides the object representing the various (logical) states of the game
	const { board, droppingBoard, boardRotation, startGame, isPlaying, preScore, newScore, upcomingBlocks, numConfetti, removeConfetti } = useTetris();
	const [gameStarted, setIsGameStarted] = useState(false); // Used to disable the 'Start Game' button when clicking, so that it can be displayed but not clicked again until game over

	useEffect(() => {
		if (gameStarted && !isPlaying) { setIsGameStarted(false); }
	}, [gameStarted, isPlaying]);
	
	return (
		<div className="App overflow-hidden h-screen grid grid-flow-row">
			<AnimatedBackground />
			<div>
				<h1 className='Header text-center font-bold text-5xl mt-4 text-white'>Polar Tetris</h1>
			</div>
			<div className="flex-col w-full flex justify-center md:flex-row">
				{isPlaying && <BackgroundConfetti onAnimEnd={removeConfetti} confettis={numConfetti} />}
				{ /*Desktop*/}
				<div className='hidden md:block md:flex-col md:w-1/5 mt-18 h-fit justify-center'>
					<div className='self-center border-black border-2 p-3 rounded-md mb-10'>
						<h2 className='text-4xl text-white'>Score</h2>
						<br />
						<CountUp start={preScore} end={newScore} duration={3} delay={0} >
							{
								({ countUpRef }: { countUpRef: React.RefObject<HTMLElement | null> }) => (
									<span ref={countUpRef} className='text-3xl text-white' />
								)
							}
						</CountUp>
					</div>
					
					<div className='self-center border-black border-2 p-3 rounded-md'>
						<h2 className='text-4xl text-white'>How to play</h2>
						<div className='text-left'>
							<br />
							<p className='text-white text-lg'>Use the &larr; and &rarr; arrow keys to move the tetris piece left and right.</p>
							<br />
							<p className='text-white text-lg'>Use the &uarr; arrow key to rotate the piece.</p>
							<br />
							<p className='text-white text-lg'>Use the &darr; arrow key to accelerate the piece downward.</p>
						</div>
					</div>
				</div>
				<Board currentBoard={board} droppingBoard={droppingBoard} rotation={boardRotation} className={`hidden md:block md:w-2/4`} /* Declaring/creating a board-component for visualizing the board, and supplying it with the current board state object*/ />
				<div className='hidden md:block md:w-1/5 mt-18'>
					<div className='mb-10'>
						<button className={`text-4xl font-bold border rounded-md p-3 ${gameStarted ? 'text-white cursor-default bg-black' : 'text-black hover:text-white bg-white hover:bg-black active:bg-slate-600'}`} onClick={() => { if (!gameStarted) { startGame(); setIsGameStarted(true); } }}>Play</button>
					</div>
					<div className=''>
						{<h2 className='text-4xl text-white mb-10'>Next</h2>}
						{isPlaying && <UpcomingBlocks upcomingBlocks={upcomingBlocks} />}
					</div>
				</div>

				{ /*Mobile*/}

				<Board currentBoard={board} droppingBoard={droppingBoard} rotation={boardRotation} className={`block md:hidden w-full h-1/2`} /* Declaring/creating a board-component for visualizing the board, and supplying it with the current board state object*/ />
				<div className='md:hidden flex flex-col'>
					<div className='flex w-full mb-5 mx-2 mt-[-65px]'>
						<div className='w-1/2 h-fit justify-center'>
							<div className='self-center border-black border-2 p-2 rounded-md mb-5 mx-2'>
								<h2 className='text-xl text-white'>Score</h2>
								<CountUp start={preScore} end={newScore} duration={3} delay={0} >
									{
										({ countUpRef }: { countUpRef: React.RefObject<HTMLElement | null> }) => (
											<span ref={countUpRef} className='text-sm text-white' />
										)
									}
								</CountUp>
							</div>
						</div>
						<div className='w-1/2'>
							<div className='mb-5'>
								<button className={`text-xl font-bold border rounded-md p-2 ${gameStarted ? 'text-white cursor-default bg-black' : 'text-black hover:text-white bg-white hover:bg-black active:bg-slate-600'}`} onClick={() => { if (!gameStarted) { startGame(); setIsGameStarted(true); } }}>Play</button>
							</div>
							<div className=''>
								{<h2 className='text-xl text-white mb-5'>Next</h2>}
								{isPlaying && <UpcomingBlocks upcomingBlocks={upcomingBlocks} />}
							</div>
						</div>
					</div>
					<div className='self-center border-black border-2 p-2 rounded-md mx-2'>
						<h2 className='text-xl text-white'>How to play</h2>
						<div className='text-left flex flex-col gap-2'>
							<p className='text-white text-sm'>Swipe left or right to move the tetris piece.</p>
							<p className='text-white text-sm'>Swipe up to rotate the piece.</p>
							<p className='text-white text-sm'>Swipe down to accelerate the piece downward.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
