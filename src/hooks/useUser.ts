import { useEffect, useState } from "react";
import { User } from "../types";

const dbPath: string | undefined = process.env.REACT_APP_GIT_DB_PATH;

const dbOptions = {
	server: undefined,
	ns: 'github',
	owner: 'Zenzyde',
	repo: 'tetris-db',
	branch: 'master',
	path: dbPath,
	user: 'Zenzyde',
	token: process.env.REACT_APP_GIT_DB_API_TOKEN,
	csv: { delimiter: ',' },
	type: 'json'
};

const GitRows = require('gitrows');

const gitrows = new GitRows();

gitrows.options(dbOptions);

export function useUser() {
	const [isScoreRegisterWindowOpen, setScoreRegisterWindowOpen] = useState<boolean>(false);
	const [getLeaderboardData, updateLeaderboardData] = useState<User[]>([]);

	useEffect(() => {
		const initLeaderboardData = async () => {
			await getUserLeaderboard();
		}

		initLeaderboardData();
	}, []);

	const updateUserHighscore = async (userId: string, newScore: number): Promise<boolean> => {
		let userExists: boolean = false;

		await gitrows.get(dbPath, { id: userId })
			.then((response: User) => {
				if (response && Object.keys(response).length > 0) {
					userExists = true;
				}
				else {
				}
			})
			.catch((error: any) => {
				console.log("Get-update user error: " + JSON.stringify(error));
			});

		if (userExists) {
			let updatedUserHighscore: User = {
				id: userId,
				highscore: newScore
			};

			await gitrows.update(dbPath, updatedUserHighscore, { id: userId })
				.then(async (response: User) => {
					await getUserLeaderboard();
					return true;
				})
				.catch(async (error: any) => {
					console.log("Update user error: " + JSON.stringify(error));
					return false;
				});
		}
		else {
			let newUserHighscore: User = {
				id: userId,
				highscore: newScore
			};

			await gitrows.put(dbPath, newUserHighscore)
				.then(async (response: any) => {
					await getUserLeaderboard();
					return true;
				})
				.catch(async (error: any) => {
					console.log("Put new user error: " + JSON.stringify(error));
					return false;
				});
		}

		return true;
	};

	const getUserLeaderboard = async (): Promise<boolean> => {
		await gitrows.get(dbPath)
			.then(async (response: User[]) => {
				if (!response || response.length === 0) {
					return false;
				}
				updateLeaderboardData((newData) => newData = response);
				return true;
			})
			.catch(async (error: any) => {
				console.log("Error: " + JSON.stringify(error));
				return false;
			});
		return false;
	};

	return {
		updateUserHighscore,
		isScoreRegisterWindowOpen,
		setScoreRegisterWindowOpen,
		getLeaderboardData
	};
}