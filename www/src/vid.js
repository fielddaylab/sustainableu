var Vid = function(container, source, stamps, callback)
{
  //var PLAT="IOS";
  var PLAT="ANDROID";

  var self = this;

  self.container = container;
  self.source    = source;
  self.stamps    = stamps;
  self.callback  = callback;

  if(PLAT == "IOS")
  {
    self.video = document.createElement('video');
    self.video.style.width = container.style.width;
    self.video.style.height = container.style.height;
    self.video.controls = false;
    self.video.loop = false;
    //self.video.playsinline = true;
    self.video.setAttribute("webkit-playsinline","webkit-playsinline"); //ugh
    var dom_src = document.createElement('source');
    dom_src.src = self.source;
    //dom_src.type = "video/"+self.source.substring(self.source.indexOf('.')+1); //oh god so error prone
    self.video.appendChild(dom_src);

    self.onended = function()
    {
      self.container.removeChild(self.video);

      self.video = undefined;
      self.callback();
    }
    self.video.onended = self.onended;

    self.load = function()
    {
      self.video.load();
    }

    self.play = function()
    {
      self.container.appendChild(self.video);
      self.video.play();
    }

    self.stop = function()
    {
      self.video.pause();
      self.onended();
    }

    self.next = function()
    {
      var i = 0;
      while(i < self.stamps.length && self.video.currentTime >= self.stamps[i])
        i++;
      if(i == self.stamps.length) self.stop();
      else
        self.video.currentTime = self.stamps[i];
    }
  }

  if(PLAT == "ANDROID")
  {
    function getPhoneGapPath() {
      var path = window.location.pathname;
      path = path.substr( path, path.length - 10 );
      return 'file://' + path;
    };

    self.onended = function()
    {
      VideoPlayer.close();
      self.callback();
    }

    self.load = function()
    {
    }

    self.play = function()
    {
      VideoPlayer.play(getPhoneGapPath()+source, {}, self.onended, function(){});
    }

    self.stop = function()
    {
      self.onended();
    }

    self.next = function()
    {
    }
  }
}

