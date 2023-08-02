import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import Board from './components/Board';
import { useTetris } from './hooks/useTetris';
import UpcomingBlocks from './components/UpcomingBlocks';
import BackgroundConfetti from './components/BackgroundConfetti';
import UserScoreRegisterCard from './components/UserScoreRegisterCard';
import Leaderboard from './components/Leaderboard';
import { User } from './types';
import { useUser } from './hooks/useUser';
import CountUp from 'react-countup';

// Reference: https://github.com/ConnerArdman/tetris-react
// -- https://www.youtube.com/watch?v=UuzcvFVH4DQ
// Grid centering reference: https://stackoverflow.com/questions/45536537/centering-in-css-grid
// Gitrows: https://github.com/gitrows/gitrows
// -- trying to use gitrows/github-db introduced errors because of trying to use a javascript-package in typescript, decided to try and install react-app-rewired & stream-browserify (among others) and change some config values
// Changes ref: https://www.alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5

function App() {
	
	// Setup the hook which provides the object representing the various (logical) states of the game
	const { board, startGame, isPlaying, preScore, newScore, upcomingBlocks, numConfetti, removeConfetti } = useTetris();
	const [gameStarted, setIsGameStarted] = useState(false); // Used to disable the 'Start Game' button when clicking, so that it can be displayed but not clicked again until game over
	
	const { updateUserHighscore, isScoreRegisterWindowOpen, setScoreRegisterWindowOpen, getLeaderboardData } = useUser(); // setup user score hook
	
	if (gameStarted && !isPlaying) { setIsGameStarted(false); setScoreRegisterWindowOpen(true); }
	
	return (
		<div className="App grid grid-cols-5 flex-row h-screen bg-gradient-to-tr from-cyan-500 to-slate-200">
			<h1 className='Header text-center font-bold text-5xl col-span-1 col-start-3 row-span-1 row-start-1 self-center'>Tetris</h1>
			{isPlaying && <BackgroundConfetti onAnimEnd={removeConfetti} confettis={numConfetti} />}
			<Board currentBoard={board} /* Declaring/creating a board-component for visualizing the board, and supplying it with the current board state object*/ />
			<div className='LeftSide col-span-1 row-span-1 col-start-1 row-start-2 grid grid-cols-1 grid-rows-4 border-4 rounded-lg border-black justify-center bg-blue-400'>
				<div className='Score col-span-1 row-span-1 row-start-2 row-end-2 self-center'>
					<h2 className='Text text-4xl'>Score</h2>
					<CountUp start={preScore} end={newScore} duration={3} delay={0} >
						{
							({ countUpRef }) => (
								<span ref={countUpRef} className='text-3xl' />
							)
						}
					</CountUp>
				</div>
				<Leaderboard users={getLeaderboardData} />
			</div>
			<div className='RightSide col-span-1 row-span-1 col-start-5 row-start-2 grid grid-rows-4 border-4 rounded-lg border-black bg-blue-400'>
				<div className='Button col-span-1 col-start-1 col-end-1 row-span-1 row-start-2 flex self-end justify-center'>
					<button className={`text-4xl border rounded-md p-3 ${gameStarted ? 'text-gray-400 cursor-default bg-gray-950' : 'text-black bg-white hover:bg-slate-400 active:bg-slate-600'}`} onClick={() => { if (!gameStarted) { startGame(); setIsGameStarted(true); } }}>Start Game</button>
				</div>
				<div className='UpcomingBlocks row-span-1 row-start-3 flex flex-col'>
					{isPlaying && <h1 className='text-xl align-top'>Next block</h1>}
					{isPlaying && <UpcomingBlocks upcomingBlocks={upcomingBlocks} /> /* If the game is active, display the upcoming blocks */}
				</div>
			</div>
			<UserScoreRegisterCard exit={setScoreRegisterWindowOpen} submitScore={updateUserHighscore} score={newScore} showForm={isScoreRegisterWindowOpen} />
		</div>
	);
}

export default App;
