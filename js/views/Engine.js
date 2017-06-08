Engine.LOWITI = 1500;
Engine.HIGHITI = 2500;
Engine.STIMULI_DUR = 150;
Engine.MASK_DUR = 250;
Engine.FEEDBACK_DUR = 1000;

//todo Set debug mode here
Engine.TRIALLIMIT = 1000;


/////////////////////////////////////Required////////////////////////////////////////
Engine.prototype = Object.create(View.prototype);
function Engine(nextpage)
{
    View.call(this);
    this.nextScreenToGoTo = nextpage;
}

Engine.prototype.create = function(stage, db, session)
{
    this.createBasic(stage, db, session);
    this.setup();
}
/////////////////////////////////////////////////////////////////////////////////

Engine.prototype.setup = function ()
{
    this.createBackground();
    this.createBlock(this.session.getEmotionTaskInitialBlock());
}

Engine.prototype.createBlock = function(blocktype)
{
    this.cbloc = new Block(this.session, blocktype);
    this.session.setCurrentBlock(this.cbloc);
    this.runBlock();
}

Engine.prototype.runBlock = function()
{
    if (this.cbloc.getCurrentTrialNumber() < Engine.TRIALLIMIT && this.cbloc.isComplete() !== true)
        this.startTrial(this.cbloc.getNextTrial());
    else
    {
        this.cbloc.endOfBlock();
        if (this.cbloc.getBlocktype() === Block.TEST)
        {
            //todo this shouldn't be here!
            //this.session.setCurrentSessionElementComplete();
            this.moveToScreen = this.nextScreenToGoTo;
        }
        this.session.saveToDB();
        if (this.cbloc.getBlocktype() !== Block.TEST)
            this.displayBreak();
    }
}

Engine.prototype.startTrial = function (trial)
{
    //run the trial as a series of timed callbacks
    this.showForTimeThenCallback("../resources/interface/fixation.png", trial.getFixationDuration(), //fixation
        this.showForTimeThenCallback.bind(this, trial.getStimulusPath(), Engine.STIMULI_DUR, //stimuli
            this.showForTimeThenCallback.bind(this, "../resources/interface/mask.png", Engine.MASK_DUR, //mask
                this.showChoices.bind(this, trial)))); //choices
}

//Create the "Happy" / "Sad" choices on the post-mask screen.
Engine.prototype.showChoices = function (trial)
{
    var self = this;
    //Randomise positions of the two buttons
    var positionSwitch = Math.round(Math.random());
    var happyPos = (Main.SCREEN_HEIGHT / 2 - 60);
    var sadPos = (Main.SCREEN_HEIGHT / 2 + 60);
    if (positionSwitch === 0)
    {
        happyPos = (Main.SCREEN_HEIGHT / 2 + 60);
        sadPos = (Main.SCREEN_HEIGHT / 2 - 60);
    }
    
    var happyButton = new ClickButton(happyPos, "Happy", function ()
    {
        trial.submitResponse(Trial.HAPPY);
        self.choiceMade(trial);
        
    });
    var sadButton = new ClickButton(sadPos, "Sad", function ()
    {
        trial.submitResponse(Trial.SAD);
        self.choiceMade(trial);
    });
        
    
    this.addChild(happyButton);
    this.addChild(sadButton);
    //start timing RT here
    trial.startTiming();
}

Engine.prototype.choiceMade = function (trial)
{
    //remove the choice buttons
    this.removeChildren(this.children.length - 2, this.children.length);
    if (this.cbloc.getBlocktype() !== Block.TRAINING)
        this.showForTimeThenCallback("../resources/interface/transparent.png", 10, this.runBlock.bind(this));
    else
    {
        this.showForTimeThenCallback(trial.getCategorisationPicture(), Engine.FEEDBACK_DUR, null, -100);
        this.showForTimeThenCallback(trial.getFeedbackPicture(), Engine.FEEDBACK_DUR, this.runBlock.bind(this));
    }
}

Engine.prototype.displayBreak = function ()
{
    var breakText = new PIXI.Text(this.cbloc.getBreakText(), { align: "center", font: "bold 30px Arial", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: Main.WORD_WRAP_WIDTH  });
    breakText.anchor = new PIXI.Point(0.5, 0.5);
    breakText.x = Main.SCREEN_WIDTH / 2;
    breakText.y = Main.SCREEN_HEIGHT / 2;

    var self = this;
    var nextButton = new ClickButton(800, "Continue", function ()
    {
        self.removeChild(breakText);
        self.removeChild(nextButton);
        self.createBlock(self.session.getNextBlock());
    });
    
    this.addChild(nextButton);
    this.addChild(breakText);
}

//////////////////////////////////////////////////Generic Display Functions/////////////////////////////////////////////////
Engine.prototype.showForTimeThenCallback = function (picture, time, callback, _yadjustment)
{
    var yadjustment = _yadjustment | 0;
    var sprite = new PIXI.Sprite.fromImage(picture);
    sprite.anchor = new PIXI.Point(0.5, 0.5);
    sprite.y = Main.SCREEN_HEIGHT / 2 + yadjustment;
    sprite.x = Main.SCREEN_WIDTH / 2;
    sprite.vx = 0;

  this.addChild(sprite);
    doTimer(time, this.clearPicture.bind(this, sprite, callback));

   return sprite;
}

Engine.prototype.clearPicture = function (sprite, callback)
{
    this.removeChild(sprite);
    typeof callback == "function" ? callback() : true;
}

Engine.prototype.showTextForTimeThenClear = function (text, time, yPos)
{
    var textObject = new PIXI.Text(text, { align: "center", font: "bold 30px Arial", fill: "#FFFFFF" });
    textObject.anchor = new PIXI.Point(0.5, 0.5);
    textObject.x = Main.SCREEN_WIDTH / 2;
    textObject.y = yPos;
    this.addChild(textObject);
    var outer = this;
    doTimer(time, function () { outer.removeChild(textObject) });
}