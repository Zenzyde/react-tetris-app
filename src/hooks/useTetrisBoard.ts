import { Dispatch, useReducer } from "react";
import { BoardShape, BlockShape, Block, SHAPES, EmptyCell, ConfettiObject } from "../types";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Object representing the current board state
export type BoardState = {
	board: BoardShape; // Object representing the state of the array that is the board
	droppingRow: number; // The row the currently dropping block is on
	droppingColumn: number; // The column the currently dropping block is on
	droppingBlock: Block; // The enum representing which type/color the currently dropping block has/is of
	droppingShape: BlockShape; // Boolean array representing the shape of the currently dropping block, as well as it's current rotation
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
		case 'start':
			const firstBlock = getRandomBlock();
			return {
				board: getEmptyBoard(),
				droppingRow: 0,
				droppingColumn: 3,
				droppingBlock: firstBlock,
				droppingShape: SHAPES[firstBlock].shape
			};
		case 'drop':
			// We have a block that we are just dropping, no need to update the entire board, just increase and update the current row
			newState.droppingRow++;
			break;
		case 'commit':
			// The current block collided and committed to its position, return a new and fully updated board with a new dropping bock
			return {
				// Also, in case a commit resulted in some rows getting cleared, return the board as a new object with the full height based on the missing rows, and fill it in with the values of the updated board
				board: [
					...getEmptyBoard(BOARD_HEIGHT - action.newBoard!.length),
					...action.newBoard!,
				],
				droppingRow: 0,
				droppingColumn: 3,
				droppingBlock: action.newBlock!,
				droppingShape: SHAPES[action.newBlock!].shape
			};
		case 'move':
			// Player has requested to move/rotate the current block, might only need to update the rotation of the shape, and possibly handle any collision-offsetting as result of rotation
			const rotatedShape = action.isRotating ? rotateBlock(newState.droppingShape) : newState.droppingShape;
			let columnOffset = action.isPressingLeft ? -1 : 0;
			columnOffset = action.isPressingRight ? 1 : columnOffset;
			if (!hasCollisions(newState.board, rotatedShape, newState.droppingRow, newState.droppingColumn + columnOffset)) {
				newState.droppingColumn += columnOffset;
				newState.droppingShape = rotatedShape;
			}
			break;
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

// Helper function for handling collisions
export function hasCollisions(board: BoardShape, currentShape: BlockShape, row: number, column: number): boolean {
	let hasCollision = false; // We assume no collision has happened by default

	currentShape.filter((shapeRow) => shapeRow.some((isSet) => isSet)) // Filter out false values of any row in a given shape, will not be rendered so can be ignored
		.forEach((shapeRow: boolean[], rowIndex: number) => { // For each cell, if set and outside the boards bounds, or if set and any neighbour cells are not empty, colliding!
			shapeRow.forEach((isSet: boolean, colIndex: number) => {
				if (isSet && (row + rowIndex >= board.length || column + colIndex >= board[0].length || column + colIndex < 0 ||
					board[row + rowIndex][column + colIndex] !== EmptyCell.Empty)) {
					hasCollision = true;
				}
			});
		});

	return hasCollision;
}