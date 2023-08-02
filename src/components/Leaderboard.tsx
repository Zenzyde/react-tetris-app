import { User } from "../types";

export interface Props {
	users?: User[];
}

function Leaderboard({users}: Props) {
	return (
		<div className="Leaderboard relative col-span-1 row-span-1 row-start-3 row-end-3 text-lg">Leaderboard
			{
				users && users.map((user: User, id: number) => {
					if (id > 5) {
						return (
							<div className="Leaderboard-Overflow" key={id + "_"}>
								
							</div>
						);
					}
					return (
						<div className="Leaderboard-User flex place-content-evenly border-y border-y-black bg-white" key={id}>
							<p className="m-1" key={id + "_" + id}>{id + 1}</p>
							<p className="m-1" key={id + "_" + user.id}>{user.id}</p>
							<p className="m-1" key={id + "_" + user.highscore}>{user.highscore}</p>
						</div>
					);
				})
			}
		</div>
	);
}

export default Leaderboard;