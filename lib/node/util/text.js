"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Text = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (text) {
  return new Text(text);
};

var _lodash = require("lodash");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var color = _extends(function (text, _color) {
  return "" + _color + text + "\u001b[0m";
}, {
  normal: "\x1b[0m",
  black: "\x1b[30m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
});

var Text = exports.Text = function () {
  function Text(text) {
    _classCallCheck(this, Text);

    if (typeof text === "undefined") {
      throw new Error("you must supply a parameter with `toString` method");
    }
    if (text instanceof Text) {
      return text;
    }
    this.text = text.toString();
    return this;
  }

  _createClass(Text, [{
    key: "toString",
    value: function toString() {
      return this._color ? color(this.text, this._color) : this.text;
    }
  }, {
    key: "rightJustify",
    value: function rightJustify(width) {
      if (typeof width !== "number" || width < 0) {
        throw new Error("you must supply a width");
      }
      this.text = (new Array(width).join(" ") + this.text).slice(-width);
      return this;
    }
  }, {
    key: "leftJustify",
    value: function leftJustify(width) {
      if (!width || width < 0) {
        throw new Error("you must supply a width");
      }
      this.text = (this.text + Array(width).join(" ")).slice(0, width);
      return this;
    }
  }, {
    key: "center",
    value: function center(width) {
      if (!width || width < 0) {
        throw new Error("you must supply a width");
      }

      var extra = width - this.text.length;
      if (extra < 1) {
        return this;
      }

      var left = Math.floor(extra / 2);
      var right = Math.ceil(extra / 2);

      this.text = Array(left + 1).join(" ") + this.text + Array(right + 1).join(" ");
      return this;
    }
  }, {
    key: "pad",
    value: function pad(num, chr) {
      if (!num || num < 0) {
        throw new Error("you must supply the number of characters to pad by");
      }

      chr = chr || " ";
      var padding = Array(num + 1).join(chr);
      this.text = padding + this.text + padding;

      return this;
    }
  }, {
    key: "color",
    value: function color(_color) {
      this._color = _color;
      return this;
    }
  }]);

  return Text;
}();

Text.prototype.inspect = Text.prototype.toString;
Text.prototype.black = (0, _lodash.partial)(Text.prototype.color, color.black);
Text.prototype.bright = (0, _lodash.partial)(Text.prototype.color, color.bright);
Text.prototype.red = (0, _lodash.partial)(Text.prototype.color, color.red);
Text.prototype.green = (0, _lodash.partial)(Text.prototype.color, color.green);
Text.prototype.yellow = (0, _lodash.partial)(Text.prototype.color, color.yellow);
Text.prototype.blue = (0, _lodash.partial)(Text.prototype.color, color.blue);
Text.prototype.magenta = (0, _lodash.partial)(Text.prototype.color, color.magenta);
Text.prototype.cyan = (0, _lodash.partial)(Text.prototype.color, color.cyan);