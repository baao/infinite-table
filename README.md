# infinite-table

An infinite scrolling table with editable features. No jQuery.

### Usage

Minimum required setup:

    var InfiniteScroll = require('infinite-table');
    new InfiniteScroll('<table element ID>', {
        url: <url to get data from>,
        fields: {
            <returned data property> : {}
        }
    });

For the spinner, include 

    <link rel="stylesheet" href="/css/style.css"/>

Options: 
    
    new InfiniteScroll('<table element ID>', {
        url: <url to get data from>,
        fields: {
            <returned data property> : {
                data: {
                    <data-attribute>: ':<returned data property>:'
                    // for example:
                    id: ':id:' // will create a data-attribute like data-id="1"
                },
                // setup listener, e.g. "click" listener (set as many as you wish):
                listener: [{
                    handle: (e) => {alert(e.target.innerHTML)}, // callback
                    on: 'click' // listen for event
                }],
                // if editable is provided, the td will be given contenteditable attribute,
                // same signature as above for listeners
                editable: [{
                    handle: (e) => {alert(e.target.innerHTML)},
                    on: 'blur'
                }]
            }
        },
        perPage: 20, // how many entries should be fetched per "page"
        loadTiming: 2, // when should the loading happen (defaults to the penultimate tr)
        transport: 'ajax', // possible transports: ajax/websockets,
        spinner: 0 // possible 0, 1, 2
    });
   


An ajax (default) / websockets `GET` request is made whenever you hit the trigger. The signature is:
    
    <url>?skip=<skip>&limit=<limit>
    
So your backend only has to `GET` skip and limit to query for the data. 
Example query

    SELECT * FROM `foo` LIMIT <limit> OFFSET <skip>
    
If you're using [sails.js](https://github.com/balderdashy/sails) you're in luck - simply create the contoller and model,
everything else works out of the box.
    
The scroller expects json data as returned object.    
   
### INCLUDED DEPENDENCIES
    
lodash, bluebird    
included: SpinKit from https://github.com/tobiasahlin/SpinKit
    
### LICENSE

MIT