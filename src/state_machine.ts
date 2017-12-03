import { State } from './state';
export class StateMachine{

    private currentFactory: State = null;
    private _state:string = "";
    private stateMap:{
        [key:string] : State
    } = {};


    when(condition: Function)
    when(conditions: Function[])
    when(condition: Function | Function[]){
        
    }   

    add(){
        if(this.currentFactory === null){
            throw new Error();
        }
        this.stateMap[this.currentFactory.name] = this.currentFactory;
        this.currentFactory = null;
    }

    from(state:string);
    from(states:string[])
    from(stateOrStates:string | string[]){
        let states = [];
        if(typeof stateOrStates !== 'string'){
            states = stateOrStates;
        }
        else{
            states.push(stateOrStates);
        }
        if(this.currentFactory === null){
            this.currentFactory = new State;
        }
        this.currentFactory.from = states;
    }

    to(state:string)
    to(states:string[])
    to(stateOrStates : string | string[]){
        let states = [];
        if(typeof stateOrStates !== 'string'){
            states = stateOrStates;
        }
        else{
            states.push(stateOrStates);
        }
        if(this.currentFactory === null){
            this.currentFactory = new State;
        }
        this.currentFactory.to = states;
    }

    name(name : string){
        if(this.currentFactory === null){
            this.currentFactory = new State;
        } 
        this.currentFactory.name = name;
    }

    get state(){
        return this._state;
    }

    set state(state){

    }

}