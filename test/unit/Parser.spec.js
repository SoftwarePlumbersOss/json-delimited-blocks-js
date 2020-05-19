/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global expect */

const { Tokenizer } = require("../../tokenizer.js");
const { Parser } = require("../../parser.js");

function parse(string) {
    let result = undefined;
    let tokenizer = new Tokenizer(new Parser(obj=>{result=obj;}));
    tokenizer.writeString(string);
    tokenizer.close();
    return result;
}

function getRemaining(string) {
    let result = undefined;
    let tokenizer = new Tokenizer(new Parser(obj=>{result=obj;}));
    let count = tokenizer.writeString(string);
    count += tokenizer.close();
    return string.substring(count);
}

describe("test basic json parsing", () => {
    it("parses empty object", () => {
        expect(parse("{}")).toEqual({});
    });
    it("parses empty string", () => {
        expect(parse('""')).toEqual("");
    });
    it("parses nonempty string", () => {
        expect(parse('"abc123"')).toEqual("abc123");
    });
    it("parses string with escaped quote", () => {
        expect(parse('"abc\\"123"')).toEqual('abc\"123');
    });
    it("parses a number", () => {
        expect(parse('123.343')).toEqual(123.343);
    });
    it("parses simple key value pair", () => {
        expect(parse('{"abc":1123}')).toEqual({"abc":1123});
    });
    it("parses simple key value pair and skips whitespace", () => {
        expect(parse(' { "abc" :  1123 } ')).toEqual({"abc":1123});
    });
    it("parses a longer string", () => {
        expect(parse(' { "abc" : 1123, "xyz" : { "x": 1, "y": 2 } }')).toEqual({"abc":1123,"xyz":{"x":1,"y":2}});
    });
});


describe("test finishes afer first valid json object", () => {
    it("terminates after empty object", () => {
        expect(getRemaining("{}123")).toEqual("123");
    });
    
    it("terminates after empty string", () => {
        expect(getRemaining('""abcd')).toEqual("abcd");
    });
    it("terminates after nonempty string", () => {
        expect(getRemaining('"abc123",?#')).toEqual(",?#");
    });
    it("terminates after string with escaped quote", () => {
        expect(getRemaining('"abc\\"123"987')).toEqual("987");
    });
    it("terminates after a number", () => {
        expect(getRemaining('123.343 123')).toEqual("123");
    });
    it("terminates after simple key value pair", () => {
        expect(getRemaining('{"abc":1123}zxc')).toEqual("zxc");
    });
    it("terminates after key value pair and skips whitespace", () => {
        expect(getRemaining(' { "abc" :  1123 }asdx')).toEqual("asdx");
    });
    it("terminates after a longer string", () => {
        expect(getRemaining(' { "abc" : 1123, "xyz" : { "x": 1, "y": 2 } }1987')).toEqual("1987");
    });
     
});
