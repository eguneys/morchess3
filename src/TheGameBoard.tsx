import { onCleanup, onMount } from 'solid-js'
import { type GameAPI, main as GameMain } from './thegame/main'

export const TheGameBoard = () => {

    let $el!: HTMLDivElement

    let cleanup_early = false
    let game_api: GameAPI

    onMount(() => {
        GameMain($el).then((api: GameAPI) => {
            if (cleanup_early) {
                api.cleanup()
                return
            }
            game_api = api
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

