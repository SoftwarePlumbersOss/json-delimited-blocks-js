/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global expect */

const { BlockWriter } = require("../../index.js");
const { getFile } = require("./utils.js");
const { WritableStream } = require("web-streams-polyfill/ponyfill")

function readAll(data) {
    let blocks = [];
    let  callback = (header, blob) => { blocks.push({header, blob}); };
    let writer = new BlockWriter(callback, "utf-8");
    writer.write(data);
    writer.close();
    return blocks;
}

function check(...list) {
    let testData = "";
    for (let { header, body} of list) {
        testData+=header;
        testData+=body;
    }
    let results = readAll(Buffer.from(testData));
    expect(results.length).toEqual(list.length);
    for (let i = 0; i < results.length; i++) {
        let item = list[i];
        let result = results[i];
        expect(result.header).toEqual(JSON.parse(item.header));
        expect(result.blob.text()).resolves.toEqual(item.body);
    }   
}

const MINIMAL_HEADER_L0='{ "length": 0}';
const MINIMAL_HEADER_L2='{ "length": 2}';
const SHORT_HEADER_L0='{ "length": 0, "headers": { "a": 1}}';
const SHORT_HEADER_L2='{ "length": 2, "headers": { "a": 1}}';
const UNICODE_HEADER_L2='{ "length": 2, "headers": { "a": "/u0394"}}';
const L2="ab";
const L0="";

describe("test block writer", () => {
    
    it("writes empty object", () => {
        check({header: MINIMAL_HEADER_L0, body: L0});
    });
    
    it("writes minimal object", () => {
        check({header: MINIMAL_HEADER_L2, body: L2});
    });

    it("writes short object", () => {
        check({header: SHORT_HEADER_L0, body: L0});
        check({header: SHORT_HEADER_L2, body: L2});
    });

    it("writes unicode object", () => {
        check({header: UNICODE_HEADER_L2, body: L2});
    });
    
    it("writes stream", () => {
        check(
            {header: MINIMAL_HEADER_L0, body: L0},
            {header: MINIMAL_HEADER_L2, body: L2}, 
            {header: SHORT_HEADER_L0, body: L0},
            {header: SHORT_HEADER_L2, body: L2},
            {header: UNICODE_HEADER_L2, body: L2}       
        );
    });
});

describe("test block with file", () => {
    
    it("writes test file", done => {
        let blocks = [];
        let  callback = (header, blob) => { blocks.push({header, blob}); };

        getFile('testfile.jdb').pipeTo(new WritableStream(new BlockWriter(callback, "utf-8"))).then(()=>{
            expect(blocks.length).toBe(4);
            done();
        });
    });
    
});