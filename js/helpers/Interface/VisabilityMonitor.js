﻿function VisabilityMonitor(session, main)
{
    this.session = session;
    this.main = main;

    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined")
    {
        hidden = "hidden"; visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined")
    {
        hidden = "mozHidden"; visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined")
    {
        hidden = "msHidden"; visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined")
    {
        hidden = "webkitHidden"; visibilityChange = "webkitvisibilitychange";
    }

    var self = this;
    this.inFocus = true;

    document.focus = window.onfocus = function () { self.inFocus = true; self.handleScreenVisabilityChange(0); };
    document.onblur = window.onblur = function () { self.inFocus = false; self.handleScreenVisabilityChange(0); };
    document.addEventListener(visibilityChange, this.handleScreenVisabilityChange.bind(this, 0));
};

VisabilityMonitor.prototype.handleScreenVisabilityChange = function (onceRound, screenChange)
{
    if ((this.session !== null || this.session !== undefined) && this.session.getSessionNumber() !== "?")
        {

    var currState = this.state || "";
    if (document.hidden)
        this.state = "hidden";
    else if (onceRound && !document.hidden && !this.inFocus)
        this.state = "nofocus";
    else if (!document.hidden && !this.inFocus)
        setTimeout(this.handleScreenVisabilityChange.bind(this, 1), 15);
    else if (!document.hidden && this.inFocus)
        this.state = "active";

    /////Handle the change
            if (screenChange || (currState !== this.state))
            {
                var currentScreen;    
                if (this.main.viewManager.currentView === undefined)
                    currentScreen = "MAINMENU";
                else
                    currentScreen = this.main.viewManager.currentScreenName;

                var stateChangeData = {
                    "sessionNumber": this.session.getSessionNumber(),
                    "id": this.session.getID(),
                    "view": currentScreen,        
                    "state": this.state,
                    "timestamp": Date.now()
                }
                           
                if (stateChangeData.view.substr(0,4) === "TASK")
                {
                    DBInterface.saveVisabilityActivity(this.session, this.session.getID(), stateChangeData);
                    debug(stateChangeData);
                } 
            }
        }
};
