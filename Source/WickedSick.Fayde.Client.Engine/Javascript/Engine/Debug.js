var DebugLevel = {
    Info: 0,
    Debug: 1,
    Warn: 2,
    Error: 3,
    Fatal: 4
};

//#region HUD

HUD.prototype = new Object;
HUD.prototype.constructor = HUD;
function HUD(jSelector) {
    this._Selector = jSelector;
};
HUD.prototype.SetMessage = function (message) {
    $(this._Selector)[0].innerText = message;
};

var HUDs = [];

//#endregion

function AbstractMethod(method) {
    Warn("Abstract Method [" + method + "]");
}
function NotImplemented(method) {
    Warn("Not Implemented [" + method + "]");
}

function Info(message) {
    if (window.console && console.info)
        console.info(message);
}
function Debug(message) {
    if (window.console && console.log)
        console.log(message);
}
function Warn(message) {
    if (window.console && console.warn)
        console.warn(message);
}
function Error(error) {
    if (window.console && console.error)
        console.error(error.toString());
}
function Fatal(error) {
    if (window.console && console.error)
        console.error("FATAL: " + error.toString());
    App.Instance._Stop();
}

function RegisterHUD(id, jSelector) {
    HUDs[id] = new HUD(jSelector);
};
function HUDUpdate(id, message) {
    var hud = HUDs[id];
    if (!hud)
        return;
    hud.SetMessage(message);
}
