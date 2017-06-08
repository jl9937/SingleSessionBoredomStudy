//This object manages all possible views in the app.. Holds indexes for all views. 
function VMan(_stage, main)
{
    VMan.viewArray = [];
    this.main = main;
    this.stage = _stage;
};

//VMan.prototype.addScreen = function(name, object)
VMan.addScreens = function (basename, objects)
{
    for (var i = 0; i < objects.length; i++)
        VMan.viewArray.push({ "name": basename + (i+1), "screen": objects[i] });
}

//VMan.prototype.addScreen = function(name, object)
VMan.addScreen = function (name, object)
{
    VMan.viewArray.push({ "name": name, "screen": object });
}

//This function is called every run around the main loop to see if we need to move onto the next screen
VMan.prototype.checkAllScreens = function ()
{
    if (this.currentView.CheckIfMoveToNextScreen() !== -1)
        this.setScreen(this.currentView.CheckIfMoveToNextScreen());
}

//When the app changes to a new screen, this handles the deconstruction of the old view, and setup of the next
VMan.prototype.setScreen = function (screenName)
{
    //if not in a view, then don't deconstruct one
    if (typeof this.currentView !== "undefined")
    {
        var session = this.currentView.session;
        this.currentView.deconstruct(this.stage);
    }

    var tempScreenObject = VMan.viewArray[this.getSrnNum(screenName)];
    this.currentScreenName = tempScreenObject.name;
    this.currentView = tempScreenObject.screen;

    this.main.visMonitor.handleScreenVisabilityChange(0,1);
    this.currentView.create(this.stage,session);
}

VMan.prototype.getSrnNum = function (searchName)
{
    for (var i = 0; i < VMan.viewArray.length; i++)
    {
        if (VMan.viewArray[i].name === searchName)
            return i;
    }
    throw "error: no screen with name: " + searchName;
}