import type { JSX } from "solid-js"
import { Paths } from "../icons_paths"

export type ModuleId = string
export type ModulePuzzleId = string

export type ModulePuzzle = {
    id: ModulePuzzleId
    title: string
    description: string
    initial_fen: string
    base_fen: string
}

export type Module = {
    id: ModuleId
    icon: () => JSX.Element
    title: string
    description: string
    puzzles: ModulePuzzle[]
}


export const The_BasicsI: ModulePuzzle[] = [
    { 
        id: 'empty', 
        title: '8x8 Board', 
        description: 'The game is played on an 8x8 board. There are no pieces to arrange yet. Click the board to activate next level.',
        base_fen: '', 
        initial_fen: ''
    },
    { 
        id: 'thekings', 
        title: '2 Kings', 
        description: 'There are 2 kings on the board. The small red icons meanining they are attacking each other. Because a king can move to all adjacent squares it is on. Separate them to get rid of red icons.', 
        base_fen: '6k1/8/8/8/8/8/8/2K5 w - - 0 1', 
        initial_fen: '8/8/8/4k3/3K4/8/8/8 w - - 0 1'
    },
    { 
        id: 'theknight', 
        title: 'Knight attacks in L Shape', 
        description: 'L shape is a Knight because knight attacks in L shape in all directions. The small red icons means it is attacking both of the kings. Separate them to get rid of red icons.', 
        base_fen: '7k/8/8/8/3K4/8/8/6n1 w - - 0 1', 
        initial_fen: '8/6k1/8/5n2/3K4/8/8/8 w - - 0 1'
    },
    { 
        id: 'thebishop', 
        title: 'Bishop attacks Diagonally', 
        description: 'X shape is a Bishop because bishop attacks diagonally. The small red icons on the Bishop shows which pieces the Bishop attacks. Separate all of them so no piece attacks any other piece.', 
        base_fen: '8/6k1/8/8/8/6N1/1K6/3B4 w - - 0 1', 
        initial_fen: '8/6k1/8/4B3/8/6N1/1K6/8 w - - 0 1'
    },
    { 
        id: 'therook', 
        title: 'Rook attacks in Straight directions', 
        description: '+ shape is a Rook because rook attacks in straight directions. The small red icons on the Rook shows which pieces Rook attacks. Separate all of them so no piece attacks any other piece.', 
        base_fen: '5k2/8/1N6/8/8/3B4/7R/K7 w - - 0 1', 
        initial_fen: '3k4/8/8/N2R3B/8/8/3K4/8 w - - 0 1'
    },
    { 
        id: 'thequeen', 
        title: 'Queen attacks like a bishop and a rook', 
        description: '* shape is a Queen because queen attacks like a bishop and a rook. The small red icons on the Queen shows which pieces Queen attacks. Separate all of them so no piece attacks any other piece.', 
        base_fen: '3k4/8/8/R7/6Q1/8/3K4/8 w - - 0 1', 
        initial_fen: '3k4/8/8/3Q4/8/8/R7/3K4 w - - 0 1'
    },
    { 
        id: 'thepawn', 
        title: 'Pawns attack 1 square diagonnaly forward', 
        description: 'Y shape is a Pawn because pawn attacks diagonally forward by 1 square. The small red icons on the Pawn shows it is attacking the Knight. Separate all of them so they don\'t attack each other.', 
        base_fen: '8/8/8/8/2N5/6P1/8/8 w - - 0 1', 
        initial_fen: '8/8/8/8/2N5/3P4/8/8 w - - 0 1'
    },
    { 
        id: 'thepawn2', 
        title: 'Black Pawns attack 1 square diagonnaly backward', 
        description: 'Upside Y shape is a Black Pawn because black pawn attacks diagonally backward by 1 square. The small red icons on the Pawn shows it is attacking the Knight. Separate all of them so they don\'t attack each other.', 
        base_fen: '8/8/8/8/2N5/6p1/8/8 w - - 0 1', 
        initial_fen: '8/8/8/3p4/2N5/8/8/8 w - - 0 1'
    },
]

const The_BasicsII: ModulePuzzle[] = [
    { 
        id: 'attraction', 
        title: 'Kings attraction', 
        description: 'Ah, now the little red icons are orbiting. Orbiting red icon on a piece means, the piece should attack the piece on the orbiting icon. Connect the kings so they attack each other.',
        base_fen: '8/8/8/3k4/4K3/8/8/8 w - - 0 1',
        initial_fen: 'k7/8/8/8/8/8/8/7K w - - 0 1' 
    },
    { 
        id: 'attraction2', 
        title: 'Knight attacks King', 
        description: 'Place the Knight so that it should attack the king.',
        base_fen: '8/8/2n5/4K3/8/8/8/8 w - - 0 1',
        initial_fen: '8/8/8/2n1K3/8/8/8/8 w - - 0 1' 
    },
    { 
        id: 'attraction3', 
        title: 'Rook and King', 
        description: 'Place Rook and King near so they attack each other.',
        base_fen: '8/8/8/8/3RK3/8/8/8 w - - 0 1',
        initial_fen: '8/8/2R5/8/8/5K2/8/8 w - - 0 1' 
    },
    { 
        id: 'attraction4', 
        title: 'Bishop and King', 
        description: 'Place Bishop and King near so they attack each other.',
        base_fen: '8/8/8/3b4/4K3/8/8/8 w - - 0 1',
        initial_fen: '8/8/8/8/8/2b2K2/8/8 w - - 0 1' 
    },
    { 
        id: 'attraction5', 
        title: 'Only Rook attacks King', 
        description: 'This time only the Rook attacks the King. But the King doesn\'t attack the Rook.',
        base_fen: '8/8/8/8/8/8/8/R6K w - - 0 1',
        initial_fen: '8/8/2R5/8/4K3/8/8/8 w - - 0 1' 
    },
    { 
        id: 'attraction6', 
        title: 'Only Bishop attacks King', 
        description: 'This time only the Bishop attacks the King. But the King doesn\'t attack the Bishop.',
        base_fen: '8/8/2b5/8/4K3/8/8/8 w - - 0 1',
        initial_fen: '8/8/8/3b4/4K3/8/8/8 w - - 0 1' 
    },
    { 
        id: 'attraction7', 
        title: 'Queen attacks only one King', 
        description: 'Queen attacks only one of the kings. Also make sure Queen doesn\'t attack the other King.',
        base_fen: '7k/8/8/8/8/8/8/K5Q1 w - - 0 1',
        initial_fen: '8/8/8/3Q1k2/8/1K6/8/8 w - - 0 1' 
    },
    { 
        id: 'attraction9', 
        title: 'King combination', 
        description: 'Some Kings attack some Kings, but not other Kings.',
        base_fen: '8/8/8/3k1K2/2K3k1/8/8/8 w - - 0 1',
        initial_fen: 'k6k/8/8/8/8/8/8/K6K w - - 0 1',
    },
    { 
        id: 'attraction8', 
        title: 'Queen King 1 and King 2', 
        description: 'Queen attacks one of the King\'s. Also King\'s attack each other.',
        base_fen: '8/8/8/3Q1k2/5K2/8/8/8 w - - 0 1',
        initial_fen: '8/8/8/3Q4/5k2/1K6/8/8 w - - 0 1' 
    },
]


const Rook_Puzzles: ModulePuzzle[] = [
    { 
        id: 'rooks1', 
        title: '2 Rooks', 
        description: '2 rooks attacking each other.',
        base_fen: '8/8/8/R6R/8/8/8/8 w - - 0 1', 
        initial_fen: '8/8/2R5/8/8/5R2/8/8 w - - 0 1'
    },
    { 
        id: 'rookandknight1', 
        title: 'Rook And Knight', 
        description: 'Rook attacking a Knight.',
        base_fen: '8/8/8/8/8/2R2N2/8/8 w - - 0 1', 
        initial_fen: '8/8/8/8/4N3/2R5/8/8 w - - 0 1'
    },
    { 
        id: 'rooks2', 
        title: '3 Rooks', 
        description: '3 Rooks attacking each other.',
        base_fen: '8/8/2R2R2/8/8/2R5/8/8 w - - 0 1', 
        initial_fen: '8/8/5R2/8/8/2R2R2/8/8 w - - 0 1'
    },
    { 
        id: 'rookandknight2', 
        title: 'Rook And 2 Knights', 
        description: 'Rook attacks one of the Knights. The other Knight attacks the Rook.',
        base_fen: '8/8/8/4R3/8/3r1N2/8/8 w - - 0 1', 
        initial_fen: '8/8/2R5/4N3/8/5r2/8/8 w - - 0 1'
    },
    { 
        id: 'rooks3', 
        title: '4 Rooks', 
        description: '4 Rooks attacking each other.',
        base_fen: 'r6r/8/8/8/8/8/8/R6R w - - 0 1', 
        initial_fen: '8/8/2R5/4r3/3r4/5R2/8/8 w - - 0 1'
    },
    { 
        id: 'rooksandbishop', 
        title: 'Bishop and 2 Rooks', 
        description: 'Bishop attacks 2 Rooks. And Rooks attacks each other.',
        base_fen: '8/8/8/8/8/3R1r2/4B3/8 w - - 0 1', 
        initial_fen: '8/8/8/2R1B3/8/4r3/8/8 w - - 0 1'
    },
    { 
        id: 'rooks4', 
        title: 'No Rooks attack each other', 
        description: 'Place the Rooks so they don\'t attack each other.',
        base_fen: '8/8/1R6/3R4/4R3/6r1/2r5/8 w - - 0 1', 
        initial_fen: '8/8/2R1r3/3r4/2R1R3/8/8/8 w - - 0 1'
    },
]

const Bishop_Puzzles: ModulePuzzle[] = [
    { 
        id: 'bishops1', 
        title: '3 Bishops', 
        description: '3 bishops attacking each other.',
        base_fen: '8/8/2B5/8/4B3/8/2B5/8 w - - 0 1', 
        initial_fen: '8/8/8/8/2B1B1B1/8/8/8 w - - 0 1'
    },
    { 
        id: 'bishopsandknight', 
        title: 'Bishop and Knight attack a King', 
        description: 'Bishop and Knight both attack a King.',
        base_fen: '8/8/4K3/8/2BN4/8/8/8 w - - 0 1', 
        initial_fen: '8/8/8/8/2B2N1K/8/8/8 w - - 0 1'
    },
    { 
        id: 'bishops2', 
        title: '4 Bishops', 
        description: '4 Bishops attacking each other.',
        base_fen: '8/8/4b3/8/2B3b1/8/4B3/8 w - - 0 1', 
        initial_fen: '8/8/8/8/1B1b1B1b/8/8/8 w - - 0 1'
    },
    { 
        id: 'bishops3', 
        title: '4 Bishops don\'t attack each other', 
        description: 'Place the Bishops so they don\'t attack each other.',
        base_fen: '8/1b6/3B4/5B2/7B/8/8/8 w - - 0 1', 
        initial_fen: '8/8/4B3/5B2/4B3/5b2/8/8 w - - 0 1'
    },
]

const Knight_Puzzles: ModulePuzzle[] = [
    { 
        id: 'knight1', 
        title: '3 Knights', 
        description: '3 Knights attacking each other.',
        base_fen: '8/8/8/4n3/6N1/3N4/8/8 w - - 0 1', 
        initial_fen: '8/8/8/8/N5N1/8/8/3n4 w - - 0 1'
    },
    { 
        id: 'knight2', 
        title: '2 Knights vs King', 
        description: '2 Knights attacking a King',
        base_fen: '8/8/8/6N1/3n4/5K2/8/8 w - - 0 1', 
        initial_fen: '8/8/4n3/6N1/8/3K4/8/8 w - - 0 1'
    },
    { 
        id: 'knight3', 
        title: '4 Knights', 
        description: '4 Knights attacking each other',
        base_fen: '8/8/4n3/6N1/3n4/5N2/8/8 w - - 0 1', 
        initial_fen: '8/8/1n3N2/8/8/1n3N2/8/8 w - - 0 1'
    },
    { 
        id: 'knight4', 
        title: '5 Free Knights', 
        description: '5 Knights that don\'t attack each other.',
        base_fen: '3n4/8/1n3N2/8/8/1n3N2/8/8 w - - 0 1', 
        initial_fen: '8/8/8/1n1n1N2/8/2n1N3/8/8 w - - 0 1'
    },
]


const Pawn_Puzzles: ModulePuzzle[] = [
    { 
        id: 'pawnsandking1', 
        title: 'Forward Pawn attacks King', 
        description: 'Forward Pawn and a King attack each other',
        base_fen: '8/8/8/8/8/3K4/2P5/8 w - - 0 1', 
        initial_fen: '8/8/8/8/8/8/2P1K3/8 w - - 0 1'
    },
    { 
        id: 'pawnsandknight', 
        title: 'Backward Pawn attacks Knight', 
        description: 'Backward Pawn attacks a Knight',
        base_fen: '8/3p4/4n3/8/8/8/8/8 w - - 0 1', 
        initial_fen: '8/3p1n2/8/8/8/8/8/8 w - - 0 1'
    },
    { 
        id: '2pawns', 
        title: 'Pawn Tension', 
        description: '2 Pawns attacking each other',
        base_fen: '8/8/8/8/4p3/3P4/8/8 w - - 0 1', 
        initial_fen: '8/8/8/8/8/1P3p2/8/8 w - - 0 1'
    },
    { 
        id: 'pawns1', 
        title: 'Forward Pawn Chain', 
        description: '3 Forward Pawns form a chain by attacking each other.',
        base_fen: '8/8/8/8/3P4/2P5/1P6/8 w - - 0 1', 
        initial_fen: '8/8/8/8/8/8/1P1P2P1/8 w - - 0 1'
    },
    { 
        id: 'pawns2', 
        title: 'Backward Pawns', 
        description: '4 Backward Pawns that don\'t attack each other',
        base_fen: '8/2pppp2/8/8/8/8/8/8 w - - 0 1', 
        initial_fen: '8/5p2/4p3/3p4/2p5/8/8/8 w - - 0 1'
    },
    { 
        id: 'bishopandpawns', 
        title: 'Bishop And Pawns', 
        description: 'Bishop And Pawns attacking each other.',
        base_fen: '8/5p2/4B3/8/8/1P6/8/8 w - - 0 1', 
        initial_fen: '8/8/8/8/8/1P2B1p1/8/8 w - - 0 1'
    },
    { 
        id: 'knightandpawns', 
        title: 'Knight And Pawns', 
        description: 'Knight And Pawns attacking each other.',
        base_fen: '8/8/8/2N5/3P4/1P6/3N4/8 w - - 0 1', 
        initial_fen: '8/8/8/8/8/6N1/P1P1N3/8 w - - 0 1'
    },
    { 
        id: 'rookandpawns', 
        title: 'Rook And Pawns', 
        description: 'Rook And Pawns attacking each other.',
        base_fen: '8/8/5p2/3Rr3/2P5/8/8/8 w - - 0 1', 
        initial_fen: '8/8/8/8/P1R1r2p/8/8/8 w - - 0 1'
    },
    { 
        id: 'pawnshelter', 
        title: 'Pawn Shelter', 
        description: 'King is in a Pawn Shelter',
        base_fen: '8/8/8/8/8/8/PPP5/1K6 w - - 0 1', 
        initial_fen: 'P6P/8/8/8/8/8/8/K6P w - - 0 1'
    },
    { 
        id: 'kingfianchetto', 
        title: 'King Fianchetto', 
        description: 'King is again in a Pawn Shelter',
        base_fen: '8/8/8/8/8/6P1/5PKP/8 w - - 0 1', 
        initial_fen: '8/8/8/2P1P3/8/2K1P3/8/8 w - - 0 1'
    },
]

const Queen_Puzzles: ModulePuzzle[] = [
    { 
        id: 'queenvsrook', 
        title: 'Queen vs 3 Rooks', 
        description: 'Queen attacks a bunch of Rooks',
        base_fen: '8/5R2/8/3Q4/8/1R6/6R1/8 w - - 0 1', 
        initial_fen: '8/5R2/8/2Q5/8/1R6/6R1/8 w - - 0 1'
    },
    { 
        id: 'queenknightandking', 
        title: 'Queen Knight and a King', 
        description: 'Queen and Knight attack a King',
        base_fen: '5K2/5Q2/8/6N1/8/8/8/8 w - - 0 1', 
        initial_fen: '5K2/8/8/8/8/8/1Q6/6N1 w - - 0 1'
    },
    { 
        id: 'queenstrange', 
        title: 'Queen Attacks All Directions', 
        description: 'Queen Attacks to All Directions',
        base_fen: '8/8/2K1K1K1/8/2K1Q1K1/8/2K1K1K1/8 w - - 0 1', 
        initial_fen: 'K3K2K/8/8/8/5Q2/K6K/8/K2K3K w - - 0 1'
    },
    { 
        id: '4queens', 
        title: '4 Queens', 
        description: '4 Queens attacking each other',
        base_fen: '8/8/8/8/3Q4/2Q1Q3/3Q4/8 w - - 0 1', 
        initial_fen: '8/8/8/6Q1/4Q3/2Q5/Q7/8 w - - 0 1'
    },
    { 
        id: 'queen1', 
        title: '8 Queen\'s Problem', 
        description: 'The Famous Puzzle re-demonstrated',
        base_fen: '3Q4/1Q6/6Q1/2Q5/5Q2/7Q/4Q3/Q7 w - - 0 1', 
        initial_fen: '7Q/6Q1/5Q2/4Q3/3Q4/2Q5/1Q6/Q7 w - - 0 1'
    },
]

const RemixI_Puzzles: ModulePuzzle[] = [
    { 
        id: 'remix1', 
        title: '', 
        description: '',
        base_fen: '', 
        initial_fen: ''
    },
]

const King_Puzzles: ModulePuzzle[] = [
    { 
        id: 'empty', 
        title: '8x8 Board', 
        description: 'The game is played on an 8x8 board. There are no pieces to arrange yet. Click the board to activate next level.',
        base_fen: '', 
        initial_fen: ''
    },
]

export const Learn_Modules: Module[] = [
    {
        id: "basicsI",
        icon: Paths.king,
        title: "The Basics I",
        description: "What is Chess? What are all these symbols?",
        puzzles: The_BasicsI
    },
    {
        id: "basicsII",
        icon: Paths.king,
        title: "The Basics II",
        description: "All about the pieces attacking each other.",
        puzzles: The_BasicsII
    },
    {
        id: "rook",
        icon: Paths.rook,
        title: "The Rook",
        description: "Puzzles involving the Rook",
        puzzles: Rook_Puzzles
    },
    {
        id: "bishop",
        icon: Paths.bishop,
        title: "The Bishop",
        description: "Puzzles involving the Bishop",
        puzzles: Bishop_Puzzles
    },
    {
        id: "knight",
        icon: Paths.knight,
        title: "The Knight",
        description: "Puzzles involving the Knight",
        puzzles: Knight_Puzzles
    },
    {
        id: "pawn",
        icon: Paths.pawn,
        title: "The Pawns",
        description: "Puzzles involving the Pawns",
        puzzles: Pawn_Puzzles
    },
    {
        id: "queen",
        icon: Paths.queen,
        title: "The Queen",
        description: "Puzzles involving the Queen",
        puzzles: Queen_Puzzles
    },
    /*
    {
        id: "remix1",
        icon: Paths.queen,
        title: "Remix I",
        description: "Special mix of curated puzzles",
        puzzles: RemixI_Puzzles
    },
    */
]
