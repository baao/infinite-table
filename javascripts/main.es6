import InfiniteScroll from './../infiniteScroll.js';
// FAKER
function slicer(data){
    var i,j,temparray,chunk = 20;
    for (i=0,j=data.length; i<j; i+=chunk) {
        temparray = data.slice(i,i+chunk);

    }

    return temparray;
}
InfiniteScroll.prototype.faker = function() {
console.log('hier');
            var xhr = typeof XMLHttpRequest != 'undefined'
                ? new XMLHttpRequest()
                : new ActiveXObject('Microsoft.XMLHTTP');
            xhr.open('get', 'example/exampleData.json', true);
            xhr.onreadystatechange = function() {
                var status;
                var data;
                if (xhr.readyState == 4) { // `DONE`
                    status = xhr.status;
                    if (status == 200) {
                        data = JSON.parse(xhr.responseText);
                        data = slicer(data);
                        this.handleResponse(data);
                    } else {

                    }
                }
            }.bind(this);
            xhr.send();

    };

new InfiniteScroll('example', {
    transport: 'faker',  // switch to ajax
    url: '/example/exampleData.json',  // switch to url
    fields: {
        name:{
            data: {
                id: ':_id:'
            },
            listener: [{
                handle: (e) => {alert('Attribute id: ' + e.target.getAttribute('data-id'))}, // callback
                on: 'click' // listen for event
            }]
        },
        balance:{
            editable: [{
                handle: (e) => {
                    alert('New balance: ' + e.target.innerHTML)
                },
                on: 'blur'
            }]
        },
        phone: {
            data: {
                phone: ':phone:'
            },
            listener: [
                {
                    handle: (e) => {
                        alert('Attribute phone: ' + e.target.getAttribute('data-phone'))
                    },
                    on: 'click'
                }
            ]
        },
    }
});

