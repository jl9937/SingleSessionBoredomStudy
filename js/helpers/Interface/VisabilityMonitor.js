function VisabilityMonitor(session, main)
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

    document.focus = window.onfocus = function () { self.inFocus = true; self.handleScreenVisabilityChange(); };
    document.onblur = window.onblur = function () { self.inFocus = false; self.handleScreenVisabilityChange(); };
    document.addEventListener(visibilityChange, this.handleScreenVisabilityChange.bind(this));
};

VisabilityMonitor.prototype.handleScreenVisabilityChange = function()
{
    if ((this.session !== null || this.session !== undefined) && this.session.getSessionNumber() !== "?")
    {
        var oldState = this.state || "";
        if (document.hidden)
            this.state = "hidden";
        else
        {
            if (!this.inFocus)
                this.state = "nofocus";
            else
                this.state = "active";
        }

        if ( isValidStateChange(oldState, this.state) )
        {
            var stateChangeData = {
                "sessionNumber": this.session.getSessionNumber(),
                "id": this.session.getID(),
                "view": this.main.viewManager.currentScreenName,
                "state": this.state,
                "timestamp": Date.now()
            }
            DBInterface.saveVisabilityActivity(this.session, this.session.getID(), stateChangeData);

            if (isLossOfFocusEvent(oldState, this.state, stateChangeData.view))
                this.session.recordLossOfFocusEvent();
        }
    }

    function isLossOfFocusEvent(oldState, newState, currentScreen)
    {
        if (isValidStateChange(oldState, newState) && currentScreen.substr(0, 4) === "TASK")
            return true;
        return false;
    }

    function isValidStateChange(oldState, newState)
    {
        if (oldState === newState)
            return false;
        if (oldState === "active")
            return true;
    }
};
