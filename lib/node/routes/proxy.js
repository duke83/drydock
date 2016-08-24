"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (drydock) {
  drydock.server.route({
    method: "*",
    path: "/{path*}",
    handler: function handler(req, reply) {
      var method = req.method;
      var headers = req.headers;
      var payload = req.payload;
      var _req$url = req.url;
      var hostname = _req$url.hostname;
      var href = _req$url.href;


      if (!hostname) {
        // eslint-disable-next-line no-console
        console.log("Unable to fulfill HTTP request: " + href);
        reply("Unknown failer.").code(500);
        return;
      }

      (0, _request2.default)({
        url: href,
        method: method,
        headers: headers,
        body: payload,
        encoding: null
      }, function (err, response) {
        if (err) {
          // eslint-disable-next-line no-console
          console.log("Unable to fulfill HTTP request: " + err.stack);
          reply("Unknown failure.").code(500);
          return;
        }

        var statusCode = response.statusCode;
        var body = response.body;
        var responseHeaders = response.headers;

        var r = reply(body).code(statusCode);
        Object.keys(responseHeaders).forEach(function (header) {
          r = r.header(header, responseHeaders[header]);
        });
      });
    }
  });
};

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }