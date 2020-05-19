/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const { Decoder } = require('../../decoder.js')

describe("test decoder", () => {
    
    it("decodes utf-8", () => {
        // ABC alpha beta gamma
        let data = [ 0x41, 0x42, 0x43, 0xCE, 0x91, 0xCE, 0x92, 0xCE, 0x93 ];
        let codepoints = [];
        let dummyTokenizer = {
            writeChar: char => { codepoints.push(char); return true; }
        };
        let decoder = new Decoder(dummyTokenizer,"utf-8");
        decoder.write(data);
        expect(String.fromCodePoint(...codepoints)).toEqual("ABC\u0391\u0392\u0393");
    });
    
    it("decodes more utf-8", () => {
        // ABC alpha beta gamma
        let data = [ 0x24,  0xC2,0xA2,  0xE0,0xA4,0xB9,  0xE2,0x82,0xAC,  0xED,0x95,0x9C ];
        let codepoints = [];
        let dummyTokenizer = {
            writeChar: char => { codepoints.push(char); return true; }
        };
        let decoder = new Decoder(dummyTokenizer,"utf-8");
        decoder.write(data);
        expect(String.fromCodePoint(...codepoints)).toEqual("\u0024\u00A2\u0939\u20AC\uD55C");
    });    
});