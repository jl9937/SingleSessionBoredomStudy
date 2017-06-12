var fps = 20;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;

function introductionScreen()
{
    var self = this;
    this.stage = new PIXI.Container();
    PIXI.loader.add("../resources/interface/background.png").load( function ()
    {
        self.renderer = PIXI.autoDetectRenderer(Main.SCREEN_WIDTH, Main.SCREEN_HEIGHT, { view: document.getElementById("game-canvas") });
        self.renderer.backgroundColor = 0x9ED0E9;
        self.createScreen();
    });
   
};

introductionScreen.prototype.createScreen = function ()
{
    var self = this;


    var text1 = new PIXI.Text("Welcome to the Bristol Emotion Recognition Task",
        { align: "center", font: "28px Arial", fill: "#000000" });
    var text2 = new PIXI.Text("Thanks for signing up to take part in our experiment!\nIf you have any questions feel free to contact jim.lumsden@bristol.ac.uk\n\nPlease enter your Prolific ID:",
        { align: "center", font: "21px Arial", fill: "#000000", wordWrap: true, wordWrapWidth: Main.WORD_WRAP_WIDTH });
    var linkExplanation = new PIXI.Text("The link below is your UNIQUE link to the study, please make a note of it. If you forget the link for any reason, simply come back to this page through Prolific Academic and re-enter your Prolific ID",
        { align: "center", font: "21px Arial", fill: "#000000", wordWrap: true, wordWrapWidth: Main.WORD_WRAP_WIDTH });
  
    var whenReady = new PIXI.Text("When you are ready, click the button below to begin the study proper!", { align: "center", font: "21px Arial", fill: "#000000", wordWrap: true, wordWrapWidth: Main.WORD_WRAP_WIDTH });


    var options = { text: { font: "20px Arial" }, valign: "middle", maxlength: 24, borderRadius: 0, borderWidth: 2, backgroundColor: "#d9d9d9", padding: 10, type: "text", width: 450 }
   
    this.IDinput = new PIXI.Input(options, 1);
    this.IDinput.x = Main.SCREEN_WIDTH / 2 - this.IDinput.width /2;
    
    var options2 = { text: { font: "15px Arial" }, valign: "middle", borderRadius: 0, borderWidth: 2, backgroundColor: "#d9d9d9", readonly: true, padding: 10, width: 600 }
    this.link = new PIXI.Input(options2, 1);
    
    text1.x = Math.round(Main.SCREEN_WIDTH / 2, 0) - Math.round(text1.width / 2, 0);
    text1.y = 60;

    text2.x = Math.round(Main.SCREEN_WIDTH / 2, 0) - Math.round(text2.width / 2, 0);
    text2.y = 150;

    this.IDinput.y = 290;
    
    linkExplanation.x = Math.round(Main.SCREEN_WIDTH / 2, 0) - Math.round(linkExplanation.width / 2, 0);
    linkExplanation.y = 470;

    whenReady.x = Math.round(Main.SCREEN_WIDTH / 2, 0) - Math.round(whenReady.width / 2, 0);
    whenReady.y = 690;

    this.link.x = Main.SCREEN_WIDTH / 2 - this.link.width / 2;
    this.link.y = 560;
    
    var copytoclipboard = new ClickButton(670, "Copy link", function ()
    {
        var dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.style.display = 'hidden';
        dummy.setAttribute("id", "dummy_id");
        document.getElementById("dummy_id").value = self.link.value;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
    }, 0, 0.36);

    var historyButton = new ClickButton(820, "Begin", function ()
    {
        window.location.href = self.link.value;
    });

    var background = new PIXI.Sprite.fromImage("../resources/interface/background.png");
    this.stage.addChild(background);

    this.stage.addChild(text1);
    this.stage.addChild(text2);
    this.stage.addChild(linkExplanation);
    this.stage.addChild(this.IDinput);
    this.stage.addChild(this.link);
    this.stage.addChild(whenReady);
    this.stage.addChild(historyButton);
    this.stage.addChild(copytoclipboard);

    requestAnimationFrame(this.update.bind(this));
}

 //This is the game loop
introductionScreen.prototype.update = function ()
{
    requestAnimationFrame(this.update.bind(this));

    now = Date.now();
    delta = now - then;
    if (delta > interval)
    {
        then = now - (delta % interval);

        if (this.IDinput.value !== "")
        {
            if(this.IDinput.value.length === 24)
                this.link.value = Main.URL + "/task.html?prolific_pid=" + this.IDinput.value;
        }

        this.renderer.render(this.stage);
    }
};