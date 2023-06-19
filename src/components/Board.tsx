import { BoardShape } from "../types";
import Cell from "./Cell";

interface Props {
	currentBoard: BoardShape; // 2D array representing the current state of each cell in the board
}

function Board({ currentBoard }: Props) {
	return (
		<div className="border-solid border-2 border-black select-none w-fit m-auto col-span-1 col-start-3 row-span-1 row-start-2 self-start">
			{currentBoard.map((row, rowIndex) => ( // Using 'map' to create a new row for each row in the board, based on the props passed in
				// Providing a row index as key for the row so that React is able to keep track of the rows
				<div className="flex" key={`${rowIndex}`}>
					{row.map((cell, colIndex) => ( // For each row, create a cell for each row- and column-index, also provide the cell-type representing the block-type for that cell
						<Cell key={`${rowIndex}-${colIndex}`} type={cell} id={`${rowIndex}-${colIndex}`} />
					))}
				</div>
			))}
		</div>
	);
}

export default Board; // Declaring a component using 'function Name()' and then exporting using 'export default Name' seems to denote a component instead of a function-hook