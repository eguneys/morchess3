import { makeFen, parseFen } from "chessops/fen"
import { fen_to_board, type Board } from "../thegame/aligns"
import { squareFromCoords } from "../thegame/chess/util"
import { get_daily_id, getDailyPick } from "./daily_random"
import type { DailyPuzzleSet, FEN } from "./types"
import { Chess } from "chessops"

const fens_db = () => fetch('/fens_tenk.txt').then(_ => _.text()).then(_ => _.split('\n'))

export class PuzzleUtils {

    static daily_puzzle_set = async (): Promise<DailyPuzzleSet> => {
        let fens = await fens_db()
        let a = getDailyPick(fens, "a")
        let b = getDailyPick(fens, "b")
        let c = getDailyPick(fens, "c")


        a = fen_remove_all_pawns(a)
        b = fen_remove_some_pawns(b)

        let nb_daily_id3 = get_daily_id() * 3

        return {
            a: { id: nb_daily_id3, fen: a},
            b: { id: nb_daily_id3 + 1, fen: b},
            c: { id: nb_daily_id3 + 2, fen: c},
        }
    }

    static todays_date = async (): Promise<Date> => {
        return new Date()
    }
}


function fen_remove_all_pawns(fen: FEN) {

    let pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap()

    for (let sq of pos.board.pawn) {
        pos.board.take(sq)
    }

    return makeFen(pos.toSetup())
}

function fen_remove_some_pawns(fen: FEN) {
    let pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap()

    let nb = pos.board.pawn.size()

    for (let sq of pos.board.pawn) {
        if (nb -- < 4) {
            break
        }
        pos.board.take(sq)
    }

    return makeFen(pos.toSetup())
}