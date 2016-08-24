"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (drydock) {
  drydock.server.route({
    method: "GET",
    path: ROOT + "/{param*}",
    handler: {
      directory: {
        path: frontendDir
      }
    }
  });

  drydock.server.route({
    method: "GET",
    path: API + "/routes",
    handler: function handler(request, reply) {
      return reply(_lodash2.default.chain(drydock.routes).cloneDeep().map(function (route) {
        return _extends({}, route, {
          handlers: Object.keys(route.handlers).map(function (name) {
            var handler = route.handlers[name];
            return _extends({}, handler, {
              options: handler.options && Object.keys(handler.options) || [],
              name: name
            });
          })
        });
      }).value()).type("application/json");
    }
  });

  drydock.server.route({
    method: "PUT",
    path: API + "/route",
    handler: function handler(request, reply) {
      try {
        drydock.route(request.payload.name).setHandler(request.payload.selectedHandler);
        reply({ message: "OK" }).type("application/json");
      } catch (err) {
        if (!(err instanceof Errors.ApiError)) {
          throw err;
        }
        reply({ apiError: true, message: err.toString() }).type("application/json").code(500);
      }
    }
  });

  drydock.server.route({
    method: "PUT",
    path: API + "/route/selected-option",
    handler: function handler(request, reply) {
      var payload = request.payload;

      try {
        drydock.route(payload.name).setOption(payload.selectedOption, payload.handler);
        reply({ message: "OK" }).type("application/json");
      } catch (err) {
        if (!(err instanceof Errors.ApiError)) {
          throw err;
        }
        reply({ apiError: true, message: err.toString() }).type("application/json").code(500);
      }
    }
  });

  drydock.server.route({
    method: "PUT",
    path: API + "/route/selected-options",
    handler: function handler(request, reply) {
      var payload = request.payload;

      try {
        drydock.route(payload.name).setOptions(payload.selectedOptions, payload.handler);
        reply({ message: "OK" }).type("application/json");
      } catch (err) {
        if (!(err instanceof Errors.ApiError)) {
          throw err;
        }
        reply({ apiError: true, message: err.toString() }).type("application/json").code(500);
      }
    }
  });

  drydock.server.route({
    method: "PUT",
    path: API + "/delay",
    handler: function handler(request, reply) {
      (0, _schemas.validateApiUpdate)(request.payload, _schemas.delay);
      drydock.delay = request.payload.delay;
      reply({ message: "OK" }).type("application/json");
    }
  });

  drydock.server.route({
    method: "POST",
    path: API + "/reset",
    handler: function handler(request, reply) {
      drydock.reset(true, function () {
        return reply({ message: "OK" }).type("application/json");
      });
    }
  });
};

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _errors = require("../errors");

var Errors = _interopRequireWildcard(_errors);

var _schemas = require("../schemas");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ROOT = "/drydock";
var API = ROOT + "/api";
var frontendDir = _path2.default.join(__dirname, "../../ui");