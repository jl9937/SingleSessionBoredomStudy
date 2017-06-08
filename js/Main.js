Main.DBURL = "https://mindgamesmkii.firebaseio.com";
Main.URL = "https://mindgamesmkii.firebaseapp.com";


Main.SCREEN_WIDTH = 1024;
Main.SCREEN_HEIGHT = 730;
Main.WORD_WRAP_WIDTH = 800;


Main.BASEPAY = 4;
Main.SESHPAY = 0.5;

Main.COMPLETION_LINK = "https://www.prolific.ac/submissions/592d4b16b97ad000017443f2/complete?cc=G6NBHMYI";

var fps = 70;
var now;
var then = Date.now();
var interval = 1000 / fps;
//60 fps gives average delta of 21 (great)
//30 fps gives average delta of 45
var delta;
var idealDelta = 21;

//debug switch
Main.isDebug = false;
var debug;

function Main()
{
    //if debugging is on: 
    if (Main.isDebug)
        debug = console.log.bind(window.console);
    else
        debug = function () { }
    
    // Initialize Renderer
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
    PIXI.settings.RESOLUTION = devicePixelRatio || 1;
    //this.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, { resolution: devicePixelRatio || 1, transparent: true });

    this.app = new PIXI.Application(window.innerWidth, window.innerHeight, { backgroundColor: 0x9ED0E9, resolution: devicePixelRatio || 1, transparent: true});
    document.body.appendChild(this.app.view);

    this.stage = this.app.stage;
    //this.stage = new PIXI.Container();

    //this.renderer = PIXI.autoDetectRenderer(Main.SCREEN_WIDTH, Main.SCREEN_HEIGHT, { view: document.getElementById("game-canvas") });
    //this.renderer.backgroundColor = 0x9ED0E9;

    var self =this;
    var resizeFunction = function ()
    {
        //self.app.renderer.resize(window.innerWidth, window.innerHeight);
        const scaleFactor = Math.min(
            window.innerWidth / Main.SCREEN_WIDTH,
            window.innerHeight / Main.SCREEN_HEIGHT
          );
        const newWidth = Math.ceil(Main.SCREEN_WIDTH * scaleFactor * 0.99);
        const newHeight = Math.ceil(Main.SCREEN_HEIGHT * scaleFactor  * 0.99);
  
        self.app.renderer.view.style.width = `${newWidth}px`;
        self.app.renderer.view.style.height = `${newHeight}px`;

        self.app.renderer.resize(newWidth, newHeight);
        self.stage.scale.set(scaleFactor); 
    }
    window.addEventListener("resize", resizeFunction);
    resizeFunction();


    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyACCRI2t52ESEl-CkFiKGY6dWSpzysJ_js",
        authDomain: "mindgamesmkii.firebaseapp.com",
        databaseURL: "https://mindgamesmkii.firebaseio.com",
        projectId: "mindgamesmkii",
        storageBucket: "mindgamesmkii.appspot.com",
        messagingSenderId: "561069159843"
    };
    firebase.initializeApp(config);

    // Initialize Database Interface
    this.db = new DBInterface();

    this.login();
};

Main.prototype.login = function ()
{
    //If URL contains an ID parameter, extract it.
    var urlid = getUrlVars(["prolific_pid", "id"]);
    urlid = urlid.prolific_pid || urlid.id;

    if (urlid)
    {
        var self = this;
        if (urlid.length !== 24)
        {
            alert("Are you sure you entered your Prolific ID correctly? It's not the correct length!\nPlease check the URL contains your full Prolific ID");
            window.location.href = Main.URL + "/index.html";
            return;
        }
        //Check whether user ID exists already
        DBInterface.logUserIn(urlid, function (id, condition)
        {
            firebase.auth().onAuthStateChanged(function(user)
            {
                if (user)
                {
                    //debug("User signed in, and Auth state changed");
                }
                else
                {
                    debug("User signed out");
                }
            });
                self.setupSession(id, condition);
        });
    }
    else
    {
        //the link had no ID var as a parameter and so the task cannot load.
        var instructions = new PIXI.Text("Error: Invalid link \n\nMake sure you entered the URL correctly. If the problem persists please contact jim.lumsden@bristol.ac.uk",
                                        { align: "center", font: "40px Arial", fill: "#ff0000", stroke: "#000000", strokeThickness: 2, wordWrap: true, wordWrapWidth: Main.WORD_WRAP_WIDTH });
        instructions.x = Main.SCREEN_WIDTH / 2;
        instructions.y = Main.SCREEN_HEIGHT / 2;
        instructions.anchor = new PIXI.Point(0.5, 0.5);
        this.stage.addChild(instructions);
        this.renderer.render(this.stage);
    }
}

Main.prototype.setupSession = function (id, condition)
{
    var self = this;
    DBInterface.getTodaysSessions(id, function (sessionData)
    {
        function cont()
        {
            //create Schedule
            self.visMonitor = new VisabilityMonitor(self.session, self);
            self.viewManager = new VMan(self.stage, self);
            buildTodaysScreens(self.session, self.viewManager);
            self.loadSprites(self.session.condition);
        }

        //If complete, then shut down continue button
        if (sessionData === -1)
            debug("Today's session has been completed already");
        else if ((sessionData === null || sessionData === undefined) && self.session === undefined)
        {
            self.session = new Session().initSession(id, condition, cont);
        }
        else
        {
            debug("Resuming previous session");
            self.session = new Session().initSessionFromData(sessionData, cont);
        }
    });
}

Main.prototype.loadSprites = function ()
{
    var allVariantAssets = [
        "../resources/interface/background.png",
        "../resources/interface/bottombar.png",
            "../resources/interface/textBackground.png"];
    PIXI.loader.add(allVariantAssets).load(this.spritesLoaded.bind(this));
};

Main.prototype.spritesLoaded = function ()
{
    this.viewManager.setScreen("LOGIN");

    //requestAnimationFrame(this.update.bind(this));
    this.app.ticker.add(this.update.bind(this));
    this.loadOtherSprites();
};

Main.prototype.loadOtherSprites = function ()
{
    var allVariantAssets = [
        "../resources/taskElements/fixation.png",


        "../resources/interface/logo.png",
        "../resources/interface/transparent.png"

       
    ];

    PIXI.loader.add(allVariantAssets).load();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//This is the game loop

Main.prototype.update = function(delta) {
    this.viewManager.currentView.mainLoop(delta);
    this.viewManager.checkAllScreens();
   // this.app.renderer.render(this.stage);
}



