/* jshint browser:true, node:true */
'use strict';

var loading = false;
var loaded = false;
var listeners = [];
var debug;

function enableDebugging() {
  var loading = true;
  require.ensure(['debug'], function(require) {
    debug = require('debug');
    listeners.forEach(function(listener) {
      listener();
    });
    listeners = null;
  });
}

window.__enableDebugging = function() {
  try {
    window.localStorage.debug_logging = true;
  } catch(e) { }

  enableDebugging();
};

window.__disableDebugging = function() {
  try {
    delete window.localStorage.debug_logging;
  } catch(e) { }
};

try {
  if(window.localStorage.debug_logging) {
    enableDebugging();
  }
} catch(e) { }

module.exports = function debugProxy(namespace) {
  var backend;

  if (debug) {
    return debug(namespace);
  }

  listeners.push(function() {
    backend = debug(namespace);
  });

  return function() {
    if (backend) {
      backend.apply(backend, arguments);
    } else if(loading) {
      // Backend is loading, defer the debug call until it is loaded
      var args = Array.prototype.slice.apply(arguments);
      listeners.push(function() {
        backend.apply(backend, arguments);
      });
    }
  };
};
