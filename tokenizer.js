/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const TOKEN_TYPE = {
    DELIMETER : 1,
    STRING: 2,
    VALUE: 3
};

const CHAR = {
    tab                 : 0x09,     // \t
    lineFeed            : 0x0A,     // \n
    carriageReturn      : 0x0D,     // \r
    space               : 0x20,     // " "

    doubleQuote         : 0x22,     // "
    plus                : 0x2B,     // +
    comma               : 0x2C,     // ,
    minus               : 0x2D,     // -
    period              : 0x2E,     // .

    _0                  : 0x30,     // 0
    _9                  : 0x39,     // 9

    colon               : 0x3A,     // :

    E                   : 0x45,     // E

    openBracket         : 0x5B,     // [
    backslash           : 0x5C,     // \
    closeBracket        : 0x5D,     // ]

    a                   : 0x61,     // a
    b                   : 0x62,     // b
    e                   : 0x65,     // e 
    f                   : 0x66,     // f
    l                   : 0x6C,     // l
    n                   : 0x6E,     // n
    r                   : 0x72,     // r
    s                   : 0x73,     // s
    t                   : 0x74,     // t
    u                   : 0x75,     // u

    openBrace           : 0x7B,     // {
    closeBrace          : 0x7D     // }
};
  
const WHITESPACE = [ CHAR.tab, CHAR.space, CHAR.lineFeed, CHAR.carriageReturn ];
const DELIMETER = [ CHAR.openBracket, CHAR.closeBracket, CHAR.openBrace, CHAR.closeBrace, CHAR.comma, CHAR.colon];

class Tokenizer {
    
    constructor(parser) {
        this.parser = parser;
        this.cbuffer = [];
        this.escape = false;
        this.quoted = false;
        this.whitespace = true;
    }
    
    writeBuffer(tokenType) {
        let token = (this.cbuffer.length > 0)
            ? String.fromCodePoint(...this.cbuffer)
            : "";
        //console.log("writeBuffer", token);
        this.cbuffer=[];
        return this.parser.write(tokenType, token);
    }
    
    writeString(chars) {
        //console.log("tokenizing ", chars);
        let index = 0;
        while (index < chars.length && this.writeChar(chars.codePointAt(index))) index++;
        return index+1;
    }
    
    writeChar(next) {
        //console.log(String.fromCodePoint(next));
        
        if (this.escape) {
            //console.log("escaped");
            this.cbuffer.push(next);
            this.escape = false;
            return true;
        }
        
        if (this.quoted) {
            //console.log("quoted");
            if (next === CHAR.doubleQuote) {
                this.quoted = false;
                return this.writeBuffer(TOKEN_TYPE.STRING);
            } else {
                if (next === CHAR.backslash) this.escape = true;
                this.cbuffer.push(next);
                return true;
            }
        }
        
        if (WHITESPACE.includes(next)) {
            //console.log("whitespace");
            if (this.whitespace)
                return true;
            else {
                this.whitespace = true;
                if (this.cbuffer.length) 
                    return this.writeBuffer(TOKEN_TYPE.VALUE);
                else
                    return true;
            }          
        } else {
            this.whitespace = false;
        }
        
        if (DELIMETER.includes(next)) {
            //console.log("delimeter");
            let result = this.cbuffer.length 
                ? this.writeBuffer(TOKEN_TYPE.VALUE) 
                : true;
             return result && this.parser.write(TOKEN_TYPE.DELIMETER, String.fromCodePoint(next));  
        }
        
        if (next === CHAR.doubleQuote) {
            this.quoted = true;
            return true;
        }
        
        if (next === CHAR.backslash) {
            this.escape = true;
        }
        
        this.cbuffer.push(next);
        return true;
    };  
    
    close() {
        if (this.cbuffer.length > 0)
            if (this.parser.write(TOKEN_TYPE.VALUE, String.fromCodePoint(...this.cbuffer)))
                return this.cbuffer.length;
        return 0;
    }
}

module.exports = { Tokenizer, CHAR, TOKEN_TYPE, DELIMETER, WHITESPACE };