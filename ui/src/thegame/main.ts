import { BatchRenderer, DragHandler, Init_canvas, Loop, type InitCanvas } from 'twisterjs'
import * as simulate from './simulation2'
import { audio } from "./simulation2"

type Scene = {
    _set_ctx(batch: BatchRenderer, drag: DragHandler): void
    _init(): void
    _update(delta: number): void
    _render(): void
    _after_render?: () => void
    _cleanup: () => void
    next_scene(): SceneName | undefined
}

const default_scene = {
    _set_ctx(_batch: BatchRenderer, _drag: DragHandler) {},
    _init() {},
    _update(_delta: number) {},
    _render() {},
    _cleanup() {},
    next_scene() { return undefined }
}

let current_scene: Scene
let next_scene: Scene

function switch_to_scene(scene: Scene) {
    next_scene._cleanup?.()
    next_scene = scene
}

let Scenes: Record<string, Scene> = {
    'simulate': simulate
} as const

export type SceneName = keyof typeof Scenes;


function _init() {

    current_scene = default_scene
    next_scene = current_scene

    switch_to_scene(simulate)
}

function _update(delta: number) {

    if (next_scene !== current_scene) {
        current_scene = next_scene
        current_scene._set_ctx(batch, drag)
        current_scene._init()
        // TODO fix
        resolve_simul_api(simulate._api())
    }

    current_scene._update(delta)

    let next = current_scene.next_scene()

    if (next !== undefined) {
        switch_to_scene(Scenes[next])
    }

    drag.update(delta)
}

function _render() {
    current_scene._render()
}



function _after_render() {
    current_scene._after_render?.()
}

function _cleanup() {
    current_scene._cleanup()
    init_canvas.cleanup()
}

export type GameAPI = {
    canvas: HTMLCanvasElement
    cleanup: () => void
    request_api: () => Promise<simulate.SimulApi>
}

let init_canvas: InitCanvas

let resolve_simul_api: (value: simulate.SimulApi) => void

let batch: BatchRenderer
let drag: DragHandler

export async function demo(el: HTMLElement): Promise<GameAPI> {

    _init()

    init_canvas  = Init_canvas(1080, 1080, el, _render)

    batch = init_canvas.batch
    drag = DragHandler(1080, 1080, init_canvas.canvas)

    await audio.load()

    let cleanup_loop = Loop(_update, _render, _after_render)


    return {
        canvas: init_canvas.canvas,
        cleanup: () => {
            cleanup_loop()
            _cleanup()
        },
        request_api: () => {
            return new Promise(resolve => resolve_simul_api = resolve)
        }
    }
}