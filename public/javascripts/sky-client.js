var SkyClient = new Class({
  
  Implements: [Options],

  options: {
    container: 'color_sets',
  },



  initialize: function(color_sets, options) {
    
    this.setOptions(options);

    if(typeOf(this.options.container) == 'string') {
      this.options.container = $(this.options.container);
    }

    this.refreshColors(color_sets);
    var socket = this.getSocket();
    socket.on('refreshColors', this.refreshColors.bind(this));
    socket.on('colorEnter', this.colorEnter.bind(this));
    socket.on('colorLeave', this.colorLeave.bind(this));

    $(document.body).addEvent('mouseenter:relay(.color)', function(e, el) {
      socket.emit('colorEnter', el.get('id'));
    });
    /*
    $(document.body).addEvent('touchstart:relay(.color)', function(e, el) {
      socket.emit('colorEnter', el.get('id'));
    });
    */
    $(document.body).addEvent('mouseleave:relay(.color)', function(e, el) {
      socket.emit('colorLeave', el.get('id'));
    });
    /*
    $(document.body).addEvent('touchend:relay(.color)', function(e, el) {
      socket.emit('colorLeave', el.get('id'));
    });
    */
  },

  refreshColors: function(color_sets) {
    this.options.container.empty();
    var id = 0;
    color_sets.each(function(set, i, sets) {
      var set_el = new Element('div.color_set');
      set_el.setStyle('width', (100 / sets.length) + "%");
      set.each(function(color) {
        var color_el = new Element('div.color', {
          id: 'color_' + id, 
          html: "&nbsp;"
        });
        color_el.setStyle('background-color', color);
        set_el.adopt(color_el);
        id ++;
      }, this);
      this.options.container.adopt(set_el);
    }, this);
  },

  getSocket: function() {
    if( !window.socket ) {
      window.socket = io.connect(null, {port: 9998});
    }
    return window.socket;
  },

  colorEnter: function(color_id) {
    $(color_id).addClass('hover');
  },

  colorLeave: function(color_id) {
    var el = $(color_id);
    el.removeClass.delay(400, el, 'hover');
  }

});


if(express && express.color_sets) {
  if( !window.app ) window.app = {};
  app.sky = new SkyClient(express.color_sets);
}