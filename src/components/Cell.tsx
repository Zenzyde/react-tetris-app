import { CellOptions } from "../types";

interface Props {
	type: CellOptions; // Props, representing the type of cell, and thus, cell colour that this cell should have based on the tetris-shape occupying this cell
	id: string; // Unique identifier
}

enum CellColor { // Using an enum here because of tailwind, to parse the cell type to the proper colour
	"Empty" = "bg-[#666666]",
	"I" = "bg-[#50e3e6]",
	"J" = "bg-[#245fdf]",
	"L" = "bg-[#dfad24]",
	"O" = "bg-[#dfd924]",
	"S" = "bg-[#30d338]",
	"T" = "bg-[#843dc6]",
	"Z" = "bg-[#e34e4e]"
}

function Cell({ type, id }: Props) {
	return <div id={id} className={`cell ${CellColor[type]} w-[30px] aspect-square border-solid border-[1px] border-black `} />;
}

export default Cell;