import { createFileRoute } from "@tanstack/react-router"
import ChessBoard from "../components/Chessboard"

export const Route = createFileRoute('/match/$matchId')({
    component: CheckersComponent,
  })
  
  function CheckersComponent() {
    const { matchId } = Route.useParams()
    return <ChessBoard matchId={matchId}/>
  }