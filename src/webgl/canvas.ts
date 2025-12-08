import { DragHandler } from "../drag"
import { BatchRenderer } from "./BatchRenderer"
import { Renderer } from "./renderer"

export let drag: DragHandler
export let batch: BatchRenderer

export function init_canvas() {

    let canvas = document.createElement('canvas')

    canvas.width = 1920
    canvas.height = 1080

    const renderer = new Renderer(canvas, 32_768)
    renderer.setupInstancing()

    batch = new BatchRenderer(renderer, 16_384)

    drag = DragHandler(canvas)

    return canvas
}