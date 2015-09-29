'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _infiniteScrollJs = require('./../infiniteScroll.js');

var _infiniteScrollJs2 = _interopRequireDefault(_infiniteScrollJs);

// FAKER
function slicer(data) {
    var i,
        j,
        temparray,
        chunk = 20;
    for (i = 0, j = data.length; i < j; i += chunk) {
        temparray = data.slice(i, i + chunk);
    }

    return temparray;
}
_infiniteScrollJs2['default'].prototype.faker = function () {
    console.log('hier');
    var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('get', 'example/exampleData.json', true);
    xhr.onreadystatechange = (function () {
        var status;
        var data;
        if (xhr.readyState == 4) {
            // `DONE`
            status = xhr.status;
            if (status == 200) {
                data = JSON.parse(xhr.responseText);
                data = slicer(data);
                this.handleResponse(data);
            } else {}
        }
    }).bind(this);
    xhr.send();
};

new _infiniteScrollJs2['default']('example', {
    transport: 'faker', // switch to ajax
    url: '/example/exampleData.json', // switch to url
    fields: {
        name: {
            data: {
                id: ':_id:'
            },
            listener: [{
                handle: function handle(e) {
                    alert('Attribute id: ' + e.target.getAttribute('data-id'));
                }, // callback
                on: 'click' // listen for event
            }]
        },
        balance: {
            editable: [{
                handle: function handle(e) {
                    alert('New balance: ' + e.target.innerHTML);
                },
                on: 'blur'
            }]
        },
        phone: {
            data: {
                phone: ':phone:'
            }
        },
        listener: [{
            handle: function handle(e) {
                alert('Attribute phone: ' + e.target.getAttribute('data-phone'));
            },
            on: 'click'
        }]
    }
});

//# sourceMappingURL=main.js.map