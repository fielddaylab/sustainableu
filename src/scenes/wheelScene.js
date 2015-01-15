var WheelScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  //try to inject as much intro stuff as possible here
  self.viewing = 0; //0- intro, 1- gameplay, 2- outro

  self.intro_vid_src = "assets/sample.webm";
  self.intro_vid_stamps = [];
  self.outro_vid_src = "assets/sample.webm";
  self.outro_vid_stamps = [];

  self.beginGame = function()
  {
    self.viewing = 1;
    self.clicker.unregister(self.beginButton);

    // register all gameplay stuff
    for(var i = 0; i < self.numSquirrels; i++)
      self.ticker.register(self.squirrels[i]);
    for(var i = 0; i < self.numNests; i++)
      self.ticker.register(self.nests[i]);
    self.ticker.register(self.door);
    self.ticker.register(self.wheel);
    self.ticker.register(self.crowd);
    self.ticker.register(self.presenter);
    // end register
  }

  self.endGame = function()
  {
    self.viewing = 2;
    game.playVid(self.outro_vid_src, self.outro_vid_stamps, function(){game.setScene(MainScene);});
  }

  self.beginButton = self.beginButton = new Clickable( { "x":0, "y":0, "w":stage.drawCanv.canvas.width, "h":stage.drawCanv.canvas.height, "click":self.beginGame });
  //end intro stuff


  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.flicker;
  self.presser;
  self.clicker;
  self.dragger;
  self.drawer;
  self.assetter;

  self.bg;
  self.box_bg;
  self.wheel;
  self.nests;     self.numNests;     self.nestsFlicked;
  self.squirrels; self.numSquirrels; self.squirrelsFlicked;
  self.box;
  self.door;
  self.crowd;
  self.presenter;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.flicker = new Flicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.presser = new Presser({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});

    self.bg = new WH_BG(self);
    self.box = new WH_Box(self);
    self.wheel = new WH_Wheel(self);
    self.door = new WH_Door(self);
    self.box_bg = new WH_Box_BG(self);
    self.crowd = new WH_Crowd(self);
    self.presenter = new WH_Presenter(self);
    self.happyPeople = new WH_HappyPeople(self);

    var l = self.door.x;
    var r = self.door.x+self.door.w;
    var t = self.door.y;
    var b = self.door.y+self.door.h;

    self.squirrels = []; self.numSquirrels = 4; self.squirrelsFlicked = 0;
    for(var i = 0; i < self.numSquirrels; i++)
      self.squirrels.push(new WH_Squirrel(self));

    self.squirrels[0].x = l+50;
    self.squirrels[0].y = t;

    self.squirrels[1].x = r-self.squirrels[1].w-50;
    self.squirrels[1].y = t;

    self.squirrels[2].x = r-self.squirrels[2].w-50;
    self.squirrels[2].y = b-self.squirrels[2].h-20;

    self.squirrels[3].x = l+50;
    self.squirrels[3].y = b-self.squirrels[3].h-20;

    self.nests = []; self.numNests = 64; self.nestsFlicked = 0;
    for(var i = 0; i < self.numNests; i++)
      self.nests.push(new WH_Nest(self));

    self.templateNests = [];
    self.templateNests[0] = new WH_Nest(self);
    self.templateNests[0].x = l+50;
    self.templateNests[0].y = t+50;

    self.templateNests[1] = new WH_Nest(self);
    self.templateNests[1].x = r-self.templateNests[1].w-50;
    self.templateNests[1].y = t+50;

    self.templateNests[2] = new WH_Nest(self);
    self.templateNests[2].x = r-self.templateNests[2].w-50;
    self.templateNests[2].y = b-self.templateNests[2].h-20;

    self.templateNests[3] = new WH_Nest(self);
    self.templateNests[3].x = l+50;
    self.templateNests[3].y = b-self.templateNests[3].h-20;

    for(var i = 0; i < 4; i++)
    {
      for(var j = 0; j < self.numNests/4; j++)
      {
        self.nests[(i*self.numNests/4)+j].x = self.templateNests[i].x+((Math.random()*2)-1)*40;
        self.nests[(i*self.numNests/4)+j].y = self.templateNests[i].y+((Math.random()*2)-1)*10;
      }
    }

    self.drawer.register(self.bg);
    self.drawer.register(self.crowd);
    self.drawer.register(self.box_bg);
    self.drawer.register(self.wheel);
    for(var i = 0; i < self.numNests; i++)
      self.drawer.register(self.nests[i]);
    for(var i = 0; i < self.numSquirrels; i++)
      self.drawer.register(self.squirrels[i]);
    self.drawer.register(self.box);
    self.drawer.register(self.door);
    self.drawer.register(self.presenter);

    self.nextTask();
    game.playVid(self.intro_vid_src, self.intro_vid_stamps, function(){self.clicker.register(self.beginButton)});
  };

  self.tick = function()
  {
    self.flicker.flush();
    self.presser.flush();
    self.clicker.flush();
    self.dragger.flush();
    self.ticker.flush();
  };

  self.draw = function()
  {
    self.drawer.flush();

    if(self.viewing == 0)
    {
      self.stage.drawCanv.context.fillStyle = "rgba(0,0,0,0.8)";
      self.stage.drawCanv.context.fillRect(0,0,self.stage.drawCanv.canvas.width,self.stage.drawCanv.canvas.height);
      self.stage.drawCanv.context.fillStyle = "#FFFFFF";
      self.stage.drawCanv.context.font = "30px comic_font";
      self.stage.drawCanv.context.fillText("Fix the heat wheel to save   ",50,300);
      self.stage.drawCanv.context.fillText("the demo!                    ",50,340);
      self.stage.drawCanv.context.fillText("                             ",50,380);
      self.stage.drawCanv.context.fillText("                             ",50,440);
      self.stage.drawCanv.context.fillText("                             ",50,480);
      self.stage.drawCanv.context.fillText("                             ",50,540);
      self.stage.drawCanv.context.fillText("(Touch Anywhere to Begin)",self.stage.drawCanv.canvas.width-480,self.stage.drawCanv.canvas.height-30);
    }
  };

  self.cleanup = function()
  {
    self.dbugger.clear();
    self.ticker.clear();
    self.flicker.clear();
    self.presser.clear();
    self.clicker.clear();
    self.dragger.clear();
    self.drawer.clear();
    self.assetter.clear();

    self.dbugger.detach();
    self.ticker.detach();
    self.flicker.detach();
    self.presser.detach();
    self.clicker.detach();
    self.dragger.detach();
    self.drawer.detach();
    self.assetter.detach();
  };

  self.doorFlicked = function()
  {
    self.nextTask();
  }

  self.squirrelFlicked = function()
  {
    self.squirrelsFlicked++;
    if(self.squirrelsFlicked >= self.numSquirrels)
      self.nextTask();
  }

  self.nestFlicked = function()
  {
    self.nestsFlicked++;
    if(self.nestsFlicked >= self.numNests)
      self.nextTask();
  }

  self.wheelSpinning = function()
  {
    self.nextTask();
  }

  self.task = -1;
  self.nextTask = function()
  {
    self.task++;

    if(self.task == 0)
    {
      self.flicker.register(self.door);
    }
    if(self.task == 1)
    {
      for(var i = 0; i < self.numSquirrels; i++)
        self.flicker.register(self.squirrels[i]);
    }
    if(self.task == 2)
    {
      for(var i = 0; i < self.numNests; i++)
        self.presser.register(self.nests[i]);
    }
    if(self.task == 3)
    {
      self.dragger.register(self.wheel);
    }
    if(self.task == 4)
    {
      self.drawer.unregister(self.crowd);
      self.drawer.unregister(self.presenter);
      self.drawer.register(self.happyPeople);
      setTimeout(self.endGame, 1000);
    }
  }
};

var WH_HappyPeople = function(game)
{
  var self = this;
  self.x = 0;
  self.y = game.stage.drawCanv.canvas.height-400;
  self.w = 600;
  self.h = 500;

  self.img = game.assetter.asset("wheel_crowd_happy.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

var WH_Crowd = function(game)
{
  var self = this;

  self.x = -100;
  self.y = 180;
  self.w = 750;
  self.h = 450;

  self.img_0 = game.assetter.asset("wheel_crowd_0.png");
  self.img_1 = game.assetter.asset("wheel_crowd_1.png");

  self.t = 0;
  self.tick = function()
  {
    self.t++;
    self.x++;
  }

  self.draw = function(canv)
  {
    if(Math.round(self.t/20)%2==0) canv.context.drawImage(self.img_0,self.x,self.y,self.w,self.h);
    else                           canv.context.drawImage(self.img_1,self.x,self.y,self.w,self.h);
  }
}

var WH_Presenter = function(game)
{
  var self = this;

  self.x = -50;
  self.y = game.stage.drawCanv.canvas.height-400;
  self.w = 400;
  self.h = 500;

  self.img_0 = game.assetter.asset("wheel_presenter_0.png");
  self.img_1 = game.assetter.asset("wheel_presenter_1.png");

  self.t = 0;
  self.tick = function()
  {
    self.t++;
  }

  self.draw = function(canv)
  {
    if(Math.round(self.t/10)%2==0) canv.context.drawImage(self.img_0,self.x,self.y,self.w,self.h);
    else                           canv.context.drawImage(self.img_1,self.x,self.y,self.w,self.h);
  }
}

var WH_BG = function(game)
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width;
  self.h = game.stage.drawCanv.canvas.height;

  self.img = game.assetter.asset("wheel_bg.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

var WH_Box_BG = function(game)
{
  var self = this;

  self.x = game.door.x;
  self.y = game.door.y;
  self.w = game.door.w;
  self.h = game.door.h;

  self.img = game.assetter.asset("wheel_case_bg.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

var WH_Box = function(game)
{
  var self = this;

  self.x = 10;
  self.y = 420;
  self.w = 630;
  self.h = 340;

  self.img = game.assetter.asset("wheel_case.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

var WH_Door = function(game)
{
  var self = this;

  self.flicked = false;

  self.startX = 0;
  self.startY = 0;
  self.vec = {"x":0,"y":0};

  self.x = game.box.x+150;
  self.y = game.box.y+80;
  self.w = game.box.w-350;
  self.h = game.box.h-130;
  self.r = self.w/4;

  self.vx = 0;
  self.vy = 0;

  self.img = game.assetter.asset("wheel_cover.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img, self.x, self.y, self.w, self.h);
  }

  self.tick = function()
  {
    if(self.flicked)
    {
      self.x += self.vx;
      self.y += self.vy;
      self.vy += 1;
    }
  }

  self.flickStart = function(evt){ self.startX = evt.doX; self.startY = evt.doY; self.flicked = false; };
  self.flicking   = function(evt){ if(self.flicked) return; self.vec.x = (evt.doX-self.startX); self.vec.y = (evt.doY-self.startY); if(Math.sqrt((self.vec.x*self.vec.x)+(self.vec.y*self.vec.y)) >= self.r) { self.flick(self.vec); self.flicked = true; }};

  self.flick = function(vec)
  {
    self.flicked = true;
    self.vx = vec.x/10;
    self.vy = vec.y/5;
    game.flicker.unregister(self);
    game.doorFlicked();
  }
}

var WH_Squirrel = function(game)
{
  var self = this;

  self.flicked = false;

  self.startX = 0;
  self.startY = 0;
  self.vec = {"x":0,"y":0};

  self.x = game.box.x+20;
  self.y = game.box.y+20;
  self.w = 60;
  self.h = 100;
  self.r = self.w/4;

  self.offYt = Math.random()*2*Math.PI;
  self.offY = 0;
  self.offXt = Math.random()*2*Math.PI;
  self.offX = 0;

  self.vx = 0;
  self.vy = 0;

  if(Math.random() < 0.5) self.img = game.assetter.asset("wheel_squirrel_0.png");
  else                    self.img = game.assetter.asset("wheel_squirrel_1.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x+self.offX,self.y+self.offY,self.w,self.h);
  }

  self.tick = function()
  {
    self.offYt += 0.5;
    self.offY = Math.sin(self.offYt)*8;
    self.offXt += 0.8;
    self.offX = Math.sin(self.offXt)*2;
    if(self.flicked)
    {
      self.x += self.vx;
      self.y += self.vy;
      self.vy += 1;
    }
  }

  self.flickStart = function(evt){ self.startX = evt.doX; self.startY = evt.doY; self.flicked = false; };
  self.flicking   = function(evt){ if(self.flicked) return; self.vec.x = (evt.doX-self.startX); self.vec.y = (evt.doY-self.startY); if(Math.sqrt((self.vec.x*self.vec.x)+(self.vec.y*self.vec.y)) >= self.r) { self.flick(self.vec); self.flicked = true; }};

  self.flick = function(vec)
  {
    if(!self.flicked)
    {
      game.drawer.unregister(self);
      game.drawer.register(self); //bring self to front
    }
    self.flicked = true;
    self.vx = vec.x/10;
    self.vy = vec.y/5-10;
    game.flicker.unregister(self);
    game.squirrelFlicked();
  }
}

var WH_Nest = function(game)
{
  var self = this;

  self.flicked = false;

  self.x = 0; //will get set on first tick
  self.y = 0; //will get set on first tick
  self.w = 50;
  self.h = 50;
  self.i = 0;

  self.vx = 0;
  self.vy = 0;

  self.imgs = [];
  self.imgs.push(game.assetter.asset("wheel_nest_0.png"));
  self.imgs.push(game.assetter.asset("wheel_nest_1.png"));
  self.imgs.push(game.assetter.asset("wheel_nest_2.png"));
  self.imgs.push(game.assetter.asset("wheel_nest_3.png"));
  self.imgs.push(game.assetter.asset("wheel_nest_4.png"));

  self.draw = function(canv)
  {
    canv.context.drawImage(self.imgs[self.i],self.x,self.y,self.w,self.h);
  }

  var firstTicked = false;
  self.tick = function()
  {
    if(!firstTicked)
    {
      self.x += ((Math.random()*2)-1)*5;
      self.y += ((Math.random()*2)-1)*5;
      self.i += Math.floor(Math.random()*5);
      firstTicked = true;
    }
    if(self.flicked)
    {
      self.x += self.vx;
      self.y += self.vy;
      self.vy += 1;
    }
  }

  self.press = function(evt)
  {
    if(!self.flicked)
    {
      game.drawer.unregister(self);
      game.drawer.register(self); //bring self to front
    }
    self.flicked = true;
    self.vx = ((Math.random()*2)-1)*20;
    self.vy = Math.random()*-20;
    game.presser.unregister(self);
    game.nestFlicked();
  }
  self.unpress = function(evt)
  {

  }
}

var WH_Wheel = function(game)
{
  var self = this;

  self.spinning = false;

  self.offX = 0;
  self.offY = 0;
  self.deltaX = 0;
  self.deltaY = 0;

  self.x = game.box.x+190;
  self.y = game.box.y+80;
  self.w = 200;
  self.h = 200;

  self.rot = 0;
  self.rev = 0;

  self.img = game.assetter.asset("wheel_wheel.png");

  self.draw = function(canv)
  {
  /*
    canv.context.lineWidth = 2;
    canv.context.strokeStyle = "#000000";
    canv.context.beginPath();
    canv.context.arc(self.x+self.w/2, self.y+self.h/2, (game.box.h-40)/2, 0, Math.PI*2, true);
    canv.context.stroke();
    canv.context.closePath();
  */
    canv.context.save();
    canv.context.translate(self.x+self.w/2, self.y+self.h/2);
    canv.context.rotate(self.rot);
    canv.context.drawImage(self.img, -self.w/2, -self.h/2, self.w, self.h);
    canv.context.restore();
  }

  self.tick = function()
  {
    if(self.spinning) self.rot += 0.1;
  }

  self.dragStart = function(evt)
  {
    self.offX = evt.doX-(self.x+(self.w/2));
    self.offY = evt.doY-(self.y+(self.h/2));
  };
  function len(x,y)
  {
    return Math.sqrt((x*x)+(y*y));
  }
  self.drag = function(evt)
  {
    self.deltaX = (evt.doX-self.x+(self.w/2))-self.offX;
    self.deltaY = (evt.doY-self.y+(self.h/2))-self.offY;

    self.newOffX = evt.doX-(self.x+(self.w/2));
    self.newOffY = evt.doY-(self.y+(self.h/2));

    var x = self.offX/len(self.offX,self.offY);
    var y = self.offY/len(self.offX,self.offY);
    self.oldT = ((-Math.atan2(x,y))+(Math.PI/2)+(2*Math.PI))%(2*Math.PI); //why terrible coordinate spaces...
    var x = self.newOffX/len(self.newOffX,self.newOffY);
    var y = self.newOffY/len(self.newOffX,self.newOffY);
    self.newT = ((-Math.atan2(x,y))+(Math.PI/2)+(2*Math.PI))%(2*Math.PI); //why terrible coordinate spaces...

    var a = self.oldT-self.newT;
    if((a > 0 && a < Math.PI) || a < -Math.PI) /*wrong way...*/;
    else                                       self.rev++; //maybe spit out a particle?
    self.rot -= a;

    if(self.rev > 50)
    {
      if(!self.spinning) game.wheelSpinning();
      self.spinning = true;
    }

    self.offX = self.newOffX;
    self.offY = self.newOffY;
  };
  self.dragFinish = function()
  {
  };
}

