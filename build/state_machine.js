"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var channel_1 = require("./channel");
var state_1 = require("./state");
var StateMachine = (function () {
    function StateMachine(context) {
        this.context = context;
        this.currentFactory = null;
        this._state = "";
        // private stateMap:{
        //     [key:string] : State
        // } = {};
        this.transitions = [];
        this.loopTimer = null;
        this.channel = new channel_1.Channel(this);
        this.mainLoop();
    }
    StateMachine.prototype.changeState = function (oldState, newState, data, preData) {
        //得到当前的状态，如果当前没有状态，那么
        for (var _i = 0, _a = this.transitions; _i < _a.length; _i++) {
            var transition = _a[_i];
            if (transition.from.indexOf(oldState) > -1) {
                if (transition.to !== newState)
                    continue;
                //进度转化
                //只允许触发一个
                var ret = preData === undefined ? transition.action.call(this.context, data) : (_b = transition.action).call.apply(_b, [this.context].concat(preData, [data]));
                if (ret === false) {
                    throw new Error();
                }
                if (typeof ret === 'string') {
                    this.forceSetState(ret);
                }
                if (newState !== '?') {
                    this._state = newState;
                }
                return true;
            }
        }
        return false;
        var _b;
    };
    StateMachine.prototype.onMessageReceive = function (msg, data) {
        for (var _i = 0, _a = this.transitions; _i < _a.length; _i++) {
            var transition = _a[_i];
            var flag = false;
            var matched = void 0;
            for (var _b = 0, _c = transition.whenChannelWrited; _b < _c.length; _b++) {
                var item = _c[_b];
                if (typeof item === 'string') {
                    if (item.indexOf("?") > -1) {
                        var reg = new RegExp('^' + item.replace(/\?/g, " (\\S+) ") + '$', "g");
                        var m = [];
                        var r = null;
                        while (r = reg.exec(msg)) {
                            m.push(r[1].trim());
                        }
                        m.length && (matched = m) && (flag = true);
                    }
                    else if (msg === item)
                        flag = true;
                }
                else {
                    var condition = item;
                    if (condition(msg))
                        flag = true;
                }
            }
            if (!flag)
                continue;
            if (transition.from.indexOf(this.state) === -1) {
                continue;
            }
            //多个并发的情况，只允许有一个生效
            try {
                this.changeState(this.state, transition.to, data, matched || undefined);
                return;
            }
            catch (e) {
            }
            // this.state = transition.to;
            // return;
        }
    };
    StateMachine.prototype.mainLoop = function () {
        if (this.channel.firstMessage()) {
            var _a = this.channel.read(), msg = _a[0], data = _a[1];
            console.log(msg, data);
            this.onMessageReceive(msg, data);
        }
        // if (this.triggers.length) {
        //     for (const [condition, transition] of this.triggers) {
        //         if (condition()) {
        //             this.state = transition.to;
        //             break;
        //         }
        //     }
        // }
        this.loopTimer = setTimeout(this.mainLoop.bind(this), 32);
    };
    StateMachine.prototype.when = function (conditionOrConditions) {
        if (this.currentFactory === null) {
            this.currentFactory = new state_1.Transistion;
        }
        // let conditions = [];
        var type = typeof conditionOrConditions;
        if (type === 'string') {
            conditionOrConditions = conditionOrConditions;
            this.currentFactory.whenChannelWrited.push(conditionOrConditions);
            return this;
        }
        else if (type === 'function') {
            conditionOrConditions = conditionOrConditions;
            this.currentFactory.whenChannelWrited.push(conditionOrConditions);
            // this.triggers.push([conditionOrConditions as Function, this.currentFactory]);
            return this;
        }
        else {
            conditionOrConditions = conditionOrConditions;
            this.currentFactory.whenChannelWrited = this.currentFactory.whenChannelWrited.concat(conditionOrConditions);
            return this;
        }
    };
    StateMachine.prototype.add = function () {
        if (this.currentFactory === null) {
            throw new Error();
        }
        //如果没有名字，那么排除
        this.transitions.push(this.currentFactory);
        // if(this.currentFactory.name === ""){
        //     throw new Error();
        // }
        // this.stateMap[this.currentFactory.name] = this.currentFactory;
        //如果没有来源，说明为默认状态，只允许有一个默认状态
        // if(this.currentFactory.from.length === 0 && this.defaultState === ""){
        // this.defaultState = this.currentFactory.name;
        // }
        this.currentFactory = null;
    };
    // from(stateOrStates:string | string[]){
    //     let states = [];
    //     if(typeof stateOrStates !== 'string'){
    //         states = stateOrStates;
    //     }
    //     else{
    //         states.push(stateOrStates);
    //     }
    //     if(this.currentFactory === null){
    //         this.currentFactory = new State;
    //     }
    //     this.currentFactory.from = states;
    //     return this;
    // }
    // to(stateOrStates : string | string[]){
    //     let states = [];
    //     if(typeof stateOrStates !== 'string'){
    //         states = stateOrStates;
    //     }
    //     else{
    //         states.push(stateOrStates);
    //     }
    //     if(this.currentFactory === null){
    //         this.currentFactory = new State;
    //     }
    //     this.currentFactory.to = states;
    //     return this;
    // }
    StateMachine.prototype.do = function (action) {
        // let actions = typeof actionOrActions === 'function' ? [actionOrActions] : actionOrActions;
        if (this.currentFactory === null) {
            this.currentFactory = new state_1.Transistion;
        }
        if (!this.currentFactory.action) {
            this.currentFactory.action = action;
        }
        return this;
    };
    StateMachine.prototype.transition = function (rule) {
        if (this.currentFactory === null) {
            this.currentFactory = new state_1.Transistion;
        }
        var arr = rule.split(/(?:\-|\=)\>/).map(function (item) { return item.trim(); });
        if (arr.length != 2) {
            throw new Error();
        }
        else {
            var froms = arr[0], to = arr[1];
            var fromArr = froms.split(",").map(function (item) { return item.trim(); });
            this.currentFactory.from = this.currentFactory.from.concat(fromArr);
            this.currentFactory.to = to;
        }
        return this;
    };
    StateMachine.prototype.send = function (msg, data) {
        return this.channel.write(msg, data);
    };
    Object.defineProperty(StateMachine.prototype, "state", {
        // name(name : string){
        //     if(this.currentFactory === null){
        //         this.currentFactory = new State;
        //     } 
        //     this.currentFactory.name = name;
        //     return this;
        // }
        get: function () {
            //如果当前没有状态，那么采用默认状态
            return this._state;
        },
        set: function (state) {
            var currentState = this.state;
            if (currentState === "") {
                this._state = state;
                return;
            }
            if (currentState === state) {
                return;
            }
            if (this.changeState(currentState, state)) {
                return;
            }
            throw new Error();
        },
        enumerable: true,
        configurable: true
    });
    StateMachine.prototype.forceSetState = function (state) {
        this._state = state;
    };
    return StateMachine;
}());
exports.StateMachine = StateMachine;
