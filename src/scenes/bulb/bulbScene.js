//
//NOTE-
//Floor 0 = top floor
//Bulb 0 = left bulb
//

var BulbScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.clicker;
  self.drawer;
  self.assetter;

  self.player;
  self.bulbs;
  self.janitors;

  self.floorHeight = 100;
  self.floorWidth = 100;
  self.houseOffX = 0;
  self.houseOffY = 0;
  self.numFloors = 5;
  self.bulbsPerFloor = 5;

  self.ready = function()
  {
    self.ticker = new Ticker();
    self.clicker = new Clicker();
    self.drawer = new Drawer(canv);
    self.assetter = new Assetter();

    self.player = new BU_Player(self, 0);

    self.bulbs = [];
    for(var i = 0; i < self.numFloors; i++)
      for(var j = 0; j < self.bulbsPerFloor; j++)
        self.bulbs.push(new BU_Bulb(self, i, j));

    self.janitors = [];
    self.janitors.push(new BU_Janitor(self, 0));
    self.janitors.push(new BU_Janitor(self, self.numFloors-1));

    for(var i = 0; i < self.bulbs.length; i++)
    {
      self.clicker.register(self.bulbs[i]);
      self.ticker.register(self.bulbs[i]);
      self.drawer.register(self.bulbs[i]);
    }
    for(var i = 0; i < self.janitors.length; i++)
    {
      self.ticker.register(self.janitors[i]);
      self.drawer.register(self.janitors[i]);
    }

    self.ticker.register(self.player);
    self.drawer.register(self.player);
  };

  self.tick = function()
  {
    self.clicker.flush();
    self.ticker.flush();
  };

  self.draw = function()
  {
    self.drawer.flush();
  };

  self.cleanup = function()
  {
  };


  self.spend = function()
  {

  }
};

//standardize grid positions, origin top left
var BU_Node = function(game)
{
  var self = this;

  //allow node re-use (per-frame allocs blow in js)
  self.configure = function(x,y)
  {
    self.n_x = x;
    self.n_y = y;

    self.x = game.houseOffX+(x*(game.floorWidth/game.bulbsPerFloor+1));
    self.y = game.houseOffY+(y*(game.floorHeight/game.numFloors+1));
    self.w = 0;
    self.h = 0;
  }
  self.configure(0,0);
}

var BU_Player = function(game, floor)
{
  //almost identical to janitor
  var self = this;

  var node = new BU_Node(game); //for re-use throughout lifetime

  self.floor = floor;
  self.w = 100;
  self.h = 100;
  node.configure(0,floor);
  self.x = node.x-(self.w/2);
  self.y = node.y-(self.h/2);
  self.goalFloor = floor;
  self.goalBulb = 0;
  self.img = game.assetter.asset("assets/man.png");

  self.tick = function()
  {
    if(self.floor != self.goalFloor)
    {
      node.configure(game.bulbsPerFloor,self.floor);
      if(self.x < node.x) self.x++;
      else (self.floor = self.goalFloor);
    }
    else
    {
      node.configure(game.bulbsPerFloor,self.floor);
      if(self.x < node.x) self.x++;
      else if(self.x > node.x) self.x--;
      else
      {
        //change the lightbulb or whatever
      }
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

var BU_Janitor = function(game, floor)
{
  var self = this;

  var node = new BU_Node(game); //for re-use throughout lifetime

  self.floor = floor;
  self.w = 100;
  self.h = 100;
  node.configure(0,floor);
  self.x = node.x-(self.w/2);
  self.y = node.y-(self.h/2);
  self.goalFloor = floor;
  self.goalBulb = 0;
  self.img = game.assetter.asset("assets/man.png");

  self.tick = function()
  {
    if(self.floor != self.goalFloor)
    {
      node.configure(game.bulbsPerFloor,self.floor);
      if(self.x < node.x) self.x++;
      else (self.floor = self.goalFloor);
    }
    else
    {
      node.configure(game.bulbsPerFloor,self.floor);
      if(self.x < node.x) self.x++;
      else if(self.x > node.x) self.x--;
      else
      {
        //change the lightbulb or whatever
      }
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }

}

var BU_Bulb = function(game, floor, bulb)
{
  var self = this;

  var node = new BU_Node(game); //for re-use throughout lifetime

  self.ticksPerTick = 1000;
  self.ticksTilTick = self.ticksPerTick;

  self.floor = floor;
  self.bulb = bulb;
  self.w = 20;
  self.h = 20;
  node.configure(bulb,floor);
  self.x = node.x-(self.w/2);
  self.y = node.y-(self.h/2);

  self.img = game.assetter.asset("assets/man.png");

  self.type = "NONE";
  self.dollarPer = 0.0;
  self.energyPer = 0.0;
  self.light = 0.0;
  self.energy = 100.0; //never run out

  self.setBulbType = function(type)
  {
    switch(type)
    {
      case "BAD":
        self.type = type;
        self.dollarPer = 0.25;
        self.energyPer = 0.25;
        self.light = 0.25;
        self.energy = 100.0;
        self.img = game.assetter.asset("assets/man.png");
        break;
      case "BURNT_BAD":
        self.type = type;
        self.dollarPer = 0.0;
        self.energyPer = 0.0;
        self.light = 0.0;
        self.energy = 100.0;
        self.img = game.assetter.asset("assets/man.png");
        break;
      case "GOOD":
        self.type = type;
        self.dollarPer = 0.15;
        self.energyPer = 0.15;
        self.light = 0.35;
        self.energy = 100.0;
        self.img = game.assetter.asset("assets/man.png");
        break;
      case "BURNT_GOOD":
        self.type = type;
        self.dollarPer = 0.0;
        self.energyPer = 0.0;
        self.light = 0.0;
        self.energy = 100.0;
        self.img = game.assetter.asset("assets/man.png");
        break;
      case "NONE":
      default:
        self.type = type;
        self.dollarPer = 0.0;
        self.energyPer = 0.0;
        self.light = 0.0;
        self.energy = 100.0;
        self.img = game.assetter.asset("assets/man.png");
        break;
    }
  }

  self.click = function()
  {
    game.player.bulbClicked(self.floor,self.bulb);
  }

  self.tick = function()
  {
    self.ticksTilTick--;
    if(self.ticksTilTick <= 0)
    {
      self.ticksTilTick = self.ticksPerTick;
      self.energy -= self.energyPer;
      game.spend(self.dollarPer);
      if(self.energy <= 0) self.setType("BURNT_"+self.type);
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

