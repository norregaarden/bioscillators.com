import { expose } from 'comlink'

export class testWorker {
    private counter: number

    constructor(init: number) {
        this.counter = init
    }

    get count() {
        return this.counter
    }

    increment(delta = 1) {
        this.counter += delta
    }
}

expose(testWorker)