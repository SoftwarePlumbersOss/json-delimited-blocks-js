/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const ENCODINGS = {
    'utf-8' : { length: utf8length, write: utf8write },
    'ibm866' : { length: one, write: onewrite },
    'iso-8859-2' : { length: one, write: onewrite }, 
    'iso-8859-3' : { length: one, write: onewrite }, 
    'iso-8859-4' : { length: one, write: onewrite },
    'iso-8859-5' : { length: one, write: onewrite }, 
    'iso-8859-6' : { length: one, write: onewrite }, 
    'iso-8859-7' : { length: one, write: onewrite }, 
    'iso-8859-8' : { length: one, write: onewrite },
    'iso-8859-8i' : { length: one, write: onewrite }, 
    'iso-8859-10' : { length: one, write: onewrite }, 
    'iso-8859-13' : { length: one, write: onewrite }, 
    'iso-8859-14' : { length: one, write: onewrite }, 
    'iso-8859-15' : { length: one, write: onewrite }, 
    'iso-8859-16' : { length: one, write: onewrite }, 
    'koi8-r' : { length: one, write: onewrite }, 
    'koi8-u' : { length: one, write: onewrite }, 
    'macintosh' : { length: one, write: onewrite }, 
    'windows-874' : { length: one, write: onewrite }, 
    'windows-1250' : { length: one, write: onewrite }, 
    'windows-1251' : { length: one, write: onewrite }, 
    'windows-1252' : { length: one, write: onewrite }, 
    'windows-1253' : { length: one, write: onewrite }, 
    'windows-1254' : { length: one, write: onewrite }, 
    'windows-1255' : { length: one, write: onewrite }, 
    'windows-1256' : { length: one, write: onewrite }, 
    'windows-1257' : { length: one, write: onewrite }, 
    'windows-1258' : { length: one, write: onewrite },
    'x-mac-cyrillic' : { length: one, write: onewrite },
    'utf-16be' : { length: two, write: twobewrite }, 
    'utf-16le' : { length: two, write: twolewrite },
    'gbk' : { length: gbklength, write: gbkwrite }
}

function utf8length(char) {
    if (char <= 0x7F) return 1;
    if (char <= 0x07FF) return 2;
    if (char <= 0xFFFF) return 3;
    return 4;    
}

function utf8write(buffer, byte) {
    //console.log(buffer.toString(16), byte.toString(16));
    // is the topmost bit in the incoming byte set?
    if (byte & 0x80)  {
        // is there a byte waiting in third buffer position?
        if ((buffer & 0xF00000) === 0xF00000) 
            // return a 4-byte code point
            return  { buffer: 
                        ((buffer & 0x70000) << 2) 
                      | ((buffer & 0x03F00) << 4)
                      | ((buffer & 0x0003F) << 6)
                      | (byte & 0x3F), 
                      sz: 4 
                    };
        // is there a byte waiting in second buffer position, and is it for a three-byte code?
        if ((buffer & 0xE000) === 0xE000 && (buffer & 0x1000) === 0)
            // return a 3-byte code point
            return { buffer: 
                        ((buffer & 0xF00) << 4)
                      | ((buffer & 0x3F) << 6)
                      | (byte & 0x3F), 
                     sz: 3 };
        // is there a byte waiting in the first buffer position, and is it for two-byte code?
        if ((buffer & 0xC0) === 0xC0 && (buffer & 0x20) === 0) 
            // return a 2-byte code point
            return { buffer: 
                        ((buffer & 0x1F) << 6) 
                      | byte & 0x3F, sz: 2 };
        // fall back to adding the byte to the buffer
        return { buffer: (buffer << 8) | byte, sz : 0 };
    } 
    // return a single-byte code point
    return { buffer: byte, sz : 1 };
}

function gbklength(char) {
    return (char <= 0x7F) ? 1 : 2;
}

function gbkwrite(buffer, byte) {
    if (byte & 0x80) {
        if (buffer) 
            return { buffer : (buffer << 8) | byte, sz: 2 };
        else     
            return { buffer: byte, sz : 0 };
        }
    return { buffer: byte, sz : 1 };    
}

function one() {
    return 1;
}

function onewrite(buffer, byte) {
    return { buffer: byte, sz: 1 };
}

function two() {
    return 2;
}

function twolewrite(buffer, byte) {
    if (buffer) 
        return { buffer : (0xFF & buffer) | (byte << 8), sz: 2 };
    else     
        return { buffer: 0xF00 | byte, sz : 0 };
}

function twobewrite(buffer, byte) {
    if (buffer) 
        return { buffer : ((0xFF & buffer) << 8) | byte, sz: 2 };
    else     
        return { buffer: 0xF00 | byte, sz : 0 };
}

class Decoder {
    
    
    constructor(tokenizer, encoding = 'utf-8') {
        this.buffer = 0;
        this.tokenizer = tokenizer;
        this.encoding = ENCODINGS[encoding];
    }
    
    write(bytes) {
        //console.log("decoding ", bytes);
        let pos = 0;
        let written = 0;
        let more = true;
        while (more && pos < bytes.length) {
            let { buffer, sz } = this.encoding.write(this.buffer, bytes[pos++]);
            if (sz > 0) {
                this.buffer = 0;
                written += sz;
                more = this.tokenizer.writeChar(buffer);
            } else {
                this.buffer = buffer;
            }
        }   
        return written;
    }
    
    close() {
        return this.tokenizer.close();       
    }
}

module.exports = { Decoder };