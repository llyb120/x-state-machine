/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var channel_1 = __webpack_require__(1);
var state_1 = __webpack_require__(2);
var StateMachine = (function () {
    function StateMachine() {
        this.currentFactory = null;
        this._state = "";
        // private stateMap:{
        //     [key:string] : State
        // } = {};
        this.transitions = [];
        this.triggers = [];
        this.loopTimer = null;
        this.channel = new channel_1.Channel(this);
        this.mainLoop();
    }
    StateMachine.prototype.onMessageReceive = function (msg) {
        for (var _i = 0, _a = this.transitions; _i < _a.length; _i++) {
            var transition = _a[_i];
            if (transition.whenChannelWrited.indexOf(msg) === -1) {
                continue;
            }
            if (transition.from.indexOf(this.state) === -1) {
                continue;
            }
            this.state = transition.to;
        }
    };
    StateMachine.prototype.mainLoop = function () {
        if (this.channel.firstMessage()) {
            var msg = this.channel.read();
            this.onMessageReceive(msg);
        }
        if (this.triggers.length) {
            for (var _i = 0, _a = this.triggers; _i < _a.length; _i++) {
                var _b = _a[_i], condition = _b[0], transition = _b[1];
                if (condition()) {
                    this.state = transition.to;
                    break;
                }
            }
        }
        this.loopTimer = setTimeout(this.mainLoop.bind(this), 32);
    };
    StateMachine.prototype.when = function (conditionOrConditions) {
        if (this.currentFactory === null) {
            this.currentFactory = new state_1.Transistion;
        }
        // let conditions = [];
        var type = typeof conditionOrConditions;
        if (type === 'string') {
            this.currentFactory.whenChannelWrited.push(conditionOrConditions);
            return this;
        }
        else if (type === 'function') {
            this.triggers.push([conditionOrConditions, this.currentFactory]);
            return this;
        }
        throw new Error();
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
    StateMachine.prototype.do = function (actionOrActions) {
        var actions = typeof actionOrActions === 'function' ? [actionOrActions] : actionOrActions;
        if (this.currentFactory === null) {
            this.currentFactory = new state_1.Transistion;
        }
        this.currentFactory.action = this.currentFactory.action.concat(actions);
        return this;
    };
    StateMachine.prototype.transition = function (rule) {
        if (this.currentFactory === null) {
            this.currentFactory = new state_1.Transistion;
        }
        var arr = rule.split("->").map(function (item) { return item.trim(); });
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
            // if(this._state === ""){
            // return this.defaultState;
            // }
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
            //得到当前的状态，如果当前没有状态，那么
            for (var _i = 0, _a = this.transitions; _i < _a.length; _i++) {
                var transition = _a[_i];
                if (transition.from.indexOf(currentState) > -1) {
                    if (transition.to !== state)
                        continue;
                    //进度转化
                    for (var _b = 0, _c = transition.action; _b < _c.length; _b++) {
                        var action = _c[_b];
                        action();
                    }
                    this._state = state;
                    return;
                }
            }
            throw new Error();
        },
        enumerable: true,
        configurable: true
    });
    return StateMachine;
}());
exports.StateMachine = StateMachine;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Channel = (function () {
    function Channel(context) {
        this.context = context;
        this.msg = [];
    }
    Channel.prototype.write = function (msg) {
        this.msg.push(msg);
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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ })
/******/ ]);