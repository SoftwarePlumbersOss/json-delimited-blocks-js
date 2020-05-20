/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const { Tokenizer } = require("./tokenizer.js");
const { Parser } = require("./parser.js");
const { Decoder } = require("./decoder.js");
const Blob = require("cross-blob");

function createHeaderSink(callback, encoding) {
    return new Decoder(new Tokenizer(new Parser(callback)), encoding);
}

function createBodySink(callback, length) {
    let chunks = [];
    return { 
        write: (data) => {
            let written = 0;
            if (length >= data.length) {
                chunks.push(data);
                written = data.length;
            } else {
                chunks.push(data.slice(0, length));
                written = length;
            }
            length -= written;
            if (length === 0) {
                callback(new Blob(chunks));
            }
            return written;
        },
        close: () => {
            callback(new Blob(chunks));            
        }
    };
}

class BlockWriter {
    
    constructor(callback, encoding) {
        this.encoding = encoding;
        this.callback = callback;
        this.sink = createHeaderSink(hdr=>this.receiveHeader(hdr), this.encoding);
    }
    
    receiveHeader(header) {
        //console.log("header ", header);
        this.header = header;
        this.sink = createBodySink(bdy=>this.receiveBody(bdy), this.header.length);
    }
    
    receiveBody(body) {
        //console.log("body ", body);
        this.callback(this.header, body);
        this.sink = createHeaderSink(hdr=>this.receiveHeader(hdr), this.encoding);
    }
    
    write(chunk, controller) {
        //console.log("begin chunk length ", chunk.length);
        let count = 0;
        while (count < chunk.length) {
            count += this.sink.write(chunk.slice(count));
            //console.log("at", count);
        }        
    }
    
    start(controller) { 
        
    }
    
    close() {
        this.sink.close();
    }
}

module.exports = { BlockWriter };