/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const { TextDecoder } = require("text-encoding");

const ENCODINGS = {
    'utf-8' : { length: utf8length },
    'ibm866' : { length: one },
    'iso-8859-2' : { length: one }, 
    'iso-8859-3' : { length: one }, 
    'iso-8859-4' : { length: one },
    'iso-8859-5' : { length: one }, 
    'iso-8859-6' : { length: one }, 
    'iso-8859-7' : { length: one }, 
    'iso-8859-8' : { length: one },
    'iso-8859-8i' : { length: one }, 
    'iso-8859-10' : { length: one }, 
    'iso-8859-13' : { length: one }, 
    'iso-8859-14' : { length: one }, 
    'iso-8859-15' : { length: one }, 
    'iso-8859-16' : { length: one }, 
    'koi8-r' : { length: one }, 
    'koi8-u' : { length: one }, 
    'macintosh' : { length: one }, 
    'windows-874' : { length: one }, 
    'windows-1250' : { length: one }, 
    'windows-1251' : { length: one }, 
    'windows-1252' : { length: one }, 
    'windows-1253' : { length: one }, 
    'windows-1254' : { length: one }, 
    'windows-1255' : { length: one }, 
    'windows-1256' : { length: one }, 
    'windows-1257' : { length: one }, 
    'windows-1258' : { length: one },
    'x-mac-cyrillic' : { length: one },
    'utf-16be' : { length: two }, 
    'utf-16le' : { length: two },
    'gbk' : { length: gbklength }
}

function utf8length(char) {
    if (char <= 0x7F) return 1;
    if (char <= 0x07FF) return 2;
    if (char <= 0xFFFF) return 3;
    return 4;
    
}

function gbklength(char) {
    return (char <= 0x7F) ? 1 : 2;
}

function one() {
    return 1;
}

function two() {
    return 2;
}

class Decoder {
    
    constructor(tokenizer, encoding) {
        this.tokenizer = tokenizer;
        this.decoder = new TextDecoder(encoding);
        this.encoding = ENCODINGS[encoding];
    }
    
    writeString(string) {
        let written = 0;
        for (let codepoint of string) {
            let cp = codepoint.codePointAt(0);
            if (this.tokenizer.writeChar(cp)) {
                written += this.encoding.length(cp);
            } else {
                return written+1;
            }
        }
    }
    
    write(bytes) {
        return this.writeString(this.decoder.decode(bytes, { stream: true }));        
    }
    
    close() {
        return this.writeString(this.decoder.decode([], { stream: false })) + this.tokenizer.close();       
    }
}

module.exports = { Decoder };