import { createEffect, onCleanup, onMount } from 'solid-js'
import { demo as GameMain } from './thegame/main'
import type { FEN } from './thegame/aligns'
import type { SimulApi } from './thegame/simulation2'
import { AppendAsyncGameToDomManager } from 'twisterjs'

/**
 * A clean, loop-free integration between Solid and an imperative engine.
 *
 * - Solid props.fen/target/steps can change (e.g., selecting a new puzzle).
 * - Engine can change fen/steps through its own UI.
 * - A SyncController mediates the two sources safely.
 */

export const TheGameBoard = (props: {
  is_muted: boolean,
  fen?: FEN,
  target?: FEN,
  nb_steps?: number,
  set_update_fen: (_: FEN) => void,
  set_update_steps: (_: number) => void,
  set_update_solved: () => void
}) => {

  let el!: HTMLDivElement
  let simulApi: SimulApi | null = null

  /**
   * Sync controller:
   * Tracks the latest values that the ENGINE is known to hold.
   * Prevents Solid→Engine→Solid loops by distinguishing update origins.
   */
  const sync = {
    fen: undefined as FEN | undefined,
    target: undefined as FEN | undefined,
    steps: undefined as number | undefined,

    /**
     * Called whenever Solid props change.
     * This returns TRUE if engine must load a new position,
     * or FALSE if props reflect what the engine already has.
     */
    shouldEngineLoad(f: FEN, t: FEN, s: number) {
      return !(this.fen === f && this.target === t && this.steps === s)
    },

    /**
     * Mark that the engine now “owns” these values.
     * Used after calling engine.load_position and after engine emits updates.
     */
    setEngineState(f: FEN, t: FEN, s: number) {
      this.fen = f
      this.target = t
      this.steps = s
    }
  }

  async function renderFn() {
    let res = await GameMain(el)

    simulApi = await res.request_api()

    bind_simul_api(simulApi)

    return res
  }

  onMount(() => {
    let { on_new_renderFn, on_destroy } = AppendAsyncGameToDomManager(el)

    createEffect(() => {
      on_new_renderFn(renderFn)
    })

    onCleanup(() => {
      on_destroy()
    })
  })

  const bind_simul_api = (simulApi: SimulApi) => {
    simulApi.set_muted(set_muted)

    // Engine → Solid event bridges
    simulApi.set_update_fen((fen: FEN) => {
      // Engine-originated update
      sync.fen = fen
      queueMicrotask(() => {
        props.set_update_fen(fen)
      })
    })

    simulApi.set_update_steps((steps: number) => {
      sync.steps = steps
      queueMicrotask(() => {
        props.set_update_steps(steps)
      })
    })

    simulApi.set_update_solved(() => {
      queueMicrotask(() => {
        props.set_update_solved()
      })
    })

    // Initial load if props are ready at mount
    const f = props.fen
    const t = props.target
    const s = props.nb_steps ?? 0

    if (f && t) {
      sync.setEngineState(f, t, s)
      simulApi.load_position(f, t, s)
    }
  }

  let set_muted = false

  createEffect(() => {
    set_muted = props.is_muted
    if (simulApi) {
      simulApi.set_muted(set_muted)
    }
  })

  /**
   * React to Solid-driven FEN/target/step changes.
   * Only loads engine if they differ from known engine state.
   */
  createEffect(() => {
    const f = props.fen
    const t = props.target
    const s = props.nb_steps ?? 0

    if (!simulApi) return

    if (!f || !t) return

    if (!sync.shouldEngineLoad(f, t, s)) {
      // Solid is just reflecting what engine already knows → ignore
      return
    }

    // Solid is giving a new position → engine must load it
    sync.setEngineState(f, t, s)
    simulApi.load_position(f, t, s)
  })

  return <div ref={el} class='w-full h-full flex justify-content items-center'></div>
}
