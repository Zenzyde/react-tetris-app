import { Dispatch, useReducer } from "react";
import { BoardShape, BlockShape, Block, SHAPES, EmptyCell, ConfettiObject } from "../types";

export const BOARD_WIDTH = 20;
export const BOARD_HEIGHT = 15;
// The screen sector where the dropping block is always displayed, the board turns beneath it instead of the block moving
export const SPAWN_SCREEN_COLUMN = 18;

// Object representing the current board state
export type BoardState = {
	board: BoardShape; // Object representing the state of the array that is the board
	droppingRow: number; // The row the currently dropping block is on
	droppingColumn: number; // The column the currently dropping block is on
	droppingBlock: Block; // The enum representing which type/color the currently dropping block has/is of
	droppingShape: BlockShape; // Boolean array representing the shape of the currently dropping block, as well as it's current rotation
	boardRotation: number; // Total number of sectors the board has been turned, unbounded so the visual rotation can animate continuously
}

// Handles the board state, acts as wrapper for the React state reducer we're using to track the state of the board
export function useTetrisBoard(): [BoardState, Dispatch<Action>] { // Returns state of the board, as well as 'dispatcher-function' -> the 'dispatchBoardState' setter so that we can access and update the board from outside this hook

	// reducer state setup for start of the game -- 'dispatchBoardState' is the 'setter' for updating the state of the board
	const [boardState, dispatchBoardState] = useReducer(
		// Setting up 'dummy values' for the initial game state -- this is the data 'boardState' holds
		boardReducer,
		{
			board: [],
			droppingRow: 0,
			droppingColumn: 0,
			droppingBlock: Block.I,
			droppingShape: SHAPES.I.shape,
			boardRotation: 0,
			particleBoard: []
		},
		// Initializer function to set up an empty board before the game is properly started -- this is the initial value of the board state hook
		(emptyState) => {
			const state = {
				...emptyState, // ...-operator 'spreads' (iterates) over an iterable (ex: array), here 'emptyState' is filled with the values representing the empty board
				board: getEmptyBoard(),
			};
			return state;
		}
	);

	return [boardState, dispatchBoardState];
}

// Helper function for getting a new empty board object in the form of 'BoardShape' -> an array of 'Empty'- or 'Block'-enums
export function getEmptyBoard(height = BOARD_HEIGHT): BoardShape {
	// Returning an array with length of height, filling it as an empty array and mapping each empty element with a new array, that is a length of width and holds 'Empty'-enum values
	return Array(height).fill(null).map(() => Array(BOARD_WIDTH).fill(EmptyCell.Empty));
}

// Object representing the various states of the game that the player can use to manipulate the game
type Action = {
	type: 'start' | 'drop' | 'commit' | 'move';
	newBoard?: BoardShape | undefined;
	newBlock?: Block;
	isPressingLeft?: boolean;
	isPressingRight?: boolean;
	isRotating?: boolean;
};

// Internal function which handles responses to the players inputs and updates the current board state accordingly
function boardReducer(state: BoardState, action: Action): BoardState {

	// Creating a copy of the current board state that can be manipulated and returned without having to rebuild the entire board if we don't need to
	let newState = { ...state };

	switch (action.type) {
		// If the game has just started, get a random block to drop and return the empty board with the randomly chosen block dropping at the top-center of the board
		// Game has just started so no need to use and manipulate the copy
		case 'start': {
			const firstBlock = getRandomBlock();
			return {
				...state,
				board: getEmptyBoard(),
				droppingRow: 0,
				droppingColumn: wrapColumn(SPAWN_SCREEN_COLUMN - state.boardRotation),
				droppingBlock: firstBlock,
				droppingShape: SHAPES[firstBlock].shape
			};
		}
		case 'drop':
			// Only drop if there is room below, so a block can never be pushed into the stack
			if (!hasCollisions(newState.board, newState.droppingShape, newState.droppingRow + 1, newState.droppingColumn)) {
				newState.droppingRow++;
			}
			break;
		case 'commit':
			// The current block collided and committed to its position, return a new and fully updated board with a new dropping bock
			return {
				...state,
				// Also, in case a commit resulted in some rows getting cleared, return the board as a new object with the full height based on the missing rows, and fill it in with the values of the updated board
				board: [
					...getEmptyBoard(BOARD_HEIGHT - action.newBoard!.length),
					...action.newBoard!,
				],
				droppingRow: 0,
				droppingBlock: action.newBlock!,
				droppingShape: SHAPES[action.newBlock!].shape
			};
		case 'move': {
			// Player has requested to move/rotate the current block, might only need to update the rotation of the shape, and possibly handle any collision-offsetting as result of rotation
			const rotatedShape = action.isRotating ? rotateBlock(newState.droppingShape) : newState.droppingShape;
			let columnOffset = action.isPressingLeft ? -1 : 0;
			columnOffset = action.isPressingRight ? 1 : columnOffset;
			const newColumn = wrapColumn(newState.droppingColumn + columnOffset);
			if (!hasCollisions(newState.board, rotatedShape, newState.droppingRow, newColumn)) {
				newState.droppingColumn = newColumn;
				// The block keeps its place on screen, so the board turns the opposite way to the block's move in the logical columns
				newState.boardRotation -= columnOffset;
				newState.droppingShape = rotatedShape;
			}
			break;
		}
		// Safety fallback, in case we somehow fall into an undefined case and don't know what to do, Typescript can tell us what the F happened
		default:
			const unhandledType: never = action.type;
			throw new Error(`Unhandled action type: ${unhandledType}`);
	}
	return newState;
}

function rotateBlock(shape: BlockShape): BlockShape {

	// Store the original shapes lengths
	const rows = shape.length;
	const columns = shape[0].length;

	// Create and a copy of the shape and fill it with empty values
	const rotated = Array(rows).fill(null).map(() => Array(columns).fill(false));

	// Copy the values from the old shape-matrix to the new shape-matrix, rotated 90-degrees
	for (let row = 0; row < rows; row++) {
		for (let column = 0; column < columns; column++) {
			rotated[column][rows - 1 - row] = shape[row][column];
		}
	}

	return rotated;
}

// Helper function for getting a new random block-enum, simple randomization based on the number of options of the enum object
export function getRandomBlock(): Block {
	const blockValues = Object.values(Block);
	return blockValues[Math.floor(Math.random() * blockValues.length)] as Block;
}

// Helper function for adding a new confetti object to the confetti array
export function getNewConfettiObject(confettiArray: ConfettiObject[], rowsCleared: number): ConfettiObject {
	const newID = confettiArray.length === 0 ? 0 : confettiArray[confettiArray.length - 1].id + 1;
	const alive = true;
	const rowsSize = rowsCleared;
	const newConfetti: ConfettiObject = {
		id: newID,
		size: rowsSize,
		confettiAlive: alive
	};

	return newConfetti;
}

// Helper function for wrapping a column index around the board, the board is a ring so columns wrap in both directions
export function wrapColumn(column: number): number {
	return ((column % BOARD_WIDTH) + BOARD_WIDTH) % BOARD_WIDTH;
}

// Helper function for handling collisions
export function hasCollisions(board: BoardShape, currentShape: BlockShape, row: number, column: number): boolean {
	return currentShape.filter((shapeRow) => shapeRow.some((isSet) => isSet)) // Filter out false values of any row in a given shape, will not be rendered so can be ignored
		.some((shapeRow: boolean[], rowIndex: number) => // A cell collides if it is set and either below the board or on top of a non-empty cell (columns wrap around the board)
			shapeRow.some((isSet: boolean, colIndex: number) =>
				isSet && (row + rowIndex >= board.length || board[row + rowIndex][wrapColumn(column + colIndex)] !== EmptyCell.Empty)
			)
		);
}