/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const { Tokenizer, CHAR, TOKEN_TYPE } = require("./tokenizer.js");

class Parser {
    
    constructor(callback) {
        this.callback = callback;
        this.stack = [];
        this.object = undefined;
        this.value = undefined;
        this.key = undefined;
    }
    
    push(newObject) {
        if (this.object !== undefined) {
            this.object[this.key] = newObject;
            this.stack.push(this.object);
        }
        this.object = newObject;        
    }
    
    pop() {
        if (this.stack.length > 0 )
            this.object = this.stack.pop();
        else {
            this.callback(this.object);
            this.object = undefined;
        }
    }
    
    storeArrayValue() {
        if (this.object === undefined || !Array.isArray(this.object)) throw new Error("Invalid JSON");
        if (this.value !== undefined) { 
            this.object.push(this.value); 
            this.value = undefined; 
        }    
    }
    
    storeObjectValue() {
        //console.log("store: ", this.object);
        if (this.object === undefined || Array.isArray(this.object)) throw new Error("Invalid JSON");                
        if (this.key !== undefined && this.value !== undefined) { 
            this.object[this.key] = this.value; 
            this.value = undefined; 
            this.key = undefined;
        }   
    }
    
    write(tokenType, token) {
        //console.log("write", tokenType, token)
        switch (tokenType) {
            case TOKEN_TYPE.DELIMETER:
                //console.log("delimeter");
                switch(token.codePointAt(0)) {
                    case CHAR.openBrace:
                        this.push({});
                        break;
                    case CHAR.openBracket:
                        this.push([]);                       
                        break;
                    case CHAR.closeBrace:
                        this.storeObjectValue();
                        this.pop();
                        break;
                    case CHAR.closeBracket:
                        this.storeArrayValue();                        
                        this.pop();
                        break;
                    case CHAR.comma:
                        if (Array.isArray(this.object)) {
                            this.storeArrayValue();
                        } else {
                            this.storeObjectValue();
                        } 
                        break;
                    case CHAR.colon:
                        this.key = this.value;
                        break;
                }
                break;
            case TOKEN_TYPE.VALUE:
                //console.log("value");
                this.value = JSON.parse(token);
                if (this.object === undefined) this.callback(this.value);
                break;
            case TOKEN_TYPE.STRING:
                //console.log("string");
                this.value = JSON.parse(`"${token}"`);
                if (this.object === undefined) this.callback(this.value);
                break;
        }
        return this.object !== undefined;
    }
}

module.exports = { Parser };