const fs = require("fs");
const path = require("path");
const { ReadableStream } = require("web-streams-polyfill/ponyfill");
const CHUNK_SIZE = 1024;


function nodeCallback(resolve, reject) {
    return function(err, data) {
        if (err !== null) reject(err);
        else resolve(data);
    };
}

function promisify(operation) {
    return new Promise((resolve,reject)=>operation(nodeCallback(resolve,reject)));
}

function getFile(filename) {
    let fd;
    let position = 0;
    
    

    return new ReadableStream({
        start() {
            return promisify(callback => fs.open(path.join(__dirname, filename), "r", callback))
                .then(result => {
                    fd = result;
                });
        },

        pull(controller) {
            const buffer = new Uint8Array(CHUNK_SIZE);

            return promisify(callback => fs.read(fd, buffer, 0, CHUNK_SIZE, position, callback))
                .then(bytesRead => {
                    if (bytesRead === 0) {
                        return promisify(callback=>fs.close(fd, callback))
                            .then(() => controller.close());
                    } else {
                        //console.log("bytes read", bytesRead);
                        position += bytesRead;
                        controller.enqueue(buffer.slice(0, bytesRead));
                    }
                });
        },

        cancel() {
            return promisify(callback => fs.close(fd, callback));
        }
    });
}

module.exports = { getFile };