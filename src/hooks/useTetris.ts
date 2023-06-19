import { useCallback, useEffect, useState } from "react";
import { getRandomBlock, hasCollisions, BOARD_HEIGHT, useTetrisBoard, getEmptyBoard, BOARD_WIDTH, getNewConfettiObject } from "./useTetrisBoard";
import { useInterval } from "./useInterval";
import { BoardShape, Block, BlockShape, EmptyCell, SHAPES } from "../types";
import { ConfettiObject } from "../types";

// Higher number -> longer between each tick -> slower, lower number -> shorter between each tick -> faster
enum TickSpeed {
	Normal = 800,
	Sliding = 100,
	Fast = 50
}

// 'export function' -> seems to denote the declaration of a hook
// Handles user input and game logic (ex: keeping score) and acts as a wrapper for the 'useTetrisBoard'-hook
export function useTetris() {

	const [score, setScore] = useState(0);
	// Creating the upcoming blocks object hook, initialized as an empty array
	const [upcomingBlocks, setUpcomingBlocks] = useState<Block[]>([]);
	const [isCommitting, setIsCommitting] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	// Creating the tickspeed handling object hook, initialized as null (maybe because null is intepreted as 0/first enum value)
	const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);
	const [isDebugging, setIsDebugging] = useState(false);
	const [numConfetti, setNumConfetti] = useState<ConfettiObject[]>([]);

	// Creating helper object hook which represents the current tetris board state, the rows and columns of the board and the various blocks currently in the board
	// Also provides what i'm assuming to be a dispatch event/'setter' when the board state is updated, this dispatche event/'setter' is provided by 'useTetrisBoard'
	const [
		{ board, droppingRow, droppingColumn, droppingBlock, droppingShape },
		dispatchBoardState
	] = useTetrisBoard();

	// Callback to start the game, handles the logical initialization of the game
	const startGame = useCallback(() => {
		// Create the starting blocks to display as the upcoming blocks
		const startingBlocks = [
			getRandomBlock(),
			getRandomBlock(),
			getRandomBlock()
		];
		// Perform setup of score, visual upcoming blocks, commit-state, playing-state, tick speed, and let the visual board know that the game is starting
		setScore(0);
		setUpcomingBlocks(startingBlocks);
		setIsCommitting(false);
		setIsPlaying(true);
		setTickSpeed(TickSpeed.Normal);
		dispatchBoardState({ type: 'start' });
		setIsDebugging(false);
		setNumConfetti([]);
	}, [dispatchBoardState]);

	// Callback to initialize a commit of a block to its current position
	const commitPosition = useCallback(() => {
		// There is a possibility that isCommitting was set in gameTick, but that the player slided away from the collision
		// -- check if a collision is not happening anymore, and if it isn't, unset isCommitting, reset tick speed and exit the callback
		if (!hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
			setIsCommitting(false);
			setTickSpeed(TickSpeed.Normal);
			return;
		}

		// If the collision is still happening we are ready to perform a commit
		// Create a visual clone of the original board, which holds the currently dropping block as well
		const newBoard = structuredClone(board) as BoardShape;
		// Since we're sure that a commit has been made and should be completed, add the shape to the board logically
		addShapeToBoard(newBoard, droppingBlock, droppingShape, droppingRow, droppingColumn);

		// Next step, since collision has happened, check for and clear any rows that are completely filled, also count up and add the points!
		let numCleared = 0;
		// Go from bottom of the board and up, more efficient than up-to-down since blocks will be stacked down-to-up
		for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
			// For the given row, 'every' checks through all elements of an array and verifies that they meet the condition of the lambda-function
			if (newBoard[row].every((entry) => entry !== EmptyCell.Empty)) {
				// Row meets 'full'-condition, increase number of cleared rows, and remove the row with 'splice' at the current row
				numCleared++;
				newBoard.splice(row, 1);
			}
		}

		if (numCleared > 0) {
			// Add a confetti object to the array
			const newConfetti = numConfetti;
			newConfetti.push(getNewConfettiObject(numConfetti, numCleared));
			setNumConfetti(newConfetti);
		}

		// After block has been committed, get a new block from the upcoming blocks and repopulate the upcoming blocks-list with a new random block
		const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[];
		const newBlock = newUpcomingBlocks.pop() as Block;
		newUpcomingBlocks.unshift(getRandomBlock());

		// As the next block is gonna drop, check if there is any possbility of the new block colliding immediately
		if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) { // -- if so, we've run out of room and the player has lost the game. Game Over!!
			// Set isPlaying to false to disable the tick-loop and end the game
			setIsPlaying(false);
			// Set tickspeed to 0
			setTickSpeed(null);
		}
		else { // -- if not, just reset the tickspeed and keep on playing!
			setTickSpeed(TickSpeed.Normal);
		}

		// After having done all important logical updates for a commit
		// Reset tickspeed
		setTickSpeed(TickSpeed.Normal);
		// Update the upcoming blocks for visualization
		setUpcomingBlocks(newUpcomingBlocks);
		// Update the score based on the number of cleared blocks
		setScore((prevScore) => prevScore + getPoints(numCleared));
		// 'dispatch' the event/'setter' to the visual board to let it perform any needed visual updates based on the 'commit'-action, and give it the updated board and next block to drop to work with
		dispatchBoardState({ type: 'commit', newBoard: [...getEmptyBoard(BOARD_HEIGHT - newBoard.length), ...newBoard], newBlock });
		// Lastly, unset the 'commit'-flag
		setIsCommitting(false);
	}, [board, dispatchBoardState, droppingBlock, droppingColumn, droppingRow, droppingShape, upcomingBlocks]);

	// Callback for removing oldest confetti
	const removeConfetti = useCallback((confettiId: number) => {
		numConfetti.forEach((confetti: ConfettiObject, id: number, arr: ConfettiObject[]) => {
			if (confetti.id === confettiId) {
				confetti.confettiAlive = false;
				return;
			}
		});
	}, []);

	// Callback for ticking the game. Every tick, 'dispatch'(call to set) the 'drop'-action, perform any relevant logic in response to a drop
	const gameTick = useCallback(() => {
		if (isCommitting) { // If commit is marked, make a call to 'commitPosition' and update the board, score, speed and game over-state accordingly
			commitPosition();
		}
		else if (hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
			// If collisions happen, enable 'sliding' for the player and set that a 'commit' can happen in the next tick
			setTickSpeed(TickSpeed.Sliding);
			setIsCommitting(true);
		}
		else { // Nothing has happened yet, let tetris-board know it can do a light visual update
			dispatchBoardState({ type: 'drop' });
		}
	}, [board, commitPosition, dispatchBoardState, droppingColumn, droppingRow, droppingShape, isCommitting]);

	// Hook for keeping track of the ticks that have passed for the duration of the game
	useInterval(() => {
		// No need to tick if the game is not being played
		if (!isPlaying) {
			return;
		}
		// if (isDebugging) {
		// 	return;
		// }

		// We're still playing, so keep dropping blocks and ticking
		gameTick();
	}, tickSpeed); // 'tickSpeed' is the input which denotes how often the interval runs -> every 'tickSpeed'-milliseconds

	// Keeps track of key presses
	useEffect(() => {
		if (!isPlaying) { // Do nothing if the game is not active
			return;
		}

		let isPressingLeft = false;
		let isPressingRight = false;
		let moveIntervalID: number | undefined | NodeJS.Timer;

		// Let the visual board know to move the dropping block either left or right
		// Using local booleans for this which can be controlled by the key up/down events
		// -- this is so left or right movement can be updated continuously with 'updateMovementInterval' so that movement is not reliant on the speed of which the browser dispatches key down events
		const updateMovementInterval = () => {
			clearInterval(moveIntervalID);
			dispatchBoardState({
				type: 'move',
				isPressingLeft,
				isPressingRight
			});
			moveIntervalID = setInterval(() => {
				dispatchBoardState({
					type: 'move',
					isPressingLeft,
					isPressingRight
				});
			}, 300); // The dispatching interval for movement is just an arbitrary number -> 300 ms in this case
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.repeat) { // Make sure rotation only happens once per key press, to stop movement from bugging out
				return;
			}

			if (event.key === 'ArrowDown') {
				setTickSpeed(TickSpeed.Fast);
			}

			// Let the visual board know to rotate the dropping block
			if (event.key === 'ArrowUp') {
				dispatchBoardState({
					type: 'move',
					isRotating: true
				});
			}

			if (event.key === 'ArrowLeft') {
				isPressingLeft = true;
				updateMovementInterval();
			}

			if (event.key === 'ArrowRight') {
				isPressingRight = true;
				updateMovementInterval();
			}

			// if (event.key === 'Spacebar') {
			// 	setIsDebugging(!isDebugging);
			// }
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === 'ArrowDown') {
				setTickSpeed(TickSpeed.Normal);
			}

			if (event.key === 'ArrowLeft') {
				isPressingLeft = false;
				updateMovementInterval();
			}

			if (event.key === 'ArrowRight') {
				isPressingRight = false;
				updateMovementInterval();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
			clearInterval(moveIntervalID);
			setTickSpeed(TickSpeed.Normal);
		};
	}, [dispatchBoardState, isPlaying]);

	// Create a visual clone of the original board, which potentially holds the currently dropping block as well
	// -- this is because we don't add the dropping block shape to the board before its final position has been decided
	const renderedBoard = structuredClone(board) as BoardShape;
	// If playing is true, the currently dropping block should be displayed in the board
	if (isPlaying) {
		addShapeToBoard(renderedBoard, droppingBlock, droppingShape, droppingRow, droppingColumn);
	}

	// Returning the logical state of the board:
	// -- the visual clone state of the board
	// -- the start game function so that the game can be started
	// -- the isPlaying boolean for visual updates depending on if the game is active or not
	// -- the current score for displaying
	// -- and the upcoming blocks for visual display
	return {
		board: renderedBoard,
		startGame,
		isPlaying,
		score,
		upcomingBlocks,
		numConfetti,
		removeConfetti
	};
}

function addShapeToBoard(board: BoardShape, droppingBlock: Block, droppingShape: BlockShape, droppingRow: number, droppingColumn: number) {
	droppingShape.filter((row) => row.some((isSet) => isSet)) // Filter out the false values of any row in a given shape, those will not be rendered so they can be ignored
		.forEach((row: boolean[], rowIndex: number) => { // For each row (boolean array) of the shape that is true
			row.forEach((isSet: boolean, colIndex: number) => { // We render a block in the shape based on the 'isSet' property
				if (isSet) { // And we render each block of the shape in the board at the dropping row + 'rowIndex' of the blocks shape and dropping column + 'columnIndex' of the blocks shape
					board[droppingRow + rowIndex][droppingColumn + colIndex] = droppingBlock;
				}
			});
		});
}


function getPoints(numCleared: number): number {
	switch (numCleared) {
		case 0:
			return 0;
		case 1:
			return 100;
		case 2:
			return 300;
		case 3:
			return 500;
		case 4:
			return 800;
		default:
			throw new Error('Unexpected number of rows cleared');
	}
}