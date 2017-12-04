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
    // .when(() => a == 1)
    .do(() => console.log(123))
    .add();

fsm.transition("cubi -> ?")
    .when("test ?")
    .do((...args) => {
        console.log(...args);
        return '2b';
    })
    .add();


fsm.transition("cubi => rigou")
    .when(item => item == 'guichu')
    .do(() => console.log(456))
    .add();


console.log(fsm.state);

//触发器（效率最差）
// setTimeout(() => {
//     a = 1;
// },300);

// //手动更改状态
// fsm.state = "guichu";

//使用信道
// fsm.channel.write("test generic",{guichu:1});

fsm.send("guichu");

setTimeout(() => {
    console.log(fsm.state);
},500);