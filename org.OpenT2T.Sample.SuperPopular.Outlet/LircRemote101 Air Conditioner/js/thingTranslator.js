'use strict';

// logs device state
function logDeviceState(device) {
  if (typeof (device) !== 'undefined') {
    console.log('  device.name          : ' + device.name);
    console.log('  device.props         : ' + device.props);
  } else {
    console.log('device is undefined');
  }
};

// module exports, implementing the schema
module.exports = {

  device: null,

  initDevice: function(dev) {
    this.device = dev;
    this._powerOn = false;
    var platform = require('os').platform();
    if (platform === 'win32') {
      this._toggleFunction = require('./windowsBleComms.js');
    } else {
      console.error("Not implemented");
    }

    console.log('javascript initialized.');
    logDeviceState(this.device);
  },

  disconnect: function() {
    console.log('disconnect called.');
    logDeviceState(this.device);
  },

  turnOn: function() {
    console.log('turnOn called.');
    if(this._powerOn === true) {
      console.info("Already on");
    } else {
      this._powerOn = true;
      this._toggleFunction();
    }
  },

  turnOff: function() {
    console.log('turnOff called.');
    if(this._powerOn === false) {
      console.info("Already off");
    } else {
      this._powerOn = false;
      this._toggleFunction();
    }
  }
}

// globals for JxCore host
global.initDevice = module.exports.initDevice;
global.disconnect = module.exports.disconnect;
global.turnOn = module.exports.turnOn;
global.turnOff = module.exports.turnOff;
