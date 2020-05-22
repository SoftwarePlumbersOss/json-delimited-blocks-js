/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const { BlockWriter } = require('./blockwriter');

class BlockReader {
    
    static of(stream, readBody = a=>a, encoding = "utf-8") {
        let reader = stream.getReader();
        return {
            start(controller) {

                const transformer = new BlockWriter((header,body)=>controller.enqueue({header, body: readBody(body)}), encoding);

                // The following function handles each data chunk
                function pump() {
                  // "done" is a Boolean and value a "Uint8Array"
                    reader.read().then(({ done, value }) => {
                        // Is there no more data to read?
                        if (done) {
                          transformer.close();
                          controller.close();
                          return;
                        }

                        transformer.write(value);
                        pump();
                    });
                };

                pump();
            }
        };
    }  
}

module.exports = { BlockReader };
