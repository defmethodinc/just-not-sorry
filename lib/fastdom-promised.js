!(function() {

    /**
     * Wraps fastdom in a Promise API
     * for improved control-flow.
     *
     * @example
     *
     * // returning a result
     * fastdom.measure(() => el.clientWidth)
     *   .then(result => ...);
     *
     * // returning promises from tasks
     * fastdom.measure(() => {
     *   var w = el1.clientWidth;
     *   return fastdom.mutate(() => el2.style.width = w + 'px');
     * }).then(() => console.log('all done'));
     *
     * // clearing pending tasks
     * var promise = fastdom.measure(...)
     * fastdom.clear(promise);
     *
     * @type {Object}
     *
     * (The MIT License)
     * Copyright (c) 2016 Wilson Page wilsonpage@me.com
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     */
    var exports = {
        initialize: function() {
            this._tasks = new Map();
        },

        mutate: function(fn, ctx) {
            return create(this, 'mutate', fn, ctx);
        },

        measure: function(fn, ctx) {
            return create(this, 'measure', fn, ctx);
        },

        clear: function(promise) {
            var tasks = this._tasks;
            var task = tasks.get(promise);
            this.fastdom.clear(task);
            tasks.delete(promise);
        }
    };

    /**
     * Create a fastdom task wrapped in
     * a 'cancellable' Promise.
     *
     * @param  {FastDom}  fastdom
     * @param  {String}   type - 'measure'|'muatate'
     * @param  {Function} fn
     * @return {Promise}
     */
    function create(promised, type, fn, ctx) {
        var tasks = promised._tasks;
        var fastdom = promised.fastdom;
        var task;

        var promise = new Promise(function(resolve, reject) {
            task = fastdom[type](function() {
                tasks.delete(promise);
                try { resolve(ctx ? fn.call(ctx) : fn()); }
                catch (e) { reject(e); }
            }, ctx);
        });

        tasks.set(promise, task);
        return promise;
    }

// Expose to CJS, AMD or global
    if ((typeof define)[0] == 'f') define(function() { return exports; });
    else if ((typeof module)[0] == 'o') module.exports = exports;
    else window.fastdomPromised = exports;

})();
