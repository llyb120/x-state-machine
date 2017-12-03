import { StateMachine } from './../state_machine';
let fsm = new StateMachine;
// fsm.name("cubi").add();
// fsm.name("guichu").from("cubi").do(() => console.log(123)).add();
// fsm.from("cubi").to("guichu").do(() => )


// fsm.")
fsm.state = "cubi";
fsm.transition("cubi -> guichu")
    .when("btn a clicked")
    .do(() => console.log(123))
    .add();


console.log(fsm.state);
// fsm.state = "guichu";
fsm.channel.write("btn a clicked");
