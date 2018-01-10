function Staircase(_startingSSD)
{
    this.startingSSD = _startingSSD;
    this.SSD = this.startingSSD;
    this.step = 50;
    this.reversals = 0;
    this.direction = 0;
}

Staircase.prototype.getSSD = function ()
{
    return this.SSD;
}
          
Staircase.prototype.adjust = function (stepUp)
{ 
    //Determine if there's been a change in direction
    var newDirection = (stepUp===true) ? 1 : -1;

    if (newDirection !== this.direction)
    {
        this.reversals += 1;
        
        if (this.reversals > 5)
            this.step = 12;
        else if (this.reversals > 3)
            this.step = 25;

        this.direction = newDirection;
    }

    if (stepUp)
        this.SSD += this.step;   
    else 
        this.SSD -= this.step;         
   
    //Set the staircase to within bounds
    if (this.SSD <= 25)
        this.SSD = 25;   
    if (this.SSD > 750)
        this.SSD = 750;        
}