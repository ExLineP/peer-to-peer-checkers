import { createFileRoute } from "@tanstack/react-router"
import ChessBoard from "../components/Chessboard"

export const Route = createFileRoute('/match/$match')({
    component: CheckersComponent,
  })
  
  function CheckersComponent() {
    const { match } = Route.useParams()
    return <ChessBoard matchId={match}/>
  }