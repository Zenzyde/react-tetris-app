import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import Board from './components/Board';
import { useTetris } from './hooks/useTetris';
import UpcomingBlocks from './components/UpcomingBlocks';
import BackgroundConfetti from './components/BackgroundConfetti';

// Reference: https://github.com/ConnerArdman/tetris-react
// -- https://www.youtube.com/watch?v=UuzcvFVH4DQ
// Grid centering reference: https://stackoverflow.com/questions/45536537/centering-in-css-grid
function App() {
	
	// Setup the hook which provides the object representing the various (logical) states of the game
	const { board, startGame, isPlaying, score, upcomingBlocks, numConfetti, removeConfetti } = useTetris();
	const [gameStarted, setIsGameStarted] = useState(false); // Used to disable the 'Start Game' button when clicking, so that it can be displayed but not clicked again until game over
	
	if (gameStarted && !isPlaying) { setIsGameStarted(false); }
	
	return (
		<div className="App grid grid-cols-5 flex-row h-screen bg-slate-200">
			<h1 className='Header text-center font-bold text-5xl col-span-1 col-start-3 row-span-1 row-start-1 self-center'>Tetris</h1>
			{isPlaying && <BackgroundConfetti onAnimEnd={removeConfetti} confettis={numConfetti} />}
			<Board currentBoard={board} /* Declaring/creating a board-component for visualizing the board, and supplying it with the current board state object*/ />
			<div className='Score col-span-1 row-span-1 col-start-1 row-start-2 border-4 rounded-lg border-black flex flex-col justify-center bg-blue-400'>
				<h2 className='Text text-4xl'>Score</h2>
				<h1 className='text-6xl'>{score}</h1>
			</div>
			<div className='RightSide col-span-1 row-span-1 col-start-5 row-start-2 grid grid-rows-4 border-4 rounded-lg border-black bg-blue-400'>
				<div className='Button row-span-1 row-start-2 flex self-end justify-center'>
					<button className={`text-4xl border rounded-md p-3 ${gameStarted ? 'text-gray-400 cursor-default bg-gray-950' : 'text-black bg-white'}`} onClick={() => { if (!gameStarted) { startGame(); setIsGameStarted(true); } }}>Start Game</button>
				</div>
				<div className='UpcomingBlocks row-span-1 row-start-3 flex flex-col'>
					<h1 className='text-xl align-top'>Next block</h1>
					{isPlaying && <UpcomingBlocks upcomingBlocks={upcomingBlocks} /> /* If the game is active, display the upcoming blocks */}
				</div>
			</div>
		</div>
	);
}

export default App;
