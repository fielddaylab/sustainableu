var SweaterScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.ticker;
  self.clicker;
  self.presser;
  self.drawer;
  self.particler;
  self.assetter;

  self.house;
  self.player;
  self.thermostat;
  self.buttons;
  self.enemies;
  self.sweaters;

  self.enemyFactory;
  self.sweaterFactory;

  self.sweatersThrown  = [];
  self.enemiesAttacked = [];
  self.enemiesDefeated = [];
  self.enemiesWon      = [];

  self.ready = function()
  {
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.presser = new Presser({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.particler = new Particler({});
    self.assetter = new Assetter({});

    self.house = new SW_House(self);
    self.player = new SW_Player(self);
    self.thermostat = new SW_Thermostat(self);
    self.buttons = [];
    self.enemies = [];
    self.sweaters = [];

    self.enemyFactory = new SW_EnemyFactory(self);
    self.sweaterFactory = new SW_SweaterFactory(self);

    for(var i = 0; i < self.house.numFloors; i++) self.sweatersThrown[i]  = 0;
    for(var i = 0; i < self.house.numFloors; i++) self.enemiesAttacked[i] = 0;
    for(var i = 0; i < self.house.numFloors; i++) self.enemiesDefeated[i] = 0;
    for(var i = 0; i < self.house.numFloors; i++) self.enemiesWon[i]      = 0;

    self.drawer.register(self.house);


    function getClickFuncForFloor(i)
    {
      return function() { self.player.setFloor(i); }
    }

    //verbose, I know
    //x = 0 rather than self.house.x because we want to allow click at left side of screen
    for(var i = 0; i < self.house.numFloors; i++)
    {
      self.buttons.push( new Clickable( { "x":0, "y":self.house.yForFloor(i), "w":self.house.w, "h":self.house.f_h, "click":getClickFuncForFloor(i) }));
      self.clicker.register(self.buttons[i]);
      //self.drawer.register(self.buttons[i]);
    }


    self.ticker.register(self.player);
    self.drawer.register(self.player);

    self.drawer.register(self.thermostat);
    self.presser.register(self.thermostat);
    self.ticker.register(self.thermostat);

    self.ticker.register(self.enemyFactory);
    self.ticker.register(self.particler);
    self.drawer.register(self.particler);
  };

  self.tick = function()
  {
    self.clicker.flush();
    self.presser.flush();
    self.ticker.flush();
  };

  self.draw = function()
  {
    self.drawer.flush();
  };

  self.cleanup = function()
  {
    self.ticker.clear();
    self.clicker.clear();
    self.drawer.clear();
    self.particler.clear();
    self.assetter.clear();

    self.ticker.detach();
    self.clicker.detach();
    self.drawer.detach();
    self.particler.detach();
    self.assetter.detach();
  };

  self.thermostatHit = function()
  {
  }

  self.sweaterProduced = function(floor) { self.sweatersThrown[floor]++; }
  self.enemyProduced   = function(floor) { self.enemiesAttacked[floor]++; }
  self.enemyVictory    = function(floor) { self.enemiesWon[floor]++; self.particler.register(new SW_FailParticle(self,floor)); self.particler.register(new SW_FailParticle(self,-1)); }
  self.enemyFail       = function(floor) { self.enemiesDefeated[floor]++; }
};

var SW_House = function(game)
{
  var self = this;
  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width;
  self.h = game.stage.drawCanv.canvas.height;

  self.y_t = 120;
  self.y_b = 160;
  self.x_l = 70;
  self.x_r = 0;

  self.numFloors = 4;

  self.f_h = (self.h-(self.y_t+self.y_b))/self.numFloors;
  self.yForFloor = function(floor) { return self.y+self.y_t+self.f_h*((self.numFloors-1)-floor); }
  self.ybForFloor = function(floor) { return self.y+self.y_t+self.f_h*((self.numFloors-1)-floor)+self.f_h; }

  self.img = game.assetter.asset("thermo_bg.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
    //canv.context.lineWidth = 2;
    //canv.context.strokeRect(self.x+self.x_l,self.y+self.y_t,self.w-(self.x_l+self.x_r),self.h-(self.y_t+self.y_b));
  }
}

var SW_Player = function(game)
{
  var self = this;
  self.floor = 0;

  self.w = 100;
  self.h = 100;
  self.x = game.house.x+game.house.x_l;
  self.y = game.house.ybForFloor(0)-self.h;

  self.img_grab  = game.assetter.asset("thermo_you_grab.png");
  self.img_throw = game.assetter.asset("thermo_you_throw.png");
  self.img = self.img_grab;

  self.charge = 100;

  self.setFloor = function(floor)
  {
    self.floor = floor;
    if(self.charge >= 100)
    {
      game.sweaterFactory.produce();
      self.charge = 0;
      self.img = self.img_throw;
    }
  }

  self.tick = function()
  {
    self.charge += 4;
    if(self.charge > 100) { self.charge = 100; self.img = self.img_grab; }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,game.house.ybForFloor(self.floor)-self.h,self.w,self.h);
    //canv.context.fillStyle = "#00FF00";
    //canv.context.fillRect(self.x,game.house.yForFloor(self.floor)+self.h-((self.charge/100)*self.h),20,(self.charge/100)*self.h);
  }
}

var SW_Thermostat = function(game)
{
  var self = this;

  self.w = 200;
  self.h = 80;
  self.x = game.stage.drawCanv.canvas.width/2-(self.w/2);
  self.y = game.stage.drawCanv.canvas.height-(self.w/2)-20; // '- self.w/2' because width of circle

  self.pressing = false;
  self.pressTimerMax = 100;
  self.pressTimer = self.pressTimerMax;

  self.baseTemp = 66;

  self.img = game.assetter.asset("thermo_stat.png");

  self.press = function()
  {
    self.pressing = true;
  }

  self.unpress = function()
  {
    self.pressing = false;
    self.pressTimer = self.pressTimerMax;
  }

  self.tick = function()
  {
    if(self.pressing)
    {
      self.pressTimer--;
      if(self.pressTimer <= 0)
      {
        self.pressTimer = self.pressTimerMax;
        game.thermostatHit();
        self.baseTemp--;
      }
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);

    canv.context.font = Math.round(self.h*(1/2))+"px Georgia";
    canv.context.fillStyle = "#000000"
    var base = self.baseTemp;
    for(var i = 0; i < game.enemiesWon.length; i++) base+=game.enemiesWon[i];
    canv.context.fillText(base+String.fromCharCode(176),self.x+self.w/2,self.y+(self.h*2/3));

    if(self.pressing)
    {
      canv.context.strokeStyle = "#00FF00"
      canv.context.lineWidth = 3;
      canv.context.beginPath();
      canv.context.arc(self.x+self.w/2,self.y+self.h/2,self.w/2,3*Math.PI/2,(3*(Math.PI/2)+((self.pressTimerMax-self.pressTimer)/self.pressTimerMax)*(2*Math.PI))%(2*Math.PI));
      canv.context.stroke();
    }
  }
}

var SW_EnemyFactory = function(game)
{
  var self = this;

  self.tick = function()
  {
    if(Math.random() < 0.01)
    {
      var floor = Math.floor(Math.random()*game.house.numFloors);
      game.enemyProduced(floor);
      var e = new SW_Enemy(game,floor);
      game.enemies.push(e);
      game.ticker.register(e);
      game.drawer.register(e);
    }
  }
}

var SW_Enemy = function(game, floor)
{
  var self = this;

  self.floor = floor;
  self.w = 100;
  self.h = 100;
  self.x = 1000;
  self.y = game.house.ybForFloor(floor)-self.h;

  self.state = 0; //0- cold, 1- neut, 2- warm

  self.speed = 8;

  self.animTimer = Math.round(Math.random()*100);

  self.img_cold_0 = game.assetter.asset("thermo_cold_0.png");
  self.img_cold_1 = game.assetter.asset("thermo_cold_1.png");
  self.img_neut_0 = game.assetter.asset("thermo_neut_0.png");
  self.img_neut_1 = game.assetter.asset("thermo_neut_1.png");
  self.img_warm_0 = game.assetter.asset("thermo_warm_0.png");
  self.img_warm_1 = game.assetter.asset("thermo_warm_1.png");
  self.img_0 = self.img_cold_0;
  self.img_1 = self.img_cold_1;


  self.setState = function(s)
  {
    self.state = s;
    if(s == 0)
    {
      self.img_0 = self.img_cold_0;
      self.img_1 = self.img_cold_1;
    }
    else if(s == 1)
    {
      self.img_0 = self.img_neut_0;
      self.img_1 = self.img_neut_1;
    }
    else if(s == 2)
    {
      self.img_0 = self.img_warm_0;
      self.img_1 = self.img_warm_1;
    }
  }
  self.setState(0);

  self.tick = function()
  {
    self.animTimer = (self.animTimer+2)%100;

    if(self.state == 0) //cold
    {
      self.x -= self.speed;
      if(self.x < 100)
      {
        game.enemyVictory(self.floor);
        self.setState(1);
      }
    }
    else
    {
      self.x += self.speed/2;
      if(self.x > 700) self.kill();
    }
  }

  self.draw = function(canv)
  {
    if(self.animTimer < 50) canv.context.drawImage(self.img_0,self.x,self.y,self.w,self.h);
    else                    canv.context.drawImage(self.img_1,self.x,self.y,self.w,self.h);
  }

  self.kill = function()
  {
    game.enemies.splice(game.enemies.indexOf(self),1);
    game.ticker.unregister(self);
    game.drawer.unregister(self);
  }
}

var SW_SweaterFactory = function(game)
{
  var self = this;

  self.produce = function()
  {
    game.sweaterProduced(game.player.floor);
    var s = new SW_Sweater(game,game.player.floor);
    game.sweaters.push(s);
    game.ticker.register(s);
    game.drawer.register(s);
  }
}

var SW_Sweater = function(game, floor)
{
  var self = this;

  self.floor = floor;
  self.w = 100;
  self.h = 100;
  self.x = 90;
  self.y = game.house.ybForFloor(floor)-self.h;

  self.speed = 8;

  self.img = game.assetter.asset("thermo_sweat.png");

  self.tick = function()
  {
    self.x += self.speed;
    if(self.x > 1000) self.kill();

    //collision resolution. could/should go in a collision handler. #umad
    for(var i = 0; i < game.enemies.length; i++)
    {
      if(self.floor == game.enemies[i].floor && game.enemies[i].state == 0 && self.x + (self.w/2) > game.enemies[i].x && self.x + (self.w/2) < game.enemies[i].x + game.enemies[i].w)
      {
        game.enemyFail(self.floor);
        game.enemies[i].setState(2);
        self.kill();
        break;
      }
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }

  self.kill = function()
  {
    game.sweaters.splice(game.sweaters.indexOf(self),1);
    game.ticker.unregister(self);
    game.drawer.unregister(self);
  }
}

var SW_FailParticle = function(game,floor)
{
  var self = this;

  self.floor = floor;
  if(floor == -1) //configure for main temp
  {
    self.x = 400;
    self.sy = 900;
    self.y = self.sy;
    self.ey = self.sy-50;
  }
  else
  {
    self.x = 100;
    self.sy = game.house.ybForFloor(floor)+20;
    self.y = self.sy;
    self.ey = self.sy-50;
  }

  self.t = 0;

  self.tick = function()
  {
    self.t += 0.01;
    self.y = self.y+(self.ey-self.y)/50;
    return self.t < 1;
  }
  self.draw = function(canv)
  {
    if(self.t < 0) return;
    canv.context.globalAlpha = 1-(self.t*self.t*self.t);
    canv.context.font = "30px Georgia";
    canv.context.fillStyle = "#FF0000"
    canv.context.fillText("+1",self.x-25,self.y);
    canv.context.globalAlpha = 1.0;
  }
}

