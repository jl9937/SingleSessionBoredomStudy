InputElement.prototype = Object.create(PIXI.UI.Stage.prototype);


function InputElement(yPos, width, value, readonly)
{
    PIXI.UI.Stage.call(this, window.innerWidth, window.innerHeight);
    //var uiStage = new PIXI.UI.Stage(window.innerWidth, window.innerHeight);

    value = value || "";
    readonly = readonly || false;


    var solidBox = PIXI.Texture.fromImage("../resources/interface/textBackground.png");

    this.input = new PIXI.UI.TextInput({
        value: value,
        style: { fill: '#000000', fontSize: 15, fontFamily: 'Arial', align: 'center' },
        background: new PIXI.UI.Sprite(solidBox),
        width: width,
        height: 35,
        padding: 5,
        tabIndex: 1,
        multiLine: false,
        lineHeight: 27
    });

    //textInput.on("focusChanged", function (focus)
    //{
    //    textInput.background.alpha = focus ? 0.4 : 0.2;
    //});
    this.input.on("change", function ()
    {
        if (readonly)
            this.value = value;
    });

    this.input.x = Main.SCREEN_WIDTH / 2 - this.input.width / 2;
    this.input.y = yPos;

    
    this.minHeight = 315;
    this.minWidth = 500;

    var container = new PIXI.UI.Container();
    container.anchorBottom = container.anchorTop = container.anchorRight = container.anchorLeft = 10;
    container.minHeight = 285;
    container.addChild(this.input);

    this.addChild(container);
};

InputElement.prototype.getValue = function()
{
    return this.input.value;
}

InputElement.prototype.focus = function ()
{
    this.input.focus();
}
