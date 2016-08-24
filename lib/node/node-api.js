"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.route = route;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _errors = require("./errors");

var Errors = _interopRequireWildcard(_errors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function route(name) {
  var _route = _lodash2.default.find(this.routes, { name: name });

  if (!_route) {
    throw new Errors.ApiError("Invalid route.");
  }

  return {
    setHandler: function setHandler(handlerName) {
      var handler = _route.handlers[handlerName];
      if (!handler) {
        throw new Errors.ApiError("Invalid handler for route '" + _route.name + "'.");
      }
      _route.selectedHandler = handlerName;

      return this;
    },
    setOption: function setOption(optionName, handlerName) {
      var handler = _route.handlers[handlerName || _route.selectedHandler];

      if (!handler) {
        throw new Errors.ApiError("Invalid handler for route '" + _route.name + "'.");
      }
      if (!handler.options[optionName]) {
        throw new Errors.ApiError("Invalid option '" + optionName + "' for handler '" + _route.selectedHandler + "'.");
      }

      handler.selectedOption = optionName;

      return this;
    },
    setOptions: function setOptions(optionNamesArray, handlerName) {
      var handler = _route.handlers[handlerName || _route.selectedHandler];

      if (!handler) {
        throw new Errors.ApiError("Invalid handler for route '" + _route.name + "'.");
      }
      if (!_lodash2.default.isArray(optionNamesArray)) {
        throw new Errors.ApiError("You must provide an array of option names to setOptions.");
      }
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = optionNamesArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var optionName = _step.value;

          if (!handler.options[optionName]) {
            throw new Errors.ApiError("Invalid option '" + optionName + "' for handler '" + _route.selectedHandler + "'.");
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

      handler.selectedOptions = optionNamesArray;

      return this;
    }
  };
}