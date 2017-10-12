Likert.prototype = Object.create(PIXI.Graphics.prototype);

function Likert(lowText, middleText,  highText, _callbackOnValueSet)
{
    PIXI.Graphics.call(this);

    this.mark = -1;
    this.divisions = 7;

    this.yLowerBound = Main.SCREEN_HEIGHT/2 - 200;
    this.yHeight = 400;
    this.xLowerBound = Main.SCREEN_WIDTH / 2 - 250 ;
    this.xWidth = 500 ;
    this.lineY = Main.SCREEN_HEIGHT / 2 - 2;
    this.lineThickness = 2;

    this.setupXCoords();

    this.lineStyle(2, 0x000000);
    this.beginFill(ClickButton.DOWN_COLOUR);
    this.drawRect(this.xLowerBound, this.lineY, this.xWidth, this.lineThickness);

    this.callbackOnValueSet = _callbackOnValueSet;

    this.hitArea = new PIXI.Rectangle(this.xLowerBound-100, this.yLowerBound, this.xWidth+200, this.yHeight);
    this.interactive = true;
    var self = this;
    this.holding = false;
    this.touchstart = this.mousedown = function(e) { self.clickDown(e); };
    this.touchend = this.mouseup = this.mouseout = function(e) { self.clickUp(e); };
    this.touchmove = this.mousemove = function (e) { self.drag(e); };


    for (var i = 0; i < this.divisions; i++)
    {
        if (i === 0)
            this.addDivision(i, lowText);
        else if (i === this.divisions - 1)
            this.addDivision(i, highText);
        else if (i === (this.divisions-1)/2)
            this.addDivision(i, middleText);
        else
            this.addDivision(i);         
    }

    this.markerGraphic = new PIXI.Graphics();
    this.addChild(this.markerGraphic);
}

Likert.prototype.setupXCoords = function()
{
    var increment = this.xWidth / (this.divisions-1);
    this.xCoords = [];
    for (var i = 0; i < 7; i++)
        this.xCoords[i] = this.xLowerBound + increment * i;     
}

Likert.prototype.getXcoord = function (position)
{
    return this.xCoords[position];
}

Likert.prototype.conPosToX = function (pos)
{
    return this.xCoords[pos];
}           

Likert.prototype.conXtoPos = function (x) {
    x = x < this.xLowerBound ? this.xLowerBound : x;
    x = x > (this.xLowerBound + this.xWidth) ? (this.xLowerBound + this.xWidth) : x;

    var high;
    for (high = 0; high < this.divisions; high++)
        if (this.xCoords[high] > x)
            break;
    if (high === 7)
        high = 6;

    var lowDiff = Math.abs(this.xCoords[high - 1] - x);
    var highDiff = Math.abs(this.xCoords[high] - x);
    if (lowDiff < highDiff)
        return high - 1;
    else
        return high;
}

Likert.prototype.addDivision = function(position, _text)
{
    var height = 16;
    this.drawRect(this.getXcoord(position), this.lineY - (height - this.lineThickness) / 2, this.lineThickness, height);
    if (_text)
    {
        var textShape = new PIXI.Text(_text, { font: "16px Arial", fill: "#FFFFFF" });
        textShape.anchor = new PIXI.Point(0.5, 0.5);
        textShape.x = this.getXcoord(position);
        textShape.y = this.lineY - height - 8;
        this.addChild(textShape);
    }
}

Likert.prototype.placeMarker = function(x)
{
    this.markerGraphic.clear();
    this.markerGraphic.lineStyle(2, 0x000000);
    this.markerGraphic.beginFill(0xffc000);

    this.mark = this.conXtoPos(x) + 1;
    x = this.conPosToX(this.mark-1);

    this.markerGraphic.drawCircle(x, this.lineY + 2.5, 10);      
    this.callbackOnValueSet();
}

Likert.prototype.clickDown = function(mouseData)
{
    this.holding = true;
    this.placeMarker(mouseData.data.getLocalPosition(this).x);
}

Likert.prototype.clickUp = function (mouseData)
{
    this.holding = false;
}

Likert.prototype.drag = function(mouseData)
{
    if(this.holding === true)
        this.placeMarker(mouseData.data.getLocalPosition(this).x);
}

function round(value, exp)
{
    if (typeof exp === 'undefined' || +exp === 0)
        return Math.round(value);

    value = +value;
    exp = +exp;

    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
        return NaN;

    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}