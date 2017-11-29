function Staircase(_startingSSD)
{
    this.startingSSD = _startingSSD;
    this.SSD = this.startingSSD;
    this.previousTrialCorrect = undefined;
    this.step = 50;
    this.reversals = 0;
    this.direction = 0;
}

Staircase.prototype.getSSD = function ()
{
    return this.SSD;
}


Staircase.prototype.adjust = function(currentTrialCorrect)
{
    var stepUp = undefined;
    var newDirection = undefined;

    //Determine staircase type and whether it should move up or down   
    if (currentTrialCorrect)
        stepUp = true;
    else
        stepUp = false;
    
      
    //Determine if there's been a change in direction
    if (stepUp)
    {
        this.SSD = this.SSD + this.step;
        newDirection = 1;
    }
    else
    {
        this.SSD = this.SSD - this.step;
        newDirection = -1;
    }
    //If there has, record it and maybe act on it 
    if (newDirection !== this.direction)
    {
        debug("Staircase reversal");
        this.reversals = this.reversals + 1;
        this.direction = newDirection;
        if (this.reversals > 2)
        {
           debug("Step size changed");
            this.step = 25;
        }
    }

    //Set the staircase to within bounds
    if (this.SSD <= 0)
    {
        this.reversals = this.reversals + 1;
        this.SSD = 25;
    }
    if (this.SSD > 750)
        this.SSD = 750;

    this.previousTrialCorrect = currentTrialCorrect;
}