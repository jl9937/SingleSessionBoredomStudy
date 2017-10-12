

ThemeHolder.locationData = [
    {
        levelname: "Packville",
        background: "../resources/theme/Packville.png",
        bluePath: "../resources/theme/objects/BPackville.png",
        yellowPath: "../resources/theme/objects/YPackville.png",
        screenTextPath: "../resources/theme/screenText/Packville.txt",
        yCutOff: 230,
        xVelocity: 12.5,
        yAdjustment: 10
    },
    {
        levelname: "Paris",
        background: "../resources/theme/Paris.png",
        bluePath: "../resources/theme/objects/BParis.png",
        yellowPath: "../resources/theme/objects/YParis.png",
        screenTextPath: "../resources/theme/screenText/Paris.txt",
        yCutOff: 310,
        xVelocity: 13,
        yAdjustment: -30
    },
    {
        levelname: "London",
        background: "../resources/theme/GBDocks.png",
        bluePath: "../resources/theme/objects/BGBDocks.png",
        yellowPath: "../resources/theme/objects/YGBDocks.png",
        screenTextPath: "../resources/theme/screenText/GBDocks.txt",
        yCutOff: 240,
        xVelocity: 12.5,
        yAdjustment: 5
    },
    {
        levelname: "Moscow",
        background: "../resources/theme/Russia.png",
        bluePath: "../resources/theme/objects/BRussia.png",
        yellowPath: "../resources/theme/objects/YRussia.png",
        screenTextPath: "../resources/theme/screenText/Russia.txt",
        yCutOff: 290,
        xVelocity: 12.5,
        yAdjustment: -35
    },{
        levelname: "The Alps",
        background: "../resources/theme/Alps.png",
        bluePath: "../resources/theme/objects/BAlps.png",
        yellowPath: "../resources/theme/objects/YAlps.png",
        screenTextPath: "../resources/theme/screenText/Alps.txt",
        yCutOff: 310,
        xVelocity: 14.5,
        yAdjustment: 10
    },
    {
        levelname: "Hawaii",
        background: "../resources/theme/Hawaii.png",
        bluePath: "../resources/theme/objects/BHawaii.png",
        yellowPath: "../resources/theme/objects/YHawaii.png",
        screenTextPath: "../resources/theme/screenText/Hawaii.txt",
        yCutOff: 330,
        xVelocity: 13.5,
        yAdjustment: -10
    },{
        levelname: "Morocco",
        background: "../resources/theme/Morocco.png",
        bluePath: "../resources/theme/objects/BMorocco.png",
        yellowPath: "../resources/theme/objects/YMorocco.png",
        screenTextPath: "../resources/theme/screenText/Morocco.txt",
        yCutOff: 310,
        xVelocity: 14,
        yAdjustment: 0
    },
    {
        levelname: "Nepal",
        background: "../resources/theme/Nepal.png",
        bluePath: "../resources/theme/objects/BNepal.png",
        yellowPath: "../resources/theme/objects/YNepal.png",
        screenTextPath: "../resources/theme/screenText/Nepal.txt",
        yCutOff: 315,
        xVelocity: 13,
        yAdjustment: -16
    },{
        levelname: "Tokyo",
        background: "../resources/theme/Tokyo.png",
        bluePath: "../resources/theme/objects/BTokyo.png",
        yellowPath: "../resources/theme/objects/YTokyo.png",
        screenTextPath: "../resources/theme/screenText/Tokyo.txt",
        yCutOff: 330,
        xVelocity: 13.5,
        yAdjustment: -10
    },
    {
        levelname: "Outer Space",
        background: "../resources/theme/ISS.png",
        bluePath: "../resources/theme/objects/BISS.png",
        yellowPath: "../resources/theme/objects/YISS.png",
        screenTextPath: "../resources/theme/screenText/ISS.txt",
        yCutOff: 350,
        xVelocity: 13.3,
        yAdjustment: 0
    }
];


function ThemeHolder()
{
    this.levelChoices = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.data = ThemeHolder.locationData[0];
}

ThemeHolder.prototype.loadScreentext = function(callback)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
        if (xhttp.readyState === 4 && xhttp.status === 200)
            callback(xhttp.responseText);
    };
    xhttp.open("GET", this.data.screenTextPath, true);
    xhttp.send();
}

ThemeHolder.prototype.getNextLevelChoice = function()
{
    return this.levelChoices.shift();
}

ThemeHolder.prototype.getLevelname = function (locationIndex)
{
    return ThemeHolder.locationData[locationIndex].levelname;
}


ThemeHolder.prototype.setLevelChoice = function(newlocationIndex, unchosenLocationIndex, callback)
{
    var self = this;
    if (unchosenLocationIndex)
        this.levelChoices.push(unchosenLocationIndex);

    this.data = ThemeHolder.locationData[newlocationIndex];

    this.loadScreentext(function(_screenText)
    {
        self.data.screenText = _screenText;
        var loader = [self.data.background, self.data.bluePath, self.data.yellowPath];
        PIXI.loader.add(loader).load(
            function()
            {
                if (typeof callback === "function")
                    callback();
            });
    });
}