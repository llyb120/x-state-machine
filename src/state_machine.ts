import { Channel } from './channel';
import { State, Transistion } from './state';
export class StateMachine{

    private currentFactory: Transistion = null;
    private _state:string = "";
    private stateMap:{
        [key:string] : State
    } = {};
    private transitions:Transistion[] = [];
    
    // private defaultState = "";
    public channel:Channel;
    private loopTimer = null;

    constructor(){
        this.channel = new Channel(this);
        
        this.mainLoop();
    }

    private onMessageReceive(msg : string){
        for(const transition of this.transitions){ 
            if(transition.whenChannelWrited.indexOf(msg) === -1){
                continue;
            }
            if(transition.from.indexOf(this.state) === -1){
                continue;
            }
            this.state = transition.to;
        }
    }
    
    private mainLoop(){
        if(this.channel.firstMessage()){
            let msg = this.channel.read();
            this.onMessageReceive(msg);
        }
        this.loopTimer = setTimeout(this.mainLoop.bind(this),32);
    }

    when(conditionOrConditions: Function | Function[] | string){
        if(this.currentFactory === null){
            this.currentFactory = new Transistion;
        }
        let conditions = [];
        let type = typeof conditionOrConditions;
        if(type === 'string'){
            this.currentFactory.whenChannelWrited.push(conditionOrConditions as string);
        }
        else if(type === 'function'){
            conditions.push(conditionOrConditions);
        } 
        else{
            conditions = conditionOrConditions as Function[];
        }
        this.currentFactory.condition = this.currentFactory.condition.concat(conditions);
        return this;
    }   

    add(){
        if(this.currentFactory === null){
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

    do(actionOrActions : Function | Function[]){
        let actions = typeof actionOrActions === 'function' ? [actionOrActions] : actionOrActions;
        if(this.currentFactory === null){
            this.currentFactory = new Transistion;
        } 
        this.currentFactory.action = this.currentFactory.action.concat(actions);
        return this;

    }


    transition(rule : string){
        if(this.currentFactory === null){
            this.currentFactory = new Transistion;
        } 
        let arr = rule.split("->").map(item => item.trim());
        if(arr.length != 2){
            throw new Error();
        }
        else{
            let [froms,to] = arr;
            let fromArr = froms.split(",").map(item => item.trim());
            this.currentFactory.from = this.currentFactory.from.concat(fromArr);
            this.currentFactory.to = to;
        }
        return this;
    }

    

    // name(name : string){
    //     if(this.currentFactory === null){
    //         this.currentFactory = new State;
    //     } 
    //     this.currentFactory.name = name;
    //     return this;
    // }


    
    get state(){
        //如果当前没有状态，那么采用默认状态
        // if(this._state === ""){
            // return this.defaultState;
        // }
        return this._state;
    }

    set state(state){
        let currentState = this.state;
        if(currentState === ""){
            this._state = state;
            return;
        }
        //得到当前的状态，如果当前没有状态，那么
        for(const transition of this.transitions){
            if(transition.from.indexOf(currentState) > -1){
                if(transition.to !== state) continue;
                //进度转化
                for(const action of transition.action){
                    action();
                }
                this._state = state;
                return;
            }
        }
        
        throw new Error();
    }




}