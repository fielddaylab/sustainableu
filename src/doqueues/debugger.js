var Debugger = function(init)
{
  var default_init =
  {
    history:10,
    source:document.createElement('div')
  }

  var self = this;
  doMapInitDefaults(self,init,default_init);

  var log = []; //acts as circle buffer
  var cells = [];
  var pos = 0;
  for(var i = 0; i < self.history; i++)
  {
    cells[i] = document.createElement('div');
    cells[i].style.userSelect = "none";
    log[i] = "";
    self.source.appendChild(cells[i]);
  }

  self.log = function(txt)
  {
    log[pos] = txt;
    pos = (pos+1)%self.history
    if(debug)
    {
      for(var i = 0; i < self.history; i++)
        cells[i].innerHTML = log[(pos-1-i+self.history)%self.history];
    }
  }
}

