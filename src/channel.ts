import { StateMachine } from './state_machine';
export class Channel {

    private msg: any[] = [];

    constructor(private context: StateMachine) {

    }

    write(msg: string, data?: any) {
        this.msg.push([msg, data]);
        // this.context.onMessageReceive(msg, data);
    }

    read() {
        return this.msg.shift();
    }

    firstMessage() {
        return this.msg.length ? this.msg[0] : null;
    }

}