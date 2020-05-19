/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global expect */

const { Tokenizer, CHAR, TOKEN_TYPE } = require("../../tokenizer.js");

function tokenizeAll(string) {
    let tokens = [];
    let dummyParser = { 
        write: (type, token) => { tokens.push({type, token}); return true; },
        close: (type, token) => { tokens.push({type, token}); return true; }
    };
    let tokenizer = new Tokenizer(dummyParser);
    tokenizer.writeString(string);
    tokenizer.close();
    return tokens;
}

describe("test basic json tokenizing", () => {
    it("tokenizes empty object", () => {
        let tokens = tokenizeAll("{}");
        expect(tokens.length).toEqual(2);
        expect(tokens[0]).toEqual({type: TOKEN_TYPE.DELIMETER, token: "{"});
        expect(tokens[1]).toEqual({type: TOKEN_TYPE.DELIMETER, token: "}"});
    });
    it("tokenizes empty string", () => {
        let tokens = tokenizeAll('""');
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual(TOKEN_TYPE.STRING);
        expect(tokens[0]).toEqual({type: TOKEN_TYPE.STRING, token: ""});
    });
    it("tokenizes nonempty string", () => {
        let tokens = tokenizeAll('"abc123"');
        expect(tokens.length).toEqual(1);
        expect(tokens[0]).toEqual({type: TOKEN_TYPE.STRING, token: "abc123"});
    });
    it("tokenizes string with escaped quote", () => {
        let tokens = tokenizeAll('"abc\\"123"');
        expect(tokens.length).toEqual(1);
        expect(tokens[0]).toEqual({type: TOKEN_TYPE.STRING, token: 'abc\\"123'});
    });
    it("tokenizes a number", () => {
        let tokens = tokenizeAll('123.343');
        expect(tokens.length).toEqual(1);
        expect(tokens[0]).toEqual({type: TOKEN_TYPE.VALUE, token: '123.343'});
    });
    it("tokenizes simple key value pair", () => {
        let tokens = tokenizeAll('{"abc":1123}');
        expect(tokens.length).toEqual(5);
        expect(tokens[0]).toEqual({type: TOKEN_TYPE.DELIMETER, token: "{"});
        expect(tokens[1]).toEqual({type: TOKEN_TYPE.STRING, token: 'abc'});
        expect(tokens[2]).toEqual({type: TOKEN_TYPE.DELIMETER, token: ":"});
        expect(tokens[3]).toEqual({type: TOKEN_TYPE.VALUE, token: '1123'});
        expect(tokens[4]).toEqual({type: TOKEN_TYPE.DELIMETER, token: "}"});
    });
    it("tokenizes simple key value pair and skips whitespace", () => {
        let tokens = tokenizeAll(' { "abc" :  1123 } ');
        expect(tokens.length).toEqual(5);
        expect(tokens[0]).toEqual({type: TOKEN_TYPE.DELIMETER, token: "{"});
        expect(tokens[1]).toEqual({type: TOKEN_TYPE.STRING, token: 'abc'});
        expect(tokens[2]).toEqual({type: TOKEN_TYPE.DELIMETER, token: ":"});
        expect(tokens[3]).toEqual({type: TOKEN_TYPE.VALUE, token: '1123'});
        expect(tokens[4]).toEqual({type: TOKEN_TYPE.DELIMETER, token: "}"});
    });
    it("tokenizes a longer string", () => {
        let tokens = tokenizeAll(' { "abc" : 1123, "xyz" : { "x": 1, "y": 2 } }');
        expect(tokens.map(t=>t.token)).toEqual([
            "{","abc",":","1123",",","xyz",":","{","x",":","1",",","y",":","2","}","}"
        ]);
    });
    it("tokenizes values separated by whitespace", ()=>{
        let tokens = tokenizeAll('123 345.234 sdfsdf');        
        expect(tokens.map(t=>t.token)).toEqual([
            "123", "345.234", "sdfsdf"
        ]);
    });
});

