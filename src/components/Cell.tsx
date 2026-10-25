import { CellOptions } from "../types";

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

function CellToRadialColor(type: CellOptions): string {
	let color = CellColor[type];
	return color.replace("bg-[#", "#").replace("]", "");
}

interface PolarCellProps {
    id: string;
    d: string;
    fill: CellOptions;
    stroke?: string;
    strokeWidth?: string;
}

function PolarCell({ id, d, fill, stroke, strokeWidth }: PolarCellProps) {
	return <path id={id} d={d} fill={CellToRadialColor(fill)} stroke={stroke} strokeWidth={strokeWidth} />;
}

export default PolarCell;