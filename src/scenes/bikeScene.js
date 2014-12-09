var BikeScene = function(game, stage)
{
  var self = this;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.clicker;
  self.dragger;
  self.flicker;
  self.drawer;
  self.assetter;

  self.panes = [];

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.flicker = new Flicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});

    self.currentPane = 0;
    self.panes.push(new B_PumpTirePane(self));
    self.panes.push(new B_GrabKeysPane(self));
    self.panes.push(new B_CardChoicePane(self));

    /*
    //Examples
    new Clickable(
      {
        "x":10,
        "y":10,
        "w":100,
        "h":100,
        "click":function() { self.dbugger.log("click"); }
      }
    );
    new Draggable(
      {
        "x":10,
        "y":10,
        "w":100,
        "h":100,
        "drawgStart": function() { self.dbugger.log("dstart"); }
        "draw":       function() { self.dbugger.log("d"); }
        "drawgFinish":function() { self.dbugger.log("dfin"); }
      }
    );
    new Flickable(
      {
        "x":10,
        "y":10,
        "w":100,
        "h":100,
        "r":100,
        "flick":function(vec) { self.dbugger.log(vec.x); }
      }
    );
    */

    self.panes[self.currentPane].begin();
  };

  self.tick = function()
  {
    self.clicker.flush();
    self.dragger.flush();
    self.flicker.flush();
    self.ticker.flush();

    var i;
    if((i = self.panes[self.currentPane].tick()))
    {
      self.panes[self.currentPane].end();
      self.currentPane = (self.currentPane+1)%self.panes.length;
      self.panes[self.currentPane].begin();
    }
  };

  self.draw = function()
  {
    self.drawer.flush();

    self.panes[self.currentPane].draw();
  };

  self.cleanup = function()
  {
  };
};

//mini scenes
var B_GrabKeysPane = function(scene)
{
  var finished = false;
  var won = false;

  var hand_open_img = scene.assetter.asset("bike_hand_open.png");
  var hand_hit_img = scene.assetter.asset("bike_hand_hit.png");
  var hand_closed_img = scene.assetter.asset("bike_hand_closed.png");
  var keys_img = scene.assetter.asset("bike_keys.png");
  var smack_img = scene.assetter.asset("bike_smack.png");
  var fail_img = scene.assetter.asset("bike_fail.png");

  var Hand = function(pane)
  {
    var self = this;
    self.x = 540;
    self.y = 300;
    self.w = 640;
    self.h = 320;

    self.tapped = false;
    self.tappedCountDown = 100;

    self.grabbed = false;
    self.grabbedCountDown = 100;

    self.tick = function()
    {
      if(self.tapped)
      {
        //only alert parent after time for 'animation' has passed
        self.tappedCountDown--;
        if(self.tappedCountDown == 0)
        {
          pane.handTapped();
        }
      }
      else if(h.x < 20)
      {
        self.grabbed = true;
        //only alert parent after time for 'animation' has passed
        self.grabbedCountDown--;
        if(self.grabbedCountDown == 0)
        {
          pane.handGrabbed();
        }
      }
      else self.x-=3; //move left
    }
    self.click = function()
    {
      self.tapped = true;
    }
    self.draw = function(canv) //handle drawing keys here too, because of swapping precidence
    {
      if(self.grabbed || self.tapped) //draw keys first
        canv.context.drawImage(keys_img,30,200,150,300);

      if(self.tapped) canv.context.drawImage(hand_hit_img,self.x,self.y,self.w,self.h);
      else if(self.grabbed) canv.context.drawImage(hand_closed_img,self.x,self.y,self.w,self.h);
      else canv.context.drawImage(hand_open_img,self.x,self.y,self.w,self.h);

      if(!self.grabbed && !self.tapped) //draw keys second
        canv.context.drawImage(keys_img,30,200,150,300);

    }
  }

  var h;
  var self = this;
  self.begin = function()
  {
    finished = false;
    won = false;
    h = new Hand(self);
    scene.ticker.register(h);
    scene.drawer.register(h);
    scene.clicker.register(h);
  }
  self.tick = function() //return 0 for continue, 1 for lose, 2 for win
  {
    //let scene handle ticking of doodles, any other ticks can go here
    return finished+won; //#clever
  }
  self.draw = function()
  {
    //let scene handle drawing of doodles, any other draws can go here
  }
  self.end = function()
  {
    scene.ticker.unregister(h);
    scene.drawer.unregister(h);
    scene.clicker.unregister(h);
  }

  self.handTapped = function()
  {
    finished = true;
    won = true;
  }
  self.handGrabbed = function()
  {
    finished = true;
    won = false;
  }
};

var B_PumpTirePane = function(scene)
{
  var finished = false;
  var won = false;

  var pump_base_img = scene.assetter.asset("bike_pump_base.png");
  var pump_handle_img = scene.assetter.asset("bike_pump_handle.png");

  var Pump = function(pane)
  {
    var self = this;

    self.handle_up_y = 120;
    self.handle_down_y = 300;

    //used to detect drag (sync w/ handle pos)
    self.x = 70;
    self.y = self.handle_down_y; //start down
    self.w = 200;
    self.h = 300;

    self.touch_offset_y = 0; // used to keep track of drag

    self.handle_x = self.x;
    self.handle_y = self.y;
    self.handle_w = self.w;
    self.handle_h = self.h;

    self.base_x = 50;
    self.base_y = 400;
    self.base_w = 220;
    self.base_h = 500;

    self.lastState = 0; //0 = down, 1 = up
    self.halfCycles = 0;

    self.syncHandleWithDrag = function()
    {
      self.handle_x = self.x;
      self.handle_y = self.y;
      self.handle_w = self.w;
      self.handle_h = self.h;
    }

    self.tick = function()
    {
    }

    self.dragStart  = function(evt)
    {
      self.touch_offset_y = self.y+(self.h/2)-evt.doY;
    };
    self.drag = function(evt)
    {
      self.y = evt.doY-(self.h/2)+self.touch_offset_y;
      if(self.y > self.handle_down_y)
      {

        if(self.lastState == 1) self.halfCycles++;
        self.lastState = 0;
        self.y = self.handle_down_y;
      }
      if(self.y < self.handle_up_y) //handle up
      {
        if(self.lastState == 0) self.halfCycles++;
        self.lastState = 1;
        self.y = self.handle_up_y;
      }

      self.syncHandleWithDrag();
    };
    self.dragFinish = function()
    {
    };

    self.draw = function(canv)
    {
      canv.context.drawImage(pump_handle_img,self.handle_x,self.handle_y,self.handle_w,self.handle_h);
      canv.context.drawImage(pump_base_img,self.base_x,self.base_y,self.base_w,self.base_h);
    }
  }

  var p;
  var self = this;
  self.begin = function()
  {
    finished = false;
    won = false;
    p = new Pump(self);
    scene.ticker.register(p);
    scene.drawer.register(p);
    scene.dragger.register(p);
  }
  self.tick = function() //return 0 for continue, 1 for lose, 2 for win
  {
    //let scene handle ticking of doodles, any other ticks can go here
    if(p.halfCycles > 10)
    {
      finished = true;
      won = true;
    }

    return finished+won; //#clever
  }
  self.draw = function()
  {
    //let scene handle drawing of doodles, any other draws can go here
  }
  self.end = function()
  {
    scene.ticker.unregister(p);
    scene.drawer.unregister(p);
    scene.clicker.unregister(p);
  }
};

var B_CardChoicePane = function(scene)
{
  var finished = false;
  var won = false;

  var card_img = scene.assetter.asset("bike_card.png");
  var dull_square_img = scene.assetter.asset("bike_dull_square.png");
  var glow_square_img = scene.assetter.asset("bike_glow_square.png");
  var bike_img = scene.assetter.asset("bike_bike.png");
  var gas_img = scene.assetter.asset("bike_gas.png");

  var Card = function(pane)
  {
    var self = this;
    self.x = 200;
    self.y = 300;
    self.w = 200;
    self.h = 300;
    self.touch_offset_x = 0;
    self.touch_offset_y = 0;

    self.tick = function()
    {
    }

    self.dragStart  = function(evt)
    {
      self.touch_offset_x = self.x+(self.w/2)-evt.doX;
      self.touch_offset_y = self.y+(self.h/2)-evt.doY;
    };
    self.drag = function(evt)
    {
      self.x = evt.doX-(self.w/2)+self.touch_offset_x;
      self.y = evt.doY-(self.h/2)+self.touch_offset_y;
    };
    self.dragFinish = function()
    {
      pane.cardStoppedDrag();
    };

    self.draw = function(canv)
    {
      canv.context.drawImage(card_img,self.x,self.y,self.w,self.h);
    }
  }

  var GlowBox = function(pane)
  {
    var self = this;
    self.x = 50;
    self.y = 50;
    self.w = 200;
    self.h = 200;

    self.glow = false;

    self.collide = function(obj)
    {
      return (self.x+self.w > obj.x) && (self.x < obj.x+obj.w) && (self.y+self.h > obj.y) && (self.y < obj.y+obj.h);
    }

    self.draw = function(canv)
    {
      if(self.glow) canv.context.drawImage(glow_square_img,self.x,self.y,self.w,self.h);
      else          canv.context.drawImage(dull_square_img,self.x,self.y,self.w,self.h);
    }
  }

  var c;
  var b_box;
  var g_box;
  var self = this;
  self.begin = function()
  {
    finished = false;
    won = false;
    c = new Card(self);
    b_box = new GlowBox(self);
    b_box.x = 50;
    g_box = new GlowBox(self);
    g_box.x = 400;
    scene.ticker.register(c);
    scene.drawer.register(b_box);
    scene.drawer.register(g_box);
    scene.drawer.register(c);
    scene.dragger.register(c);
  }
  self.tick = function() //return 0 for continue, 1 for lose, 2 for win
  {
    //let scene handle ticking of doodles, any other ticks can go here
    b_box.glow = b_box.collide(c);
    g_box.glow = g_box.collide(c);

    return finished+won; //#clever
  }
  self.draw = function()
  {
    //let scene handle drawing of doodles, any other draws can go here
  }
  self.end = function()
  {
    scene.ticker.unregister(c);
    scene.drawer.unregister(c);
    scene.drawer.unregister(b_box);
    scene.drawer.unregister(g_box);
    scene.dragger.unregister(c);
  }

  self.cardStoppedDrag = function()
  {
    if(b_box.collide(c) && !g_box.collide(c))
    {
      finished = true;
      win = true;
    }
    if(g_box.collide(c) && !b_box.collide(c))
    {
      finished = true;
      win = false;
    }
  }
};

