"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var state_machine_1 = require("./../state_machine");
var fsm = new state_machine_1.StateMachine;
// fsm.name("cubi").add();
// fsm.name("guichu").from("cubi").do(() => console.log(123)).add();
// fsm.from("cubi").to("guichu").do(() => )
// fsm.")
var a = 0;
fsm.state = "cubi";
fsm.transition("cubi -> guichu")
    .when("btn a clicked")
    .do(function () { return console.log(123); })
    .add();
fsm.transition("cubi -> ?")
    .when("test ?")
    .do(function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.log.apply(console, ['rilegou'].concat(args));
    return '2b';
})
    .add();
console.log(fsm.state);
//触发器（效率最差）
// setTimeout(() => {
//     a = 1;
// },300);
// //手动更改状态
// fsm.state = "guichu";
//使用信道
fsm.channel.write("test generic", { guichu: 1 });
setTimeout(function () {
    console.log(fsm.state);
}, 500);
