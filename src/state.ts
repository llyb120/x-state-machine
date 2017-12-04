
export class State{
    public name;
    public condition : Function[] = [];
    public from :string[] = [];
    public to :string[] = [];
    public action : Function[] = [];
}

export class Transistion{
    public from : string[] = [];
    public to : string = "";
    // public condition:Function[] = [];
    public action: Function[] = [];
    public whenChannelWrited : (string|Function)[] = [];
}
