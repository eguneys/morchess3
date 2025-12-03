import { AnimChannel } from "./anim";
import { cx, drag } from "./canvas"
import type { SceneName } from "./main"
import { box_intersect, box_intersect_ratio, type Rect } from "./math/rect";
import { sub, vec2, type Vec2 } from "./math/vec2";
import { colors } from "./pico_colors";
import { Palette, Utils, type Color as PaletteColor, type Shape } from "./tetro";

type Color = string

let COLLISIONS = false
COLLISIONS = true

type Cursor = {
    xy: Vec2,
    wh: Vec2,
    follow: {
        x: AnimChannel,
        y: AnimChannel
    },
    drag?: {
        decay: Vec2
        channels: {
            x: AnimChannel,
            y: AnimChannel
        },
        shape: Shape,
        released: boolean
    }
}

let cursor: Cursor

let time: number = 0

let channels: Record<string, AnimChannel> = {
    a: new AnimChannel().swayTo({
        amplitude: 0.1,
        frequency: 2 - 0.1,
        bias: 0.03
    }),
    b: new AnimChannel().swayTo({
        amplitude: 0.1,
        frequency: 2 + 0.1,
        bias: -0.03
    }),
    c: new AnimChannel().swayTo({
        amplitude: 0.1 - 0.05,
        frequency: 2.5,
        bias: 0
    })
}


let a_color_channel = new AnimChannel(0)


let drag_channels: Record<string, { x: AnimChannel, y: AnimChannel }> = {
    a: {
        x: new AnimChannel(),
        y: new AnimChannel()
    },
    b: {
        x: new AnimChannel(),
        y: new AnimChannel(300 * 1)
    },
    c: {
        x: new AnimChannel(),
        y: new AnimChannel(300 * 2)
    },
}


type Shapes = {
    a: Shape
    b: Shape
    c: Shape
}

let shapes: Shapes

let palette_a: Palette
let palette_b: Palette

export function _init() {
    time = 0
    cursor = { 
        xy: vec2(0, 0), 
        wh: { x: 40, y: 40 },
        follow: { 
            x: new AnimChannel().swayTo({ amplitude: -8, frequency: 13, bias: 0 }),
            y: new AnimChannel().swayTo({ amplitude: -8, frequency: 13, bias: 0 }),
        }
    }

    cx.lineCap = 'round'
    cx.lineJoin = 'round'


    shapes = {
        a: Utils.random_shape(),
        b: Utils.random_shape(),
        c: Utils.random_shape()
    }

    palette_a = new Palette(2, 4, [
        ['red', 'red'],
        ['green', 'green'],
        ['yellow', 'yellow'],
        ['white', 'white'],
    ])


    palette_b = new Palette(2, 4, [
        ['red', 'green'],
        ['red', 'green'],
        ['yellow', 'white'],
        ['yellow', 'white'],
    ])
}


const conveyor1_box: Rect = {
    xy: vec2(1550, 100),
    wh: vec2(280, 280)
}
const conveyor2_box: Rect = {
    xy: vec2(1550, 400),
    wh: vec2(280, 280)
}
const conveyor3_box: Rect = {
    xy: vec2(1550, 700),
    wh: vec2(280, 280)
}


const red1_box: Rect = {
    xy: vec2(1200, 110),
    wh: vec2(80, 80)
}

export function _update(delta: number) {

    time += delta / 1000

    cursor.follow.x.followTo(drag.is_hovering[0])
    cursor.follow.y.followTo(drag.is_hovering[1])

    cursor.follow.x.update(delta / 1000)
    cursor.follow.y.update(delta / 1000)

    cursor.xy = vec2(cursor.follow.x.value, cursor.follow.y.value)

    if (cursor.drag === undefined || cursor.drag.released) {
        cursor.follow.x.swayEnabled = true
        cursor.follow.y.swayEnabled = true
    }

    if (cursor.drag && !cursor.drag.released) {
        if (drag.has_moved_after_last_down) {
            cursor.drag.channels.x.followTo(cursor.xy.x - cursor.drag.decay.x)
            cursor.drag.channels.y.followTo(cursor.xy.y - cursor.drag.decay.y)
        }
    }


    let conveyor1_hit = cursor_hits_box(conveyor1_box)
    let conveyor2_hit = cursor_hits_box(conveyor2_box)
    let conveyor3_hit = cursor_hits_box(conveyor3_box)

    if (conveyor1_hit || conveyor2_hit || conveyor3_hit) {

        cursor.follow.x.swayEnabled = false
        cursor.follow.y.swayEnabled = false

    } else {

        if (cursor.drag === undefined) {
            
        }


    }

    if (drag.is_just_down) {
        if (conveyor1_hit) {

            channels.a.swayEnabled = false
            channels.b.swayEnabled = false
            channels.c.swayEnabled = false
            channels.a.springTo(0, { stiffness: 800, damping: 4 })
            channels.b.springTo(0, { stiffness: 800, damping: 3 })
            channels.c.springTo(0, { stiffness: 800, damping: 2 })


            drag_channels.a.x.springTo(-15, {stiffness: 400, damping: 8})
            drag_channels.a.y.springTo(-10, {stiffness: 400, damping: 2})
            cursor.drag = { 
                decay: sub(cursor.xy, { x: drag_channels.a.x.value - 15, y: drag_channels.a.y.value -10 } ),
                channels: drag_channels.a,
                shape: shapes.a,
                released: false
            }

        }
        if (conveyor2_hit) {

            channels.a.swayEnabled = false
            channels.b.swayEnabled = false
            channels.c.swayEnabled = false
            channels.a.springTo(0, { stiffness: 800, damping: 4 })
            channels.b.springTo(0, { stiffness: 800, damping: 3 })
            channels.c.springTo(0, { stiffness: 800, damping: 2 })



            drag_channels.b.x.springTo(-15, { stiffness: 400, damping: 8 })
            drag_channels.b.y.springTo(-10 + 300 * 1, { stiffness: 400, damping: 2 })
            cursor.drag = { 
                decay: sub(cursor.xy, { x: drag_channels.b.x.value - 15, y: drag_channels.b.y.value - 10 } ),
                channels: drag_channels.b,
                shape: shapes.b,
                released: false
            }
        }
        if (conveyor3_hit) {

            channels.a.swayEnabled = false
            channels.b.swayEnabled = false
            channels.c.swayEnabled = false
            channels.a.springTo(0, { stiffness: 800, damping: 4 })
            channels.b.springTo(0, { stiffness: 800, damping: 3 })
            channels.c.springTo(0, { stiffness: 800, damping: 2 })



            drag_channels.c.x.springTo(-15, { stiffness: 400, damping: 8 })
            drag_channels.c.y.springTo(-10 + 300 * 2, { stiffness: 400, damping: 2 })
            cursor.drag = { 
                decay: sub(cursor.xy, { x: drag_channels.c.x.value - 15, y: drag_channels.c.y.value - 10 } ),
                channels: drag_channels.c,
                shape: shapes.c,
                released: false
            }
        }
    } else if (drag.is_up) {

        if (cursor.drag) {

            channels.a.swayEnabled = true
            channels.b.swayEnabled = true
            channels.c.swayEnabled = true

            channels.a.hold()
            channels.b.hold()
            channels.c.hold()

            cursor.drag.released = true

            drag_channels.a.x.springTo(0, { stiffness: 120, damping: 10 })
            drag_channels.a.y.springTo(0, { stiffness: 200, damping: 10 })

            drag_channels.b.x.springTo(0, { stiffness: 120, damping: 10 })
            drag_channels.b.y.springTo(300 * 1, { stiffness: 200, damping: 10 })

            drag_channels.c.x.springTo(0, { stiffness: 120, damping: 10 })
            drag_channels.c.y.springTo(300 * 2, { stiffness: 200, damping: 10 })
        }
    }


    let a = a_box()
    if (a_hits_red(a)) {
        a_color_channel.springTo(80)
    } else {
        a_color_channel.springTo(0)
    }


    a_color_channel.update(delta / 1000)
    for (let key of Object.keys(channels)) {
        channels[key].update(delta / 1000)
    }

    for (let key of Object.keys(drag_channels)) {
        drag_channels[key].x.update(delta / 1000)
        drag_channels[key].y.update(delta / 1000)
    }



}


function a_box(): Rect {
    let x = drag_channels.a.x.value
    let y = drag_channels.a.y.value
    return {
        xy: vec2(x + 1600, y + 140),
        wh: vec2(80, 80)
    }
}

function cursor_hits_box(box: Rect) {
    return box_intersect(cursor, box)
}

function a_hits_red(box: Rect) {
    return box_intersect_ratio(red1_box, box) > 0.5
}

function pallette_color_to_pico(color: PaletteColor): Color {
    switch (color) {
        case 'red':
            return colors.red
        case 'green':
            return colors.green
        case 'yellow':
            return colors.yellow
        case 'white':
            return colors.sand
        case 'empty':
            return colors.darkblue
    }
    return colors.darkred
}

export function _render() {
    cx.fillStyle = colors.darkblue
    cx.fillRect(0, 0, 1920, 1080)



    let x, y, gap


    x = 1200
    y = 140

    gap = 450

    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 4; j++) {
            pallette_color(x + i * 100, y + j * 100, pallette_color_to_pico(palette_a.cells[j][i]))

            pallette_color(x + i * 100, gap + y + j * 100, pallette_color_to_pico(palette_b.cells[j][i]))
        }
    }




    x = 1560
    y = 180

    gap = 300

    if (cursor.drag?.shape === shapes.a) {
        cx.globalAlpha = 0.2
    }
    shape(x + 0, y + 0, shapes.a)
    cx.globalAlpha = 1
    if (cursor.drag?.shape === shapes.b) {
        cx.globalAlpha = 0.2
    }
    shape(x + 0, y + gap * 1, shapes.b)
    cx.globalAlpha = 1
    if (cursor.drag?.shape === shapes.c) {
        cx.globalAlpha = 0.2
    }
    shape(x + 0, y + gap * 2, shapes.c)
    cx.globalAlpha = 1


    if (cursor.drag) {
        shape(x + cursor.drag.channels.x.value, y + cursor.drag.channels.y.value, cursor.drag.shape)
    }

    render_cursor(cursor.xy.x, cursor.xy.y)


    render_debug()
}


function pallette_color(x: number, y: number, color: Color) {

    cx.fillStyle = color
    cx.beginPath()
    cx.moveTo(x + 40, y + 40)
    cx.arc(x + 40, y + 40, 16, 0, Math.PI * 2)
    cx.fill()


    cx.lineWidth = 8
    cx.strokeStyle = color

    cx.beginPath()
    cx.roundRect(x, y, 80, 80, 10)
    cx.stroke()
}

function render_cursor(x: number, y: number) {
    cx.lineWidth = 20
    cx.strokeStyle = colors.black
    cx.beginPath()
    cx.moveTo(x + 40, y + 3)
    cx.lineTo(x + 0, y + 0)
    cx.lineTo(x + 3, y + 40)
    cx.stroke()
}


function render_debug() {

    if (COLLISIONS) {
        hitbox_rect(a_box())
        hitbox_rect(conveyor1_box)
        hitbox_rect(conveyor2_box)
        hitbox_rect(conveyor3_box)
        hitbox_rect(cursor)
        hitbox_rect(red1_box)
    }
}

function shape(x: number, y: number, shape: Shape) {
    let i_channel = 0
    let cc = [channels.a, channels.b, channels.c]
    cx.lineWidth = 8
    cx.strokeStyle = colors.white
    cx.beginPath()
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (shape[i][j] === null) {
                continue
            }
            cx_box(x + i * 100, y + j * 100, cc[i_channel++].value)


        }
    }
    cx.stroke()


    i_channel = 0
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (shape[i][j] === null) {
                continue
            }
            cx.save()
            cx.fillStyle = colors.darkblue
            cx.beginPath()
            cx_box(x + i * 100, y + j * 100, cc[i_channel++].value)
            cx.fill()
            cx.clip()
            cx.fillStyle = pallette_color_to_pico(shape[i][j])
            cx.beginPath()
            cx.arc(30, 30, Math.max(0, a_color_channel.value), 0, Math.PI * 2)
            cx.fill()
            cx.restore()
        }
    }



}


function cx_box(x: number, y: number, theta: number) {
    // Calculate rotation center at (40, 40) relative to (x, y)
    const centerX = x + 40;
    const centerY = y + 40;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    // Direct matrix: translate to center, rotate, translate back, then to position
    cx.setTransform(
        cos, sin,
        -sin, cos,
        centerX - 40 * cos + 40 * sin,  // Combined translation
        centerY - 40 * sin - 40 * cos
    );

    cx.roundRect(0, 0, 80, 80, 10);
    cx.resetTransform();
}


function hitbox_rect(box: Rect) {

    cx.lineWidth = 16
    let x = box.xy.x
    let y = box.xy.y
    let w = box.wh.x
    let h = box.wh.y

    cx.strokeStyle = 'red'
    cx.strokeRect(x, y, w, h)

}

let set_next_scene: SceneName | undefined = undefined
export function next_scene() {
    let res =  set_next_scene
    if (res !== undefined){
        set_next_scene = undefined
        return res
    }
}