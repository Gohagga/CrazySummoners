import { IState } from "./State";

export class Transition {
    public condition: (context: any) => boolean;
    public targetState: IState;
  
    constructor(condition: (context: any) => boolean, targetState: IState) {
      this.condition = (context: any) => condition(context);
      this.targetState = targetState;
    }
  }
  