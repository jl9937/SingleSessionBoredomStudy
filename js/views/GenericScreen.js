﻿GenericScreen.prototype = Object.create(View.prototype);

//Generic Display Screen: takes a json and generates a screen out of it:
/*
options:
background
picture1
picture2
text
textFilepath

buttonText
nextScreenToGoTo
buttonYPos

buttonXPos
buttonScale
*/

function GenericScreen(_condition, _options)
{
    this.options = _options;
    this.condition = _condition;

    View.call(this);
}

GenericScreen.prototype.setNextScreen = function (_defaultNextScreen)
{
    this.options.nextScreenToGoTo = _defaultNextScreen;
}

GenericScreen.prototype.create = function(stage, db, session)
{
    this.createBasic(stage, db, session);

    //create pictures
    if (this.options.background)
        this.createMainImage(this.options.background);
    if (this.options.picture1)
        this.createMainImage(this.options.picture1);
    if (this.options.picture2)
        this.createMainImage(this.options.picture2);

    //create button
    if (this.options.buttonText)
        this.addChild(new ClickButton(this.options.buttonText,
            this.buttonClicked.bind(this, this.options.nextScreenToGoTo),
            { "yPos": this.options.buttonYPos, "xPos": this.options.buttonXPos, "scale": this.options.buttonScale }));

    //create text
    if (this.options.textFilepath)
        this.loadandDisplayFileText();
    else if (this.options.text)
        this.createScreenText(this.options.text);
}


GenericScreen.prototype.buttonClicked = function (nextScreenToGoTo)
{
    if (this.options.special)
    {
        this.session.setCurrentSessionElementComplete();
        if (!Main.sessionSubmitted)   
            window.open(this.options.special);
        else
            window.open("https://www.prolific.ac/studies");
        focus();
    }
    this.moveToScreen = nextScreenToGoTo;
}



GenericScreen.prototype.loadandDisplayFileText = function()
{
    var self = this;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
        if (xhttp.readyState === 4 && xhttp.status === 200)
            self.createScreenText(xhttp.responseText);
    };
    xhttp.open("GET", this.options.textFilepath, true);
    xhttp.send();
}


GenericScreen.prototype.createScreenText = function (text)
{
    var instructions = new PIXI.Text(text, { align: "center", font: "28px Arial", fill: "#FFFFFF", wordWrapWidth: Main.WORD_WRAP_WIDTH , wordWrap: true });
    instructions.anchor = new PIXI.Point(0.5, 0.5);
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = Main.SCREEN_HEIGHT / 2 - 50;
    this.addChild(instructions);
}

GenericScreen.prototype.createMainImage = function(imagepath)
{
    var mainimage = new PIXI.Sprite.fromImage(imagepath);
    mainimage.height = 730;
    mainimage.width = 1024;
    this.addChild(mainimage);
}

