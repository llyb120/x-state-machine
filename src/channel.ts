import { StateMachine } from './state_machine';
export class Channel{
    
    private msg :any[] = [];

    constructor(private context : StateMachine){

    }

    write(msg : any){
        this.msg.push(msg);
    }

    read(){
        return this.msg.shift();
    }

    firstMessage(){
        return this.msg.length ? this.msg[0] : null;
    }

}