/**
 *  sails_again
 * Author: michael
 * Date: 28.09.15.
 * License: MIT
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ = require('lodash');
var Promise = require('bluebird');

HTMLTableCellElement.prototype.setDataAttribute = function (data, attributes) {
    var _this = this;

    if (!data || !attributes) return this;
    Object.keys(attributes).forEach(function (val) {
        var re = /:(.*):/;
        if (attributes[val].match(re)) {
            _this.setAttribute('data-' + val, attributes[val].replace(re, data[attributes[val].match(re)[1]]));
        }
    });
    return this;
};

var InfiniteScroll = (function () {
    function InfiniteScroll(el) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, InfiniteScroll);

        if (!(options.fields || options.url)) throw new Error('missing parameter ' + (options.fields ? 'url' : 'fields') + '!');
        this.element = el;
        this.options = Object.assign({
            perPage: 20,
            loadTiming: 2,
            autoload: true,
            transport: 'ajax',
            spinner: 0
        }, options);
        this.page = 0;
        this.loaderSpinners = ['<div class="spinner3">\n                                <div class="bounce1"></div>\n                                <div class="bounce2"></div>\n                                <div class="bounce3"></div>\n                              </div>', '<div class="spinner2">\n                                <div class="cube1"></div>\n                                <div class="cube2"></div>\n                              </div>', '<div class="spinner">\n                                <div class="rect1"></div>\n                                <div class="rect2"></div>\n                                <div class="rect3"></div>\n                                <div class="rect4"></div>\n                                <div class="rect5"></div>\n                              </div>'];
        if (this.options.spinner !== false) {
            var spinner = document.createElement('div');
            spinner.innerHTML = this.loaderSpinners[this.options.spinner];
            document.getElementById(this.element).parentNode.appendChild(spinner);
        }
        this.elementToWatch = document.getElementById(el).rows[document.getElementById(el).rows.length - this.options.loadTiming];
        if (!this.elementToWatch) {
            this[this.options.transport]();
        } else {
            window.addEventListener('load', this.handler.bind(this), false);
            this.setupListener();
        }
    }

    _createClass(InfiniteScroll, [{
        key: 'setupListener',
        value: function setupListener() {
            var _this2 = this;

            this.listener = function () {
                _.defer(_this2.handler.bind(_this2));
            };
            window.addEventListener('resize', this.listener, false);
            window.addEventListener('scroll', this.listener, false);
        }
    }, {
        key: 'removeListener',
        value: function removeListener() {
            window.removeEventListener('resize', this.listener, false);
            window.removeEventListener('scroll', this.listener, false);
        }
    }, {
        key: 'handler',
        value: function handler() {
            var _this3 = this;

            if (InfiniteScroll.isElementInViewport(this.elementToWatch)) {
                Promise.resolve(this.removeListener()).then(function () {
                    _this3[_this3.options.transport]();
                });
            }
        }
    }, {
        key: 'recordsToFetch',
        value: function recordsToFetch() {
            var recordsToFetchStart = this.page * this.options.perPage;
            var recordsToFetchEnd = recordsToFetchStart + this.options.perPage;
            return [recordsToFetchStart, recordsToFetchEnd];
        }
    }, {
        key: 'ajax',
        value: function ajax() {
            var _this4 = this;

            var records = this.recordsToFetch();
            var xhr = new XMLHttpRequest();
            xhr.open('GET', this.options.url + '?skip=' + records[0] + '&limit=' + records[1], true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) return;
                _this4.handleResponse(JSON.parse(xhr.responseText));
            };
            xhr.send();
        }
    }, {
        key: 'sockets',
        value: function sockets() {
            var _this5 = this;

            var records = this.recordsToFetch();
            if (!io) throw new Error('No socket driver found');
            io.socket.get(this.options.url + '?skip=' + records[0] + '&limit=' + records[1], function (result) {
                _this5.handleResponse(result);
            });
        }
    }, {
        key: 'handleResponse',
        value: function handleResponse(data) {
            var _this6 = this;

            Promise.resolve(this.addElementsToDOM(data)).then(function () {
                _this6.page++;
                _this6.elementToWatch = document.getElementById(_this6.element).rows[document.getElementById(_this6.element).rows.length - _this6.options.loadTiming];
                return true;
            }).then(function () {
                _this6.setupListener();
            });
        }
    }, {
        key: 'addElementsToDOM',
        value: function addElementsToDOM(data) {
            var _this7 = this;

            data.forEach(function (val) {
                var tableRef = document.getElementById(_this7.element).getElementsByTagName('tbody')[0];
                var newRow = tableRef.insertRow(tableRef.rows.length);
                Object.keys(_this7.options.fields).forEach(function (field, i) {
                    var newCell = newRow.insertCell(i);
                    var content = document.createTextNode(val[field]);
                    newCell.appendChild(content);
                    newCell.setDataAttribute(val, _this7.options.fields[field].data);
                    if (_this7.options.fields[field].editable) {
                        newCell.setAttribute('contenteditable', 'true');
                        _this7.options.fields[field].editable.forEach(function (action) {
                            newCell.addEventListener(action.on, action.handle);
                        });
                    }
                    if (_this7.options.fields[field].listener) {
                        _this7.options.fields[field].listener.forEach(function (action) {
                            newCell.addEventListener(action.on, action.handle);
                        });
                    }
                });
            });
            return true;
        }
    }], [{
        key: 'isElementInViewport',
        value: function isElementInViewport(el) {
            var rect = el.getBoundingClientRect();
            return rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
        }
    }]);

    return InfiniteScroll;
})();

exports['default'] = InfiniteScroll;
module.exports = exports['default'];

//# sourceMappingURL=infiniteScroll.js.map