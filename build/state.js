"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var State = (function () {
    function State() {
        this.condition = [];
        this.from = [];
        this.to = [];
        this.action = [];
    }
    return State;
}());
exports.State = State;
var Transistion = (function () {
    function Transistion() {
        this.from = [];
        this.to = "";
        // public condition:Function[] = [];
        this.action = [];
        this.whenChannelWrited = [];
    }
    return Transistion;
}());
exports.Transistion = Transistion;
