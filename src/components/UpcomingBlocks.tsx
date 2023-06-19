import { Block, SHAPES } from "../types";

interface Props { // Prop representing the upcoming blocks from the board
	upcomingBlocks: Block[];
}

enum CellColor { // Using an enum because of using tailwind instead of 'regular' CSS
	'hidden' = 'invisible', //Tailwind interpretes 'hidden' as display:none instead of display:hidden, which is 'invisible' in tailwind
	'I' = 'bg-[#50e3e6]',
	'J' = 'bg-[#245fdf]',
	'L' = 'bg-[#dfad24]',
	'O' = 'bg-[#dfd924]',
	'S' = 'bg-[#30d338]',
	'T' = 'bg-[#843dc6]',
	'Z' = 'bg-[#e34e4e]'
}

function UpcomingBlocks({ upcomingBlocks }: Props) {
	return (
		<div className="upcoming flex flex-row-reverse gap-[10px] border-2 border-black bg-slate-200 h-fit w-fit p-2 items-center self-center">
			{upcomingBlocks.map((block, blockIndex) => { // Iterate through all the upcoming blocks
				// Get the starting shape of the block, and filter out the parts of the shape that are not filled in
				const shape = SHAPES[block].shape.filter((row) =>
					row.some((cell) => cell)
				);
				// Next, essentially create a 'mini-board' to display the next few upcoming blocks, using the blockIndex as key to keep track of the individual blocks
				return (
					<div key={blockIndex} className="BlockIndex">
						{shape.map((row, rowIndex) => {
							return (
								<div key={rowIndex} className="row flex">
									{row.map((isSet, cellIndex) => {
										// Set the color of the blocks based on the Block-enum, with the option of 'invisible' if that cell of the block is not filled in
										const cellClass = isSet ? block : 'hidden';
										return (
											<div key={`${blockIndex}-${rowIndex}-${cellIndex}`} className={`cell hid w-[20px] aspect-square border-solid border-[1px] border-black ${CellColor[cellClass]}`}></div>
										);
									})}
								</div>
							);
						})}
					</div>
				);
			})}
		</div>
	);
}

export default UpcomingBlocks;