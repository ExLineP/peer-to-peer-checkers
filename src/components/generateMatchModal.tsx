import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const GenerateMatchModal = ({ onClose }: { onClose: () => void }) => {
	const [id] = useState(uuidv4());

	const handleClose = (event: { stopPropagation: () => void }) => {
		event.stopPropagation();
		onClose();
	};
	return (
		<div
			onClick={onClose}
			className="w-full h-full absolute justify-center place-items-center bg-gray-500 bg-opacity-60 flex flex-col"
		>
			<div
				onClick={(event) => event.stopPropagation()}
				className="w-[600px] h-[200px] bg-slate-300 rounded-2xl flex flex-col"
			>
				<button
					onClick={handleClose}
					className="text-black text-[30px] flex ml-auto mr-6 leading-none"
				>
					x
				</button>
				<div className="justify-center gap-3 place-items-center flex flex-col h-full">
                    <span>Ваш ссылка на матч:</span>
					<a target="_blank" href={window.location.href+ "match/" + id} className="p-2 bg-white rounded-2xl mx-4">{window.location.href+ "match/" + id}</a>
                    <span className="underline underline-offset-2">Киньте эту ссылку вашему оппоненту</span>
				</div>
			</div>
		</div>
	);
};
