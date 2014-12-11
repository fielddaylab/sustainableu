var WindowScene = function(game, stage)
{
  var self = this;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.presser;
  self.drawer;
  self.assetter;
  self.particler;

  self.sky;
  self.reticle;
  self.building;
  self.jerk;
  self.windows;

  self.numFloors = 5;
  self.numRooms = 4;

  self.score;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.presser = new Presser({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});
    self.particler = new Particler({});

    self.sky = new WI_Sky(self);
    self.reticle = new WI_Reticle(self);
    self.building = new WI_Building(self);
    self.jerk = new WI_Jerk(self);
    self.windows = [];

    for(var i = 0; i < self.numRooms; i++)
      for(var j = 0; j < self.numFloors; j++)
        self.windows.push(new WI_Window(self, i, j));

    self.drawer.register(self.sky);
    self.ticker.register(self.sky);
    self.drawer.register(self.reticle);
    self.ticker.register(self.reticle);
    self.drawer.register(self.building);
    self.ticker.register(self.jerk);
    for(var i = 0; i < self.windows.length; i++)
    {
      self.presser.register(self.windows[i]);
      self.drawer.register(self.windows[i]);
    }
    self.drawer.register(self.particler);
    self.ticker.register(self.particler);

    self.score = 0;
  };

  self.tick = function()
  {
    self.presser.flush();
    self.ticker.flush();
  };

  self.draw = function()
  {
    self.drawer.flush();
    stage.drawCanv.context.font = "30px Georgia";
    if(self.score < 0)       stage.drawCanv.context.fillStyle = "#FF0000";
    else if(self.score == 0) stage.drawCanv.context.fillStyle = "#FFFFFF";
    else if(self.score > 0)  stage.drawCanv.context.fillStyle = "#00FF00";
    stage.drawCanv.context.fillText(self.score,20,30);
  };

  self.cleanup = function()
  {
  };

  self.dayTick = function() { self.scoreTick(1); }
  self.nightTick = function() { self.scoreTick(2); }
  self.scoreTick = function(vstate)
  {
    var w;
    var tickScore = 0;
    self.reticle.glow();
    for(var i = 0; i < self.windows.length; i++)
    {
      w = self.windows[i];
      if(w.state == vstate) { self.particler.register(new WI_ScoreParticle(w.x+(w.w/2),w.y+(w.h/2),"+1"+String.fromCharCode(176),"#00FF00",i/100)); tickScore++; }
      else                  { self.particler.register(new WI_ScoreParticle(w.x+(w.w/2),w.y+(w.h/2),"-1"+String.fromCharCode(176),"#FF0000",i/100)); tickScore--; }
    }
    var text;
    var color;
    if     (tickScore == -self.windows.length) text = "WHAT";    color = "#FF0000";
    else if(tickScore < 0)                     text = "NO";      color = "#FFFF00";
    else if(tickScore < 10)                    text = "OK";      color = "#FFFFFF";
    else if(tickScore < 15)                    text = "GOOD";    color = "#00FFFF";
    else if(tickScore < 20)                    text = "AWESOME"; color = "#0000FF";
    else if(tickScore == 20)                   text = "PERFECT"; color = "#FFFFFF";

    self.particler.register(new WI_FeedParticle(text, color));
    self.score += tickScore;
  }

};

var WI_FeedParticle = function(text, color)
{
  var self = this;
  self.x = 100;
  self.sy = 600;
  self.y = 600;
  self.ey = 200;
  self.text = text;
  self.t = 0;
  self.c = color;
  self.tick = function()
  {
    self.t += 0.01;
    self.y = self.y+(self.ey-self.y)/50;
    return self.t < 1;
  }
  self.draw = function(canv)
  {
    canv.context.globalAlpha = 1-(self.t*self.t*self.t);
    canv.context.font = "100px Georgia";
    canv.context.fillStyle = self.c;
    canv.context.fillText(self.text,self.x-25,self.y);
    canv.context.globalAlpha = 1.0;
  }
}

var WI_ScoreParticle = function(x,y,delta,color,delay)
{
  var self = this;
  self.x = x;
  self.sy = y;
  self.y = y;
  self.ey = y-50;
  self.t = -delay;
  self.d = delta;
  self.c = color;
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
    canv.context.fillStyle = self.c;
    canv.context.fillText(self.d,self.x-25,self.y);
    canv.context.globalAlpha = 1.0;
  }
}

var WI_Reticle = function(game)
{
  var self = this;
  var ret = game.assetter.asset("reticle.png");
  var ret_glow = game.assetter.asset("reticle_glow.png");

  self.t = 0;
  self.glow = function()
  {
    self.t = 50;
  }
  self.tick = function()
  {
    self.t--;
  }
  self.draw = function(canv)
  {
    canv.context.drawImage(ret, 230, -40, 200, 200);
    if(self.t > 0)
    {
      canv.context.globalAlpha = self.t/50;
      canv.context.drawImage(ret_glow, 230, -40, 200, 200);
      canv.context.drawImage(ret_glow, 230, -40, 200, 200);
      canv.context.drawImage(ret_glow, 230, -40, 200, 200);
      canv.context.globalAlpha = 1.0;
    }
  }
}

var WI_Sky = function(game)
{
  var self = this;

  self.x = 0;
  self.y = -1008;
  self.w = 640;
  self.h = 2016;

  self.t = 0;
  self.period = 1000;

  self.sky_img = game.assetter.asset("win_sky.png");
  self.moon_img = game.assetter.asset("win_moon.png");
  self.sun_img = game.assetter.asset("win_sun.png");

  self.tick = function()
  {
    self.t++;
    if(self.t%1000 == 250) game.dayTick();
    if(self.t%1000 == 750) game.nightTick();
  }
  var sin;
  var cos;
  self.draw = function(canv)
  {
    sin = Math.sin((self.t/self.period)*2*Math.PI);
    cos = Math.cos((self.t/self.period)*2*Math.PI);
    canv.context.drawImage(self.sky_img,self.x,self.y+(sin*640+125),self.w,self.h);
    canv.context.drawImage(self.moon_img,cos*640+320-100,sin*640+700-100,200,200);
    sin = Math.sin((self.t/self.period)*2*Math.PI+Math.PI);
    cos = Math.cos((self.t/self.period)*2*Math.PI+Math.PI);
    canv.context.drawImage(self.sun_img,cos*640+320-100,sin*640+700-100,200,200);
  }
}

//literally just the building image
var WI_Building = function(game)
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = 640;
  self.h = 1008;

  self.img = game.assetter.asset("win_building.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

var WI_Jerk = function(game)
{
  var self = this;

  self.t = 100;
  self.tick = function()
  {
    self.t--;
    if(self.t < 0)
    {
      self.t = 20 + (Math.random()*200);
      game.windows[Math.floor(Math.random()*game.windows.length)].press();
    }
  }
}

var WI_Window = function(game, room, floor)
{
  var self = this;

  self.room = room;
  self.floor = floor;

  self.x = room*80+160;
  self.y = floor*110+210;
  self.w = 65;
  self.h = 90;

  self.state = 0;
  var s_CLOSED = "CLOSED";
  var s_DARKED = "DARKED";
  var s_OPENED = "OPENED";
  var states = [s_CLOSED,s_DARKED,s_OPENED];
  self.imgs = [game.assetter.asset("win_closed.png"),game.assetter.asset("win_drawn.png"),game.assetter.asset("win_open.png")];

  self.draw = function(canv)
  {
    canv.context.drawImage(self.imgs[self.state],self.x,self.y,self.w,self.h);
  }

  self.press = function()
  {
    self.state = (self.state+1)%states.length;
  }
}
