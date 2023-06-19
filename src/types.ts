export enum Block {
	I = 'I',
	J = 'J',
	L = 'L',
	O = 'O',
	S = 'S',
	T = 'T',
	Z = 'Z'
}

export enum EmptyCell {
	Empty = 'Empty'
}

export type ConfettiObject = {
	id: number;
	size: number;
	confettiAlive: boolean;
}

export type CellOptions = Block | EmptyCell; // Each cell can either be an enum representing the various tetris shapes, or an empty cell

export type BoardShape = CellOptions[][];

export type BlockShape = boolean[][]; // Cell value of block shape is either true or false -> cell of the shape either contains a block or is empty

type ShapesObj = {
	[key in Block]: {
		shape: BlockShape;
	}
}

export const SHAPES: ShapesObj = {
	I: {
		shape: [
			[false, false, false, false],
			[false, false, false, false],
			[true, true, true, true],
			[false, false, false, false]
		]
	},
	J: {
		shape: [
			[false, false, false],
			[true, false, false],
			[true, true, true],
		]
	},
	L: {
		shape: [
			[false, false, false],
			[false, false, true],
			[true, true, true]
		]
	},
	O: {
		shape: [
			[true, true],
			[true, true]
		]
	},
	S: {
		shape: [
			[false, false, false],
			[true, true, false],
			[false, true, true]
		]
	},
	T: {
		shape: [
			[false, false, false],
			[false, true, false],
			[true, true, true]
		]
	},
	Z: {
		shape: [
			[false, false, false],
			[false, true, true],
			[true, true, false]
		]
	}
}