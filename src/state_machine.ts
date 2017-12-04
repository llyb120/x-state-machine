import { Channel } from './channel';
import { State, Transistion } from './state';
export class StateMachine {

    private currentFactory: Transistion = null;
    private _state: string = "";
    // private stateMap:{
    //     [key:string] : State
    // } = {};
    private transitions: Transistion[] = [];
    // private triggers: [Function, Transistion][] = [];

    // private defaultState = "";
    public channel: Channel;
    private loopTimer = null;

    constructor() {
        this.channel = new Channel(this);

        this.mainLoop();
    }

    private changeState(oldState: string, newState: string, data?, preData?) {
        //得到当前的状态，如果当前没有状态，那么
        for (const transition of this.transitions) {
            if (transition.from.indexOf(oldState) > -1) {
                if (transition.to !== newState) continue;
                //进度转化
                for (const action of transition.action) {
                    let ret = preData === undefined ? action(data) : action(...preData, data);
                    if (typeof ret === 'string') {
                        this.forceSetState(ret);
                    }
                }
                if (newState !== '?') {
                    this._state = newState;
                }
                return true;
            }
        }
        return false;
    }

    private onMessageReceive(msg: any, data: any) {
        for (const transition of this.transitions) {
            let flag = false;
            let matched: any;
            for (const item of transition.whenChannelWrited) {
                if(typeof item === 'string'){
                    if (item.indexOf("?") > -1) {
                        let reg = new RegExp('^'+item.replace(/\?/g, " (\\S+) ") + '$', "g");
                        let m = [];
                        let r = null;
                        while (r = reg.exec(msg)) {
                            m.push(r[1].trim());
                        }
                        m.length && (matched = m) && (flag = true);
                    }
                    else if (msg === item) flag = true;
                }
                else{
                    let condition = item as Function;
                    if(condition(msg)) flag = true;
                }
            }
            if (!flag) continue;
            if (transition.from.indexOf(this.state) === -1) {
                continue;
            }
            this.changeState(this.state, transition.to, data, matched || undefined);
            // this.state = transition.to;
            return;
        }
    }

    private mainLoop() {
        if (this.channel.firstMessage()) {
            let [msg, data] = this.channel.read();
            console.log(msg, data)
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
    }


    when(conditionOrConditions: Function | string) {
        if (this.currentFactory === null) {
            this.currentFactory = new Transistion;
        }
        // let conditions = [];
        let type = typeof conditionOrConditions;
        if (type === 'string') {
            conditionOrConditions = conditionOrConditions as string;
            this.currentFactory.whenChannelWrited.push(conditionOrConditions as string);
            return this;
        }
        //如果是触发器验证
        else if (type === 'function') {
            conditionOrConditions = conditionOrConditions as Function;
            this.currentFactory.whenChannelWrited.push(conditionOrConditions);
            // this.triggers.push([conditionOrConditions as Function, this.currentFactory]);
            return this;
        }
        throw new Error();
    }

    add() {
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
    }

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

    do(actionOrActions: Function | Function[]) {
        let actions = typeof actionOrActions === 'function' ? [actionOrActions] : actionOrActions;
        if (this.currentFactory === null) {
            this.currentFactory = new Transistion;
        }
        this.currentFactory.action = this.currentFactory.action.concat(actions);
        return this;

    }


    transition(rule: string) {
        if (this.currentFactory === null) {
            this.currentFactory = new Transistion;
        }
        let arr = rule.split(/(?:\-|\=)\>/).map(item => item.trim());
        if (arr.length != 2) {
            throw new Error();
        }
        else {
            let [froms, to] = arr;
            let fromArr = froms.split(",").map(item => item.trim());
            this.currentFactory.from = this.currentFactory.from.concat(fromArr);
            this.currentFactory.to = to;
        }
        return this;
    }


    send(msg: any, data?) {
        return this.channel.write(msg, data);
    }



    // name(name : string){
    //     if(this.currentFactory === null){
    //         this.currentFactory = new State;
    //     } 
    //     this.currentFactory.name = name;
    //     return this;
    // }



    get state() {
        //如果当前没有状态，那么采用默认状态
        return this._state;
    }

    set state(state) {
        let currentState = this.state;
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
    }


    public forceSetState(state: string) {
        this._state = state;
    }




}