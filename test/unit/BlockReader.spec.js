/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global expect */

const { BlockReader } = require("../../index.js");
const { getFile } = require("./utils.js");
const { ReadableStream } = require("web-streams-polyfill/ponyfill");
const Blob = require("cross-blob");

describe("test block with file", () => {
    
    it("reads test file", checksDone => {

        let blockStream = new ReadableStream(BlockReader.of(getFile('testfile.jdb')));       
        let blockReader = blockStream.getReader();
        let count = 0;

        function processBlock({ done, block }) {
            if (done) {
                expect(count).toEqual(4);
                checksDone();
            } else {
                count++;
                return blockReader.read().then(processBlock);
            }
        }

        return blockReader.read().then(processBlock);
            
    });
    
});