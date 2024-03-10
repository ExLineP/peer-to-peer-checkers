import { useEffect, useState } from "react";
import { joinRoom } from "trystero/torrent";
import { Loading } from "./Loading";

type SquareColor = "B" | "W";
type Piece = null | "BP" | "WP";
type Cell = [SquareColor, Piece];
type Row = Cell[];
type ChessBoard = Row[];
type Position = [number, number];

const isValidMove = (
	[selectedRow, selectedCol]: Position,
	[targetRow, targetCol]: Position,
	turn: "B" | "W",
	board: ChessBoard
): boolean => {
	const rowDifference = targetRow - selectedRow;
	const colDifference = Math.abs(targetCol - selectedCol);

	if (
		colDifference === 1 &&
		((turn === "W" && rowDifference === -1) ||
			(turn === "B" && rowDifference === 1))
	) {
		return true;
	}

	if (colDifference === 2) {
		const middleRow = (selectedRow + targetRow) / 2;
		const middleCol = (selectedCol + targetCol) / 2;
		const middleCell = board[middleRow][middleCol];
		const targetCell = board[targetRow][targetCol];

		if (
			middleCell[1] !== null &&
			targetCell[1] === null &&
			middleCell[1].startsWith(turn === "B" ? "W" : "B")
		) {
			return true;
		}
	}

	return false;
};

function createChessBoard(): ChessBoard {
	return Array.from({ length: 8 }, (_, i) =>
		Array.from({ length: 8 }, (_, j) => {
			const squareColor: SquareColor = (i + j) % 2 === 0 ? "W" : "B";
			const piece: Piece =
				squareColor === "B" ? (i < 3 ? "BP" : i > 4 ? "WP" : null) : null;
			return [squareColor, piece];
		})
	);
}

const ChessBoard = () => {
	const [cellSize] = useState(60);
	const [loading, setLoading] = useState(true);
	const [board, setBoard] = useState(createChessBoard());
	const [turn, setTurn] = useState<"B" | "W">("W");
	const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);

	const handleMove = (
		selectedPiece: Position | null,
		TargetRowIndex: number,
		TargetFieldIndex: number,
		isOpponent: boolean
	) => {
		const newBoard: ChessBoard = board.map((row) =>
			row.map((cell) => [...cell])
		);

		const targetCell = newBoard[TargetRowIndex][TargetFieldIndex];
		const currentTurn = turn === "W" ? "WP" : "BP";

		if (selectedPiece === null && targetCell[1] === currentTurn) {
			setSelectedPiece([TargetRowIndex, TargetFieldIndex]);
			console.log("Selected:", TargetRowIndex, TargetFieldIndex);
			return;
		}

		if (
			selectedPiece?.toString() ===
			[TargetRowIndex, TargetFieldIndex].toString()
		) {
			setSelectedPiece(null);
			return;
		}

		if (selectedPiece && !targetCell[1] && targetCell[0] != "W") {
			if (
				isValidMove(
					selectedPiece,
					[TargetRowIndex, TargetFieldIndex],
					turn,
					board
				)
			) {
				const [selectedRow, selectedField] = selectedPiece;
				const selectedCell = newBoard[selectedRow][selectedField];
				newBoard[TargetRowIndex][TargetFieldIndex][1] = selectedCell[1];
				newBoard[selectedRow][selectedField][1] = null;

				if (Math.abs(TargetRowIndex - selectedRow) === 2) {
					const middleRow = (selectedRow + TargetRowIndex) / 2;
					const middleCol = (selectedField + TargetFieldIndex) / 2;
					newBoard[middleRow][middleCol][1] = null;
				}

				setBoard(newBoard);
				if (!isOpponent) {
					sendMove(
						JSON.stringify([selectedPiece, TargetRowIndex, TargetFieldIndex])
					);
				}
				setSelectedPiece(null);
				setTurn(turn === "W" ? "B" : "W");
				return;
			}
		}
	};
	//////////////////////////////////////////
	const [date] = useState(new Date());
	const room = joinRoom({ appId: "chekers" }, "101");
	room.onPeerJoin((peerId) => {
		if (players.length === 2) {
			setSpectators([...spectators, peerId]);
			return;
		}
		setPlayers([...players, peerId]);
		sendJoinData(JSON.stringify([board, date, turn]));
	});
	room.onPeerLeave((peerId) => {
		setPlayers([...players.filter((player) => player != peerId)]);
		setPlayers([...spectators.filter((player) => player != peerId)]);
		console.log(peerId + " left");
	});

	const resetBoard = () => {
		setBoard(createChessBoard());
		setTurn("W");
		setSelectedPiece(null);
	};

	const [players, setPlayers] = useState<string[]>([]);
	const [spectators, setSpectators] = useState<string[]>([]);

	const [sendMove, getMove] = room.makeAction("move");
	const [sendJoinData, getJoinData] = room.makeAction("joinData");
	const [sendReset, getReset] = room.makeAction("reset");

	getMove((move) => move && handleOpponentMove(move.toString()));

	getReset(() => {
		resetBoard();
	});

	getJoinData((data, peerId) => {
		if (data) {
			const [board, dateString, turn] = JSON.parse(data.toString());
			const dateOpponent = new Date(dateString);
			if (date > dateOpponent) {
				setLoading(true);
				setBoard(board);
				setTurn(turn);
			}
		}
		setTimeout(() => {
			setLoading(false);
		}, 1000);
		console.log("loaded board");
	});

	useEffect(() => {
		setPlayers(["Myself"]);
	}, []);

	useEffect(() => {
		console.log("Players:", players);
	}, [players]);

	useEffect(() => {
		console.log("Spectators:", spectators);
	}, [spectators]);

	const handleOpponentMove = (move: string) => {
		const moveData = JSON.parse(move);
		const [selectedPiece, RowIndex, FieldIndex] = moveData;
		console.log(JSON.parse(move));
		handleMove(selectedPiece, RowIndex, FieldIndex, true);
	};

	useEffect(() => {
		const handleTabClose = (event) => {
			room.leave();
		};
		window.addEventListener("beforeunload", handleTabClose);
		return () => {
			window.removeEventListener("beforeunload", handleTabClose);
		};
	}, []);

	return (
		<div className="flex min-h-screen w-full font-mono bg-slate-200 gap-8 flex-col justify-center place-items-center select-none">
			{!loading ? (
				<>
					<span className="text-[35px] font-bold">
						Ходят: {turn === "W" ? "Белые" : "Чёрные"}
					</span>
					<div className="border-black border-[10px]">
						{board.map((row, index) => {
							const RowIndex = index;
							return (
								<div key={RowIndex} className="flex">
									{row.map((field, index) => {
										const FieldIndex = index;
										const squareColor = field[0];
										const piece = field[1];
										return (
											<div
												key={FieldIndex}
												onClick={() =>
													handleMove(selectedPiece, RowIndex, FieldIndex, false)
												}
												className={`${
													cellSize &&
													`w-[50px] h-[50px] xl:w-[80px] xl:h-[80px]`
												} flex justify-center place-items-center ${
													squareColor === "W" ? "bg-white" : "bg-[#49a248]"
												} ${
													[RowIndex, FieldIndex].toString() ===
														selectedPiece?.toString() && "bg-red-500"
												}`}
											>
												{piece === "WP" ? (
													<div
														className={`w-[35px] h-[35px] xl:w-[50px] xl:h-[50px] rounded-full border-[2px] border-black bg-white`}
													/>
												) : null}

												{piece === "BP" ? (
													<div
														className={`w-[35px] h-[35px] xl:w-[50px] xl:h-[50px] rounded-full border-[2px] border-white bg-black`}
													/>
												) : null}
											</div>
										);
									})}
								</div>
							);
						})}
					</div>

					<button
						onClick={() => {
							sendReset("");
							resetBoard();
						}}
						className="w-[200px] h-[50px] bg-red-700"
					>
						<span className="text-[25px] text-white">Сбросить</span>
					</button>
				</>
			) : (
				<Loading />
			)}
		</div>
	);
};

export default ChessBoard;
