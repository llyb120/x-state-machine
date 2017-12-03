import { StateMachine } from './../state_machine';
let fsm = new StateMachine;
// fsm.name("cubi").add();
// fsm.name("guichu").from("cubi").do(() => console.log(123)).add();
// fsm.from("cubi").to("guichu").do(() => )


// fsm.")
let a = 0;
fsm.state = "cubi";
fsm.transition("cubi -> guichu")
    .when("btn a clicked")
    .when(() => a == 1)
    .do(() => console.log(123))
    .add();


console.log(fsm.state);
setTimeout(() => {
    a = 1;
},300)
// fsm.state = "guichu";
// fsm.channel.write("btn a clicked");
