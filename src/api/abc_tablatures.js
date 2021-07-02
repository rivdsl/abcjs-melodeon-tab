/*
 * Tablature Plugins
 * tablature are defined dynamically and registered inside abcjs
 * by calling abcTablatures.register(plugin) 
 * where plugin represents a plugin instance 
 * 
 */
var ViolinTablature = require('../tablatures/instruments/violin/tab-violin');
var GuitarTablature = require('../tablatures/instruments/guitar/tab-guitar');

var abcTablatures = {

  inited: false ,
  plugins: {},
  errordiv : null,
  
  /**
   * to be called once per plugin for registration 
   * @param {*} plugin 
   */
  register: function (plugin) {
    var name = plugin.name;
    var tablature = plugin.tablature;
    this.plugins[name] = tablature;
  },

  setError: function (tune, msg) {
    if (tune.warnings) {
      tune.warning.push(msg);
    } else {
      tune.warnings = [msg];
    }
  },

  /**
   * handle params for current processed score
   * @param {*} tune current tune 
   * @param {*} tuneNumber number in tune list
   * @param {*} params params to be processed for tablature
   * @return prepared tablatures plugin instances for current tune
   */
  preparePlugins: function(tune,tuneNumber,params) {
    console.log('Tablatures plugins manager preparing Plugins ...')
    var returned = null;
    var nbPlugins = 0;
    if (params.tablatures) {
       // validate requested plugins 
      var tabs = params.tablatures;
      for (ii = 0; ii < tabs.length; ii++) {
        returned = [];
        var tab = tabs[ii];
        if (tab.length > 0) {
          var tabName = tab[0]
          var args = null;
          if (tab.length > 1) {
            args = tab[1] 
          }
          var plugin = this.plugins[tabName];
          if (plugin) {
            // proceed with tab plugin  init 
            plugin.init(tune,tuneNumber,args)
            returned[ii] = plugin
            nbPlugins++;
          } else {
            // unknown tab plugin 
            //this.emit_error('Undefined tablature plugin: ' + tabName)
            this.setError(tune, 'Undefined tablature plugin: ' + tabName);
            return returned
          }
        } 
      }
    }
    console.log('Tablatures plugins manager '+nbPlugins+' Plugin(s) ready')
    return returned; 
  },

  /**
   * Staff line dispatcher to tablature plugins 
   * @param {*} renderer 
   * @param {*} staff 
   * @param {*} staffNumber 
   * @return tablature height size
   */
  renderStaffLine: function (renderer, staff, staffNumber) {
    var tune = renderer.abctune;
    var tabs = tune.tablatures;
    if (staffNumber < tabs.length) {
      tabPlugin = tabs[staffNumber];
      if (tabPlugin) {
        return tabPlugin.render(renderer, staff, staffNumber);
      }
    }
    return 0; // 0 tab size
  },

  /**
   * called once internally to register internal plugins
   */
  init: function() {
    // just register plugin hosted by abcjs 
    if (!this.inited) {
      this.register(new ViolinTablature());
      this.register(new GuitarTablature());
      this.inited = true;
    }
  }
}  


module.exports = abcTablatures ;