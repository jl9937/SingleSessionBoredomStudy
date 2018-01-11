Main.DBURL = "https://mindgamesmkii.firebaseio.com";
Main.URL = "https://mindgamesmkii.firebaseapp.com";

Main.SCREEN_WIDTH = 1024;
Main.SCREEN_HEIGHT = 730;
Main.WORD_WRAP_WIDTH = 800;

Main.CONDITION_NONGAME = 0;
Main.CONDITION_POINTS = 1;
Main.CONDITION_THEME = 2;

Main.COMPLETION_LINKS = [
    "https://prolific.ac/submissions/complete?cc=9IY6X0OD", //Session 1
    "https://prolific.ac/submissions/complete?cc=QWXZ1XA1", //Session 2
    "https://prolific.ac/submissions/complete?cc=0R3JI9EV" //Session 3
];

//debug switch
Main.isDebug = true;
var debug;

function Main()
{
    //if debugging is on: 
    if (Main.isDebug)
        debug = console.log.bind(window.console);
    else
        debug = function () { }

    //PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
    //PIXI.settings.RESOLUTION = 2;

    this.app = new PIXI.Application(Main.SCREEN_WIDTH, Main.SCREEN_HEIGHT, { backgroundColor: 0x000000, resolution: PIXI.settings.RESOLUTION || 1, transparent: true, antialias: true, view: document.getElementById('game-canvas') });

    this.stage = this.app.stage;

    var self = this;
    //var resizeFunction = function ()
    //{
    //    var scaleFactor = Math.min(window.innerWidth / Main.SCREEN_WIDTH, window.innerHeight / Main.SCREEN_HEIGHT);
    //    var newWidth = Math.ceil(Main.SCREEN_WIDTH * scaleFactor);
    //    var newHeight = Math.ceil(Main.SCREEN_HEIGHT * scaleFactor);
    //    self.app.renderer.view.style.width = newWidth + "px";
    //    self.app.renderer.view.style.height = newHeight + "px";
    //    self.app.renderer.resize(newWidth, newHeight);
    //    self.stage.scale.set(scaleFactor);
    //}
    //window.addEventListener("resize", resizeFunction);
    //resizeFunction();


    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyACCRI2t52ESEl-CkFiKGY6dWSpzysJ_js",
        authDomain: Main.URL,
        databaseURL: Main.DBURL,
        projectId: "mindgamesmkii",
        storageBucket: "mindgamesmkii.appspot.com"//,
        //messagingSenderId: "561069159843"
    };
    firebase.initializeApp(config);

    //Initialize Database Interface
    this.db = new DBInterface();
    this.util = new Utils();
    this.login();
};

Main.prototype.login = function ()
{
    //If URL contains an ID parameter, extract it.
    var urlid = getUrlVars(["prolific_pid"]);
    urlid = urlid.prolific_pid;
    var forcedCondition = parseInt(getUrlVars(["sesh"]).sesh) || null;

    if (urlid && urlid.length === 24)
    {
        var self = this;
        //Check whether user ID exists already
        DBInterface.logUserIn(urlid, function (participant)
        {
            DBInterface.getTodaysSessions(participant.getID(), function (sessionData)
            {
                if (self.session === undefined)
                {
                    self.session = new Session(sessionData, participant, forcedCondition);

                    self.visMonitor = new VisabilityMonitor(self.session, self);
                    self.viewManager = new VMan(self.stage, self);

                    buildTodaysScreens(self.session, self.viewManager);
                    self.loadSprites(self.session.getCondition());
                }
            });
        });
    }
    else
    {
        alert("Are you sure you entered your Prolific ID correctly? It's should be 24 characters long\nPlease check the URL contains your full Prolific ID");
        window.location.href = Main.URL + "/index.html";
    }
}

Main.prototype.loadSprites = function(condition)
{
    var allVariantAssets = [
        "../resources/interface/background.png",
        "../resources/interface/bottombar.png"
    ];
    var nongameAssets = [
        "../resources/interface/instructions1.png"
    ];
    var pointsAssets = [
        "../resources/interface/pointsbackground.png",
        "../resources/interface/Points_instructions1.png"
    ];
    var themeAssets = [
        "../resources/interface/themeLoginBackground.jpg",
        "../resources/theme/themeMisc/Map.png",
        "../resources/interface/themeBackground.png",
        "../resources/interface/Theme_instructions1.png"
    ];

    //Add the additional assets into the load Array
    if(condition === 0)
        allVariantAssets.push.apply(allVariantAssets, nongameAssets);
    if (condition === 1)
        allVariantAssets.push.apply(allVariantAssets, pointsAssets);
    if (condition === 2)
    {
        allVariantAssets.push.apply(allVariantAssets, themeAssets);
        allVariantAssets.push.apply(allVariantAssets, Main.themeAssets);
    }


    PIXI.loader.add(allVariantAssets).load(this.spritesLoaded.bind(this));
};

Main.prototype.spritesLoaded = function ()
{
    this.viewManager.setScreen("MAINMENU");
    this.app.ticker.add(this.prepareNextFrame.bind(this));
    this.loadOtherSprites(this.session.getCondition());
};

Main.prototype.loadOtherSprites = function(condition)
{
    var allVariantAssets = [
        "../resources/taskElements/fixation.png",
        "../resources/taskElements/stopsignal.png",
        "../resources/interface/markout.png",
        "../resources/interface/down.png",
        "../resources/interface/up.png"
    ];
    var nongameAssets = [
        "../resources/interface/instructions2.png",
        "../resources/interface/instructions3.png",
        "../resources/taskElements/blue.png",
        "../resources/taskElements/yellow.png",
        "../resources/taskElements/zones.png"
    ];
    var pointsAssets = [
        "../resources/taskElements/blue.png",
        "../resources/taskElements/bonusGlow.png",
        "../resources/taskElements/bonusGlowNew.png",
        "../resources/taskElements/bonusGlowReset.png",
        "../resources/taskElements/yellow.png",
        "../resources/taskElements/zones.png",
        "../resources/interface/Points_instructions2.png",
        "../resources/interface/Points_instructions4.png",
        "../resources/interface/Points_instructions3.png"
    ];

    var themeAssets = [
        "../resources/interface/themeDarkener.png",
        "../resources/interface/Theme_instructions2.png",
        "../resources/interface/Theme_instructions3.png",
        "../resources/interface/Theme_instructions4.png",
        "../resources/theme/themeMisc/overlayer.png",
        "../resources/interface/textspace.png",
        "../resources/theme/Packville.png",
        "../resources/theme/objects/BPackville.png",
        "../resources/theme/objects/YPackville.png"
    ];     
    if (condition === 0)
        allVariantAssets.push.apply(allVariantAssets, nongameAssets);
    if (condition === 1)
        allVariantAssets.push.apply(allVariantAssets, pointsAssets);
    if (condition === 2)
        allVariantAssets.push.apply(allVariantAssets, themeAssets);
    
    PIXI.loader.add(allVariantAssets).load(function()
        {});     
}

 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var totalLoopTime = 0;
var loopCounter = 0;

var totalLatencyTime = 0;
var timerCounter = 0;

var longFramesSinceStart = 0;

var globalTime = 0;

//This is the game loop

//This delta which comes in is effectively: how many times longer than the last frame is this frame (this is what you should multiple distances moved by etc)
//called at the end of one frame being displayed
Main.prototype.prepareNextFrame = function (speedfactor)
{                  
    delta = Math.round(this.app.ticker.elapsedMS);
    globalTime += delta;

    if (delta > 30)
        longFramesSinceStart++;
    
    totalLoopTime += delta;
    loopCounter++;

    Utils.checkAllTimers(delta);
    this.viewManager.currentView.mainLoop(speedfactor);
    this.viewManager.checkAllScreens();
}

function checkLag()
{
    console.log("Average LoopTime:", totalLoopTime / loopCounter);
    console.log("Percentage of Slow Frames:", longFramesSinceStart / loopCounter * 100);
    console.log("Average Timer Latency:", totalLatencyTime / timerCounter);
}

function timeFunction(name)
{
    if (this.start)
        console.log(name, performance.now() - this.start);
    this.start = performance.now();
}
