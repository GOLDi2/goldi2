/**
 * Created by Lennart on 02.07.2015.
 */
self.onmessage = function (ev) {
    self.onmessage = null
    eval(ev.data)
}