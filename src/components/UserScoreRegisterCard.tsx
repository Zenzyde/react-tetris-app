import { Dispatch, SetStateAction } from "react";
import { User } from "../types";

export interface Props {
	exit: Dispatch<SetStateAction<boolean>>,
	submitScore: (userId: string, newScore: number) => Promise<boolean>,
	score: number,
	showForm: boolean,
};

function UserScoreRegisterCard({exit, submitScore, score, showForm}: Props) {
	
	let username: string;
	
	if (!showForm) return <></>;
	
	return (
		<div className="Login absolute h-screen w-screen bg-gray-300 bg-opacity-70">
			<form onSubmit={(e) => { e.preventDefault(); submitScore(username, score); exit(false); }} className="Login-Card relative top-[40%] left-[40%] bg-cyan-500 h-[25%] w-[25%] rounded-md shadow-black shadow-sm flex flex-wrap justify-center place-content-center">
				<button className="Close-Login-Button absolute right-0 border rounded-md p-1 text-black bg-white hover:bg-slate-400 active:bg-slate-600" type="button" onClick={() => exit(false)}>X</button>
				<label className="Login-Username w-full my-1">Username:
					<input className="Login-Username-Input rounded-md h-5 w-25 mx-2" size={15} onChange={(x) => {username = x.currentTarget.value}}></input>
				</label>
				<label className="Login-Username w-full self-center mx-1 my-1">Score: {score}</label>
				<button className="Make-Account-Button my-2 mx-1 border rounded-md p-1 text-black bg-white hover:bg-slate-400 active:bg-slate-600" type="button" onClick={() => { submitScore(username, score); exit(false); }} >Post score to leaderboard</button>
			</form>
		</div>
	);
}

export default UserScoreRegisterCard;