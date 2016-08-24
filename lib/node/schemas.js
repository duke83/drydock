"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.delay = exports.proxyRoute = exports.staticRoute = exports.handler = exports.route = undefined;
exports.validateConfig = validateConfig;
exports.validateApiUpdate = validateApiUpdate;

var _joi = require("joi");

var _joi2 = _interopRequireDefault(_joi);

var _errors = require("./errors");

var Errors = _interopRequireWildcard(_errors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validateConfig(schema, obj) {
  var result = _joi2.default.validate(obj, schema);
  if (result.error) {
    throw new Errors.ConfigurationError(result.error.toString());
  }
}

function validateApiUpdate(obj, schema) {
  var result = _joi2.default.validate(obj, schema);
  if (result.error) {
    throw new Errors.ApiError(result.error.toString());
  }
}

var route = exports.route = _joi2.default.object().keys({
  name: _joi2.default.string().required(),
  method: _joi2.default.string().allow("*", "GET", "POST", "PUT", "DELETE", "PATCH").required(),
  path: _joi2.default.string().required(),
  handlers: _joi2.default.object().required(),
  hostname: _joi2.default.string().optional()
});

var handler = exports.handler = _joi2.default.object().keys({
  description: _joi2.default.string().required(),
  handler: _joi2.default.func().required(),
  optionsHelperText: _joi2.default.string(),
  optionsType: _joi2.default.string().allow("selectOne", "selectMany"),
  options: _joi2.default.object(),
  selectedOptions: _joi2.default.array(),
  requestQueryString: _joi2.default.string().optional(),
  requestPostData: _joi2.default.string().optional()
}).with("options", "optionsType", "optionsHelperText");

var staticRoute = exports.staticRoute = _joi2.default.object().keys({
  filePath: _joi2.default.string().required(),
  urlPath: _joi2.default.string().required()
});

var proxyRoute = exports.proxyRoute = _joi2.default.object().keys({
  method: _joi2.default.string().allow("*", "GET", "POST", "PUT", "DELETE", "PATCH").required(),
  path: _joi2.default.string().required(),
  forwardTo: _joi2.default.alternatives().try(_joi2.default.string(), _joi2.default.func()).required()
});

var delay = exports.delay = _joi2.default.object().keys({
  delay: _joi2.default.alternatives().try(_joi2.default.number().integer(), _joi2.default.any().valid(null)).required()
});