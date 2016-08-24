"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApiError = exports.ParsingErr = exports.ConfigurationError = exports.HttpError = exports.BaseError = undefined;

var _lodash = require("lodash");

/**
 * Error helper functions
 */

function inherit(Child, Parent) {
  var hasOwn = Object.prototype.hasOwnProperty;

  var Intermediate = function Intermediate() {
    this.constructor = Child;
    this.constructor$ = Parent;
    for (var prop in Parent.prototype) {
      if (hasOwn.call(Parent.prototype, prop) && prop.slice(-1) !== "$") {
        this[prop + "$"] = Parent.prototype[prop];
      }
    }
  };

  Intermediate.prototype = Parent.prototype;
  Child.prototype = new Intermediate();
  return Child.prototype;
}

function errorFactory(Parent, name) {
  var ErrorType = function ErrorType(message) {
    this.name = name;
    this.message = message;
    this.cause = message;

    if (message instanceof Parent) {
      this.message = message.message;
      this.stack = message.stack;
    } else if (Parent.captureStackTrace) {
      Parent.captureStackTrace(this, this.constructor);
    }
  };
  inherit(ErrorType, Parent);
  return ErrorType;
}

/**
 * Base error prototype
 */

var BaseError = exports.BaseError = errorFactory(Error, "BaseError");

/**
 * Error prototypes with custom behavior
 */

var HttpError = exports.HttpError = function HttpError(code, payload) {
  this.name = "HttpError";
  this.code = code;
  this.payload = payload;
  this.type = (0, _lodash.isString)(payload) ? "text/html" : "application/json";

  this.message = code;
  this.cause = code;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
};
inherit(HttpError, BaseError);

/**
 * Exported error definitions
 */

var ConfigurationError = exports.ConfigurationError = errorFactory(BaseError, "ConfigurationError");
var ParsingErr = exports.ParsingErr = errorFactory(BaseError, "ParsingErr");
var ApiError = exports.ApiError = errorFactory(BaseError, "ApiError");