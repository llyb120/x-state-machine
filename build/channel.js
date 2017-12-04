"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Channel = (function () {
    function Channel(context) {
        this.context = context;
        this.msg = [];
    }
    Channel.prototype.write = function (msg, data) {
        this.msg.push([msg, data]);
        // this.context.onMessageReceive(msg, data);
    };
    Channel.prototype.read = function () {
        return this.msg.shift();
    };
    Channel.prototype.firstMessage = function () {
        return this.msg.length ? this.msg[0] : null;
    };
    return Channel;
}());
exports.Channel = Channel;
