"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _hapi = require("hapi");

var _inert = require("inert");

var _inert2 = _interopRequireDefault(_inert);

var _package = require("../../package.json");

var _schemas = require("./schemas");

var schemas = _interopRequireWildcard(_schemas);

var _nodeApi = require("./node-api");

var nodeApi = _interopRequireWildcard(_nodeApi);

var _api = require("./routes/api");

var _api2 = _interopRequireDefault(_api);

var _instance = require("./routes/instance");

var _instance2 = _interopRequireDefault(_instance);

var _proxy = require("./routes/proxy");

var _proxy2 = _interopRequireDefault(_proxy);

var _text = require("./util/text");

var _text2 = _interopRequireDefault(_text);

var _log = require("./util/log");

var _log2 = _interopRequireDefault(_log);

var _errors = require("./errors");

var Errors = _interopRequireWildcard(_errors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var invalidRoute = /^\/drydock\//;

var Drydock = function () {
  function Drydock() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Drydock);

    _extends(this, {
      port: options.port || 1337,
      ip: options.ip || "0.0.0.0",
      verbose: !!options.verbose,
      cors: !!options.cors,
      proxyUndefined: !!options.proxyUndefined,
      cookieEncoding: options.cookieEncoding || "none",
      _initial: {
        state: options.initialState || {},
        routes: [],
        staticRoutes: [],
        hapiRoutes: [],
        proxyRoutes: []
      }
    });
  }

  _createClass(Drydock, [{
    key: "_assertValidRoute",
    value: function _assertValidRoute(routeCfg) {
      this._initial.routes.forEach(function (route) {
        if (routeCfg.name === route.name) {
          throw new Errors.ConfigurationError("Route with name '" + routeCfg.name + "' is already defined.");
        }
        if (invalidRoute.test(routeCfg.path)) {
          throw new Errors.ConfigurationError("Route with path '" + routeCfg.path + "' is invalid.");
        }
      });
    }
  }, {
    key: "jsonRoute",
    value: function jsonRoute(routeCfg) {
      schemas.validateConfig(schemas.route, routeCfg);
      this._assertValidRoute(routeCfg);
      (0, _lodash.each)(routeCfg.handlers, function (handler) {
        return schemas.validateConfig(schemas.handler, handler);
      });
      this._initial.routes.push(_extends({}, routeCfg, { type: "application/json" }));
    }
  }, {
    key: "htmlRoute",
    value: function htmlRoute(routeCfg) {
      schemas.validateConfig(schemas.route, routeCfg);
      this._assertValidRoute(routeCfg);
      (0, _lodash.each)(routeCfg.handlers, function (handler) {
        return schemas.validateConfig(schemas.handler, handler);
      });
      this._initial.routes.push(_extends({}, routeCfg, { type: "text/html" }));
    }
  }, {
    key: "hapiRoute",
    value: function hapiRoute(routeCfg) {
      this._initial.hapiRoutes.push(routeCfg);
    }
  }, {
    key: "proxyRoute",
    value: function proxyRoute(routeCfg) {
      schemas.validateConfig(schemas.proxyRoute, routeCfg);
      this._initial.proxyRoutes.push(routeCfg);
    }
  }, {
    key: "staticDir",
    value: function staticDir(staticCfg) {
      schemas.validateConfig(schemas.staticRoute, staticCfg);
      this._initial.staticRoutes.push(_extends(staticCfg, { type: "directory" }));
    }
  }, {
    key: "staticFile",
    value: function staticFile(staticCfg) {
      schemas.validateConfig(schemas.staticRoute, staticCfg);
      this._initial.staticRoutes.push(_extends(staticCfg, { type: "file" }));
    }
  }, {
    key: "start",
    value: function start(cb) {
      var _this = this;

      if (this.verbose) {
        (0, _log2.default)("starting drydock " + _package.version + " server on " + this.ip + ":" + this.port + "...");
      }
      this.server = new _hapi.Server();

      var options = {
        host: this.ip,
        port: this.port,
        router: { stripTrailingSlash: true },
        routes: {
          cors: this.cors,
          state: { failAction: "ignore" }
        }
      };
      this.server.connection(options);
      this.server.register(_inert2.default, function () {});

      (0, _api2.default)(this);
      (0, _instance2.default)(this);
      if (this.proxyUndefined) {
        (0, _proxy2.default)(this);
      }

      if (this.verbose) {
        this.server.on("response", function (request) {
          var action = (0, _text2.default)("RTE").green().pad(1);
          if (request.route.path.indexOf("/drydock") === 0) {
            action = (0, _text2.default)("DDK").bright().pad(1);
          }
          (0, _log2.default)("" + (0, _text2.default)(request.method.toUpperCase()).rightJustify(5) + action + request.path);
        });
      }

      this.reset(false, function () {
        return _this.server.start(cb);
      });
    }
  }, {
    key: "stop",
    value: function stop(cb) {
      if (this.verbose) {
        (0, _log2.default)("stopping server...");
      }
      this.server.stop(cb);
    }
  }, {
    key: "reset",
    value: function reset(logReset, cb) {
      if (logReset) {
        (0, _log2.default)("resetting to initial state...");
      }

      _extends(this, {
        routes: (0, _lodash.cloneDeep)(this._initial.routes),
        staticRoutes: (0, _lodash.cloneDeep)(this._initial.staticRoutes),
        hapiRoutes: (0, _lodash.cloneDeep)(this._initial.hapiRoutes),
        proxyRoutes: (0, _lodash.cloneDeep)(this._initial.proxyRoutes),
        state: (0, _lodash.cloneDeep)(this._initial.state)
      });

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.routes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var route = _step.value;

          route.selectedHandler = route.selectedHandler || Object.keys(route.handlers)[0];

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = Object.keys(route.handlers)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var handlerName = _step2.value;

              var handler = route.handlers[handlerName];
              if (handler.optionsType === "selectOne") {
                handler.selectedOption = handler.selectedOption || Object.keys(handler.options)[0];
              }
              if (handler.optionsType === "selectMany") {
                handler.selectedOptions = handler.selectedOptions || [];
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.delay = 0;
      this.state = (0, _lodash.cloneDeep)(this._initial.state);

      cb && cb();
    }
  }]);

  return Drydock;
}();

exports.default = Drydock;


Drydock.Errors = Errors;

_extends(Drydock.prototype, nodeApi);