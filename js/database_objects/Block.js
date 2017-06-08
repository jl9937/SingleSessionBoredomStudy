Block.BASELINE = 0;
Block.TRAINING = 1;
Block.TEST = 2;


//Block object. Holds all data on a block as it happens, and handles block cleanup
function Block(_session, _blocktype)
{
    this.blocktype = _blocktype;
    this.session = _session;
    this.dateTime = Date.now().toString("dd-MM-yyyy HH:mm:ss");

    this.trials = []; //as the block goes on, this array grows as trials as added to it
    this.stimuli = this.getStimuliNumsForBlock(); //and this array shrinks

    if (this.blocktype === Block.TRAINING)
    {
        this.balancePoint = this.session.getBaselineBP();
        if (this.session.getCondition() === Session.CONDITION_REAL)
            this.balancePoint += 2;
    }
    else
        this.balancePoint = "N/A";

    this.averageHappyAccuracy ="N/A" ;
    this.averageSadAccuracy ="N/A";
    this.medianResponseTime = "N/A";

}

Block.prototype.print = function ()
{
    var blocktype = "";
    var condition = "";
    if (this.session.getCondition() === Session.CONDITION_REAL)
        condition = "Real";
    else
        condition = "Sham";

    switch (this.blocktype)
    {
        case Block.BASELINE:
            blocktype = "Baseline";
            break;
        case Block.TRAINING:
            blocktype = "Training";
            break;
        case Block.TEST:
            blocktype = "Test";
            break;
    };
    if (this.blocktype !== Block.TRAINING)
        debug(blocktype + " block ended. " + "BP:" + this.calculateBalancePoint(), condition + " training");
    else
        debug(condition, blocktype + " block ended. Sad acc:" + this.averageSadAccuracy + " Happy acc:" + this.averageHappyAccuracy + " Med RT:"+ this.medianResponseTime);
}

/////////////Run Block////////////
Block.prototype.getCurrentTrialNumber = function()
{
    return this.trials.length+1;
}

Block.prototype.getNextTrial = function()
{
    var nextTrial = new Trial(this.session, this.trials.length + 1, this, this.stimuli.shift());
    this.trials.push(nextTrial);
    return nextTrial;
}

Block.prototype.isComplete = function()
{
    if (this.blocktype === Block.TRAINING && this.trials.length >= 31)
        return true;
    else if (this.trials.length >= 45)
        return true;
    return false;
}

Block.prototype.getBlocktype = function()
{
    return this.blocktype;
}

Block.prototype.getBlocktypeString = function()
{
    switch (this.blocktype)
    {
        case 0:
            return "BASELINE";
        case 1:
            return "TRAINING";
        case 2:
            return "TEST";
    }
}

/////////////Create Block////////////
Block.prototype.getStimuliNumsForBlock = function()
{
    //45 trials. Each face shown 3 times.
    var stimuliArray = [];
    if (this.blocktype === Block.TEST || this.blocktype === Block.BASELINE)
    {
        for (var i = 0; i < 3; i++)
            for (var j = 0; j < 15; j++)
                stimuliArray[i * 15 + j] = j+1;
    }
    //31 trials. Ambiguous faces shown more often
    else if (this.blocktype === Block.TRAINING)
    {
        for (var i = 0; i < 1; i++)
            stimuliArray.push(1, 2, 14, 15);
        for (var i = 0 ; i < 2; i++)
            stimuliArray.push(3, 4, 5, 11, 12, 13);
        for (var i = 0; i < 3; i++)
            stimuliArray.push(6, 7, 8, 9, 10);
    }

    shuffleArray(stimuliArray);
    while (checkForConsecutiveDuplicates(stimuliArray)) //this seems like a rubbish way to do this    
        shuffleArray(stimuliArray);

    return stimuliArray;
}

/////////////End of Block////////////
Block.prototype.getBreakText =function()
{
    switch (this.getBlocktype())
    {
        case Block.BASELINE:
            return "1/3 blocks completed\n\nThe next block is very similar, except that you will be told whether you responded correctly or not.\n\nPlease continue to answer as quickly as you can\n\nClick below to continue";
        case Block.TRAINING:
            return "2/3 blocks completed\n\nPlease continue to answer as quickly as you can\n\nClick below to continue";
    }
}


Block.prototype.endOfBlock = function ()
{
    //Calculate the balance point for the block
    if(this.blocktype === Block.BASELINE || this.blocktype === Block.TEST)
        this.balancePoint = this.calculateBalancePoint();

    //Calculate the median response time
    var allRTs = [];
    for(var j =0; j<this.trials.length; j++)
        allRTs.push(this.trials[j].responseTime);
    allRTs.sort();
    this.medianResponseTime = allRTs[Math.floor(allRTs.length / 2)];

    //If this was the training block, calculate happy and sad accuracy statistics
    if (this.blocktype === Block.TRAINING)
    {
        var sadViewCount = 0, sadCorrectCount = 0, happyViewCount = 0, happyCorrectCount = 0;

        for (var p =0; p<this.trials.length; p++)
        {
            if(this.trials[p].getResponse() === Trial.SAD)
            {
                if (this.trials[p].getCorrect() === true)
                {
                    sadCorrectCount++;
                    sadViewCount++;
                } else
                    happyViewCount++;
            }
            else
            {
                if (this.trials[p].getCorrect() === true)
                {
                    happyCorrectCount++;
                    happyViewCount++;
                } else
                    sadViewCount++;
            }            
        }
        this.averageHappyAccuracy = happyCorrectCount/happyViewCount;
        this.averageSadAccuracy = sadCorrectCount/sadViewCount;
    }
    this.saveToDB();
}

Block.prototype.saveToDB = function()
{
    this.print();
    // also save to DB;
}

Block.prototype.calculateBalancePoint = function()
{
    if (this.balancePoint === "N/A")
    {
        if (this.trials.length !== 45)
            return -1;
        else
        {
            var happyCount = 0;
            for(var p =0; p<this.trials.length;p++)
            {
                if (this.trials[p].response === Trial.HAPPY)
                {
                    happyCount++;
                }
            }
            var balancePoint = Math.round((happyCount / 45) * 15);
            return balancePoint;
        }
    }
    else
        return this.balancePoint;
}
