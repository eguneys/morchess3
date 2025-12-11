import { createEffect, onCleanup, onMount } from 'solid-js'
import { type GameAPI, main as GameMain } from './thegame/main'
import type { FEN } from './thegame/aligns'
import type { SimulApi } from './thegame/simulation2'

export const TheGameBoard = (props: { fen?: FEN, target?: FEN, nb_steps?: number, set_update_fen: (_: FEN) => void , set_update_steps: (_: number) => void, set_update_solved: () => void }) => {

    let $el!: HTMLDivElement

    let cleanup_early = false
    let game_api: GameAPI
    let simul_api: SimulApi

    let load_fen_on_init: [FEN, FEN, number] | undefined


    createEffect(() => {
        let fen = props.fen
        let target = props.target
        let steps = props.nb_steps ?? 0
        if (!fen || !target) {
            return
        }

        if (simul_api) {
            simul_api.load_position(fen, target, steps)
        } else {
            load_fen_on_init = [fen, target, steps]
        }
    })

    onMount(() => {
        GameMain($el).then((api: GameAPI) => {
            if (cleanup_early) {
                api.cleanup()
                return
            }
            game_api = api
            game_api.request_api().then((api: SimulApi) => {
                simul_api = api
                if (load_fen_on_init) {
                    simul_api.load_position(...load_fen_on_init)
                    load_fen_on_init = undefined
                }
                simul_api.set_update_steps(props.set_update_steps)
                simul_api.set_update_fen(props.set_update_fen)
                simul_api.set_update_solved(props.set_update_solved)
            })

        })
    })

    onCleanup(() => {
        if (!game_api) {
            cleanup_early = true
            return
        }
        game_api.cleanup()
    })

    return (<> <div ref={$el} class='game-wrap'></div> </>)
}

