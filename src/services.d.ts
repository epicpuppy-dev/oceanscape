interface Workspace extends Instance {}
interface PlayerModule {
    GetControls: (this: PlayerModule) => ControlModule;
}
interface ControlModule {
    Disable: (this: ControlModule) => void;
}
