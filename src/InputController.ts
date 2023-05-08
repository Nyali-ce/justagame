class InputController {
    keys: { [key: string]: boolean } = {}
    constructor() {
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return
            this.keys[e.key] = true
        })
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false
        })
    }
}

export { InputController }