"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getKeyDifferences = getKeyDifferences;
exports.default = jsonDiff;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getKeyDifferences(a, b) {
  var bClone = _extends({}, b);

  var onlyA = [];
  var both = [];

  Object.keys(a).forEach(function (key) {
    if (key in bClone) {
      both.push(key);
      delete bClone[key];
    } else {
      onlyA.push(key);
    }
  });

  return {
    a: onlyA,
    both: both,
    b: Object.keys(bClone)
  };
}

function jsonDiff(a, b) {
  var groupedKeys = getKeyDifferences(a, b);
  var added = {};
  var deleted = {};

  groupedKeys.both.forEach(function (key) {
    var aVal = a[key];
    var bVal = b[key];

    if (_lodash2.default.isObject(aVal) && _lodash2.default.isObject(bVal)) {
      var subDiff = jsonDiff(aVal, bVal);
      if (!_lodash2.default.isEmpty(subDiff.del)) {
        deleted[key] = subDiff.del;
      }
      if (!_lodash2.default.isEmpty(subDiff.add)) {
        added[key] = subDiff.add;
      }
    } else if (aVal !== bVal) {
      added[key] = bVal;
    }
  });

  var fresh = _lodash2.default.chain(groupedKeys.b).map(function (key) {
    return [key, b[key]];
  }).object().value();

  var dead = _lodash2.default.chain(groupedKeys.a).map(function (key) {
    return [key, a[key]];
  }).object().value();

  return {
    add: _extends({}, fresh, added),
    del: _extends({}, dead, deleted)
  };
}