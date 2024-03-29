﻿function VisabilityMonitor(session, main) {
    this.session = session;
    this.main = main;

    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden"; visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden"; visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden"; visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden"; visibilityChange = "webkitvisibilitychange";
    }

    var self = this;
    this.inFocus = true;

    document.focus = window.onfocus = function () { self.inFocus = true; self.handleScreenVisabilityChange(0); };
    document.onblur = window.onblur = function () { self.inFocus = false; self.handleScreenVisabilityChange(0); };
    document.addEventListener(visibilityChange, this.handleScreenVisabilityChange.bind(this, 0));
};

VisabilityMonitor.prototype.handleScreenVisabilityChange = function (onceRound, screenChange) {
    if ((this.session !== null || this.session !== undefined) && this.session.SESH_sessionNumber !== "?") {

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
        if (screenChange || (currState !== this.state)) {
            var delta = new Date() - this.timeOfLastStateChange;
            var oldStateBegan, currentScreen;

            if (this.timeOfLastStateChange === undefined) {
                oldStateBegan = -1;
                delta = -1;
            }
            else
                oldStateBegan = this.timeOfLastStateChange.toString("dd-MM-yyyy HH:mm:ss");

            if (this.main.viewManager.currentView === undefined)
                currentScreen = "LOGIN";
            else
                currentScreen = this.main.viewManager.currentScreenName;

            var stateChangeData = {
                "SESH_sessionNumber": this.session.getSessionNumber(),
                "id": this.session.getID(),
                "view": currentScreen,
                "oldState": currState,
                "oldStateBegan": oldStateBegan,
                "newState": this.state,
                "newStateBegan": new Date().toString("dd-MM-yyyy HH:mm:ss"),
                "durationOfOldState": delta
            }
            //debug(stateChangeData);
            if (stateChangeData.view.substring(0, 4) === "TASK")
            {
                this.session.recordLossOfFocusEvent();
                DBInterface.saveVisabilityActivity(this.session, stateChangeData);
            }
            this.timeOfLastStateChange = new Date();
        }
    }
};
