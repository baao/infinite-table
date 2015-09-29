/**
 *  sails_again
 * Author: michael
 * Date: 28.09.15.
 * License: MIT
 */

var _ = require('lodash');
var Promise = require('bluebird');

HTMLTableCellElement.prototype.setDataAttribute = function (data, attributes) {
    if (!data || !attributes) return this;
    Object.keys(attributes).forEach(val => {
        let re = /:(.*):/;
        if (attributes[val].match(re)) {
            this.setAttribute('data-' + val, attributes[val].replace(re, data[attributes[val].match(re)[1]]));
        }
    });
    return this;
};


export default class InfiniteScroll {
    constructor(el, options = {}) {
        if (! (options.fields || options.url)) throw new Error('missing parameter ' + (options.fields ? 'url' : 'fields') + '!');
        this.element = el;
        this.options = Object.assign({
            perPage: 20,
            loadTiming: 2,
            autoload: true,
            transport: 'ajax',
            spinner: 0,
            logErrors: true
        }, options);
        this.page = 0;
        this.loaderSpinners = [
            `<div class="spinner3">
                                <div class="bounce1"></div>
                                <div class="bounce2"></div>
                                <div class="bounce3"></div>
                              </div>`,
            `<div class="spinner2">
                                <div class="cube1"></div>
                                <div class="cube2"></div>
                              </div>`,
            `<div class="spinner">
                                <div class="rect1"></div>
                                <div class="rect2"></div>
                                <div class="rect3"></div>
                                <div class="rect4"></div>
                                <div class="rect5"></div>
                              </div>`
        ];
        if (this.options.spinner !== false) {
            let spinner = document.createElement('div');
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

    errorLogger () {
        if (this.options.logErrors) {
            console.error(arguments);
        }
    }

    setupListener() {
        this.listener = () => {
            _.defer(this.handler.bind(this));
        };
        window.addEventListener('resize', this.listener, false);
        window.addEventListener('scroll', this.listener, false);
    }

    removeListener() {
        window.removeEventListener('resize', this.listener, false);
        window.removeEventListener('scroll', this.listener, false);
    }

    static isElementInViewport(el) {
        let rect = el.getBoundingClientRect();
        return (
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    handler() {
        if (InfiniteScroll.isElementInViewport(this.elementToWatch)) {
            Promise.resolve(this.removeListener())
                .then(() => {
                    this[this.options.transport]();
                });
        }
    }

    recordsToFetch() {
        let recordsToFetchStart = this.page * this.options.perPage;
        let recordsToFetchEnd = recordsToFetchStart + this.options.perPage;
        return [recordsToFetchStart, recordsToFetchEnd];
    }

    ajax() {
        let records = this.recordsToFetch();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `${this.options.url}?skip=${records[0]}&limit=${records[1]}`, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) errorLogger(xhr);
            if (xhr.status !== 200) errorLogger(xhr);
            this.handleResponse(JSON.parse(xhr.responseText));
        };
        xhr.send();
    }

    sockets() {
        let records = this.recordsToFetch();
        if (! io) throw new Error('No socket driver found');
        io.socket.get(`${this.options.url}?skip=${records[0]}&limit=${records[1]}`, result => {
            this.handleResponse(result);
        })
    }

    handleResponse(data) {
        console.log('handleResponse' + data);
        Promise.resolve(this.addElementsToDOM(data))
            .then(() => {
                this.page++;
                this.elementToWatch = document.getElementById(this.element).rows[document.getElementById(this.element).rows.length - this.options.loadTiming];
                return true;
            }).then(() => {
                this.setupListener();
            });
    }

    addElementsToDOM(data) {
        data.forEach(val => {
            let tableRef = document.getElementById(this.element).getElementsByTagName('tbody')[0];
            let newRow = tableRef.insertRow(tableRef.rows.length);
            Object.keys(this.options.fields).forEach((field, i) => {
                let newCell = newRow.insertCell(i);
                let content = document.createTextNode(val[field]);
                newCell.appendChild(content);
                newCell.setDataAttribute(val, this.options.fields[field].data);
                if (this.options.fields[field].editable) {
                    newCell.setAttribute('contenteditable', 'true');
                        this.options.fields[field].editable.forEach(action => {
                            newCell.addEventListener(action.on, action.handle)
                        });
                }
                if (this.options.fields[field].listener) {
                    this.options.fields[field].listener.forEach(action => {
                        newCell.addEventListener(action.on, action.handle)
                    });
                }
            });
        });
        return true;
    }
}

