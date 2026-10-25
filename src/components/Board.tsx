import { BoardShape, CellOptions, EmptyCell } from "../types";
import PolarCell from "./Cell";

interface Props {
	currentBoard: BoardShape; // 2D array representing the current state of each cell in the board
	droppingBoard?: BoardShape | null; // Optional overlay with the currently dropping block, shown at a fixed place on screen
	rotation?: number; // How many sectors the board is turned, the polar board is rotated instead of the dropping block moving
	className?: string; // Optional className for styling the board component
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function createPolarCell(centerX: number, centerY: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle);
	const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

	// M: Move to the starting point of the outer arc (outerStart)
	// A: Draw the outer arc from outerStart to outerEnd
	// L: Draw a line to the inner end point (innerEnd)
	// A: Draw the inner arc from innerEnd to innerStart
	// Z: Close the path

  return [
    'M', outerStart.x, outerStart.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
    'L', innerEnd.x, innerEnd.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    'Z',
  ].join(' ');
}

function PolarCellGrid({ currentBoard, droppingBoard, rotation = 0, className }: Props) {
	const rows = currentBoard.length;
	const cols = currentBoard[0]?.length ?? 0;
  	const size =  rows * 55;
	const center = size / 2;


	// Define rings (radii) and sectors (angles) based on the current board size
	// Base rings on amount of rows

	const rings = Array.from({ length: rows }, (_, i) => {
		return {
			inner: (i + 1) * 35,
			outer: (i + 2) * 35,
		};
	});
	rings.reverse();
	const numSectors = cols;
	const angleStep = 360 / numSectors;

	// Creates the cells of a board, each row is a ring and each column is a sector
	const createCells = (board: BoardShape, idPrefix: string) => {
		const cells: { id: string; d: string; fill: CellOptions }[] = [];
		cells.push({
			id: `${idPrefix}-0-0`,
			d: createPolarCell(center, center, 0, 0, 0, angleStep),
			fill: EmptyCell.Empty,
		});
		rings.forEach((ring, rIdx) => {
			for (let sIdx = 0; sIdx < numSectors; sIdx++) {
			const startAngle = (sIdx * angleStep) + 10;
			const endAngle = ((sIdx + 1) * angleStep) + 10;
			cells.push({
				id: `${idPrefix}-${rIdx}-${sIdx}`,
				d: createPolarCell(center, center, ring.inner, ring.outer, startAngle, endAngle),
				fill: board[rIdx]?.[sIdx] ?? EmptyCell.Empty,
			});
			}
		});
		return cells;
	};

	const stackCells = createCells(currentBoard, 'cell');
	// Only the cells of the dropping block are drawn on top, the rest of the overlay is transparent
	const droppingCells = droppingBoard ? createCells(droppingBoard, 'dropping').filter((cell) => cell.fill !== EmptyCell.Empty) : [];

	return (
		<svg viewBox={`${center-size} ${center-(size * 0.75)} ${size * 2} ${size * 2}`} preserveAspectRatio="xMidYMid meet" className={`select-none ${className ?? ""}`}>
		{/* The settled blocks turn around the centre of the board, the dropping block stays where it is */}
		<g style={{ transform: `rotate(${rotation * angleStep}deg)`, transformOrigin: `${center}px ${center}px`, transition: 'transform 150ms ease-out' }}>
		{stackCells.map((cell) => (
			<PolarCell
			key={cell.id}
			id={cell.id}
			d={cell.d}
			fill={cell.fill}
			stroke="#fff"
			strokeWidth="1"
			/>
		))}
		</g>
		{droppingCells.map((cell) => (
			<PolarCell
			key={cell.id}
			id={cell.id}
			d={cell.d}
			fill={cell.fill}
			stroke="#fff"
			strokeWidth="1"
			/>
		))}
		</svg>
	);
}


export default PolarCellGrid; // Declaring a component using 'function Name()' and then exporting using 'export default Name' seems to denote a component instead of a function-hook