const elwsTools = require("./elwsTools.js");
const http = require('http');

/**
 * The message protocol for this node server.
 * @type {{nodeData: Array, nodeMsgType: string[], nodeInfo: string[], nodeDataType: string[]}}
 */
const nodeProtocolData = {
  nodeMsgType: [
      'get_protocol',
      'code_change',
      'minimize',
      'protocol',
      'code_changed',
      'minimized'
  ],
    nodeInfo: [
        'req',
        'res',
        'err'
    ],
    nodeDataType: [
        'json',
        'string'
    ],
    nodeData: []
};

/**
 * JSON Object of the message protocol
 * @type {{nodeData: string, nodeMsgType: string, nodeInfo: string, nodeDataType: string}}
 */
const msgProtocol = {
    nodeMsgType: "server_res_get",
    nodeInfo: "res",
    nodeDataType: "json",
    nodeData: JSON.stringify(nodeData)
};

/**
 * Message for wrong message type.
 * @type {{nodeData: string, nodeMsgType: string, nodeInfo: string, nodeDataType: string}}
 */
const nodeMsgTypeErr = {nodeMsgType: "server_err", nodeInfo: "err", nodeDataType: "string", nodeData:"Node Message Type not found"};

/**
 * Message for wrong entity type.
 * @type {{nodeData: string, nodeMsgType: string, nodeInfo: string, nodeDataType: string}}
 */
const entityTypeErr = {nodeMsgType: "server_err", nodeInfo: "err", nodeDataType: "string", nodeData:"Entity Type Error"};


var WebSocketServer = require('websocket').server;

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.
});

server.listen(1337, function() { });
// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function (request) {

    var connection = request.accept(null, request.origin);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            // process WebSocket message
            var msgObj = JSON.parse(message.utf8Data);

            if (msgObj.nodeInfo === "req") {

                switch (msgObj.nodeMsgType) {

                    case "client_req_get":
                        connection.send(JSON.stringify(msgProtocol));
                        break;

                    case "client_req_codechange":
                        break;

                    case "client_req_minimize": //TODO Test
                        break;

                    default:
                        connection.send(JSON.stringify(nodeMsgTypeErr));
                        break;
                }
            } else {
                //TODO else
            }
        }
    });

    connection.on('close', function(connection) {
        // close user connection
    });
});




//====================================PLAYGROUND=================================================
//===================================================================================================

//frontend function, test
shutdown = function(){
    //==================Message from client======================
    var msg = {
        nodeMsgType: 'client_req_shutdown',
        nodeInfo: 'req',
        nodeDataType: 'string',
        nodeData: 'shutdown'
    }
    //============================================================
    elwsTools.shutdown(msg);
}

//frontend function, test
code_doc_change = function(){
    var msg = {
        nodeMsgType: 'client_req_codechange',
        nodeInfo: 'req',
        nodeDataType: 'array',
        nodeData: [{'type': 0, 'charIdxStart': 0, 'charIdxEnd': 24, 'text': 'x'}]
    }
    elwsTools.code_doc_change(msg);

}


//shutdown();
code_doc_change();


//====================================PLAYGROUND=================================================
//===================================================================================================