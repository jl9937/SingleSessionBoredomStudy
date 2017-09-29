ClickButton.prototype = Object.create(PIXI.Graphics.prototype);

//Generic big horizontal button that changes colour on click.
//You can input the vertical postion, it's text, and what happens when you click it.
ClickButton.DEFAULTWIDTH = 300;
ClickButton.DEFAULTHEIGHT = 100;
ClickButton.DEFAULTRAD = 20;
ClickButton.DEFAULT_UP_COLOUR = 0xd9d9d9;


function ClickButton(text, callback, options) {
    PIXI.Graphics.call(this);
    this.state = 0;

    options = options || {};
    var yPos = options.yPos || Main.SCREEN_HEIGHT - 150;
    var xPos = options.xPos || Main.SCREEN_WIDTH / 2;
    var scale = options.scale || 1;
    var textsize = options.textSize || 35;
    textsize *= scale;
    
    this.widthVal = scale * ClickButton.DEFAULTWIDTH;
    this.heightVal = scale * ClickButton.DEFAULTHEIGHT;
    this.radVal = scale * ClickButton.DEFAULTRAD;
    this.up_colour = options.up_colour || ClickButton.DEFAULT_UP_COLOUR;
    this.down_colour = options.down_colour || colorLuminance(this.up_colour, 0.585253456);
    
    this.yposVal = yPos - (this.heightVal / 2);
    this.xposVal = xPos - (this.widthVal / 2);

    this.lineStyle(3, 0x000000);

    this.buttonUp();

    this.hitArea = new PIXI.Rectangle(this.xposVal, this.yposVal, this.widthVal, this.heightVal);
    this.interactive = true;
    this.touchstart = this.mousedown = this.buttonDown.bind(this);
    this.mouseupoutside = this.touchendoutside = this.buttonUp.bind(this);
    this.touchend = this.mouseup = this.buttonUp.bind(this, callback);
    
    var buttonText = new PIXI.Text(text, { fontFamily: "Arial", fontSize: textsize });
    buttonText.x = this.xposVal + Math.round(0.5 * (this.widthVal - buttonText.width), 0);
    buttonText.y = this.yposVal + Math.round(0.5 * (this.heightVal - buttonText.height), 0);
    this.addChild(buttonText);
}


ClickButton.prototype.disable =function()
{
    this.interactive = false;
    this.buttonDown();
}

ClickButton.prototype.enable = function ()
{
    this.interactive = true;
    this.buttonUp();
}

ClickButton.prototype.buttonDown = function ()
{
    
    if (this.state === 1)
    {
        //debug("button down");
        this.beginFill(this.down_colour);
        this.drawRoundedRect(this.xposVal, this.yposVal, this.widthVal, this.heightVal, this.radVal);
        this.state = 0;
    }
}

ClickButton.prototype.buttonUp = function (callback)
{
    if (this.state === 0)
    {
        //debug("button up");
        this.beginFill(this.up_colour);
        this.state = 1;
        this.drawRoundedRect(this.xposVal, this.yposVal, this.widthVal, this.heightVal, this.radVal);
        if (typeof (callback) == "function")
            callback();
    }
}