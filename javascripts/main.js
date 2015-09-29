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
    var getJSON = function getJSON(url) {
        var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('get', url, true);
        xhr.onreadystatechange = (function () {
            var status;
            var data;
            // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
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
};

new _infiniteScrollJs2['default']('exampleTable', {
    transport: 'faker',
    url: '/example/exampleData.json',
    fields: {
        name: {},
        balance: {},
        phone: {}
    }
});

//# sourceMappingURL=main.js.map