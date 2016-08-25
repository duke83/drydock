"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (drydock) {
  defineDynamicRoutes(drydock);
  defineHapiRoutes(drydock);
  defineStaticRoutes(drydock);
  defineProxyRoutes(drydock);
};

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _jsonDiff = require("../util/json-diff");

var _jsonDiff2 = _interopRequireDefault(_jsonDiff);

var _errors = require("../errors");

var Errors = _interopRequireWildcard(_errors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSelectedHandler(drydock, routeName, req) {
  var querystring = req.query;
  var postData = req.payload;
//  var route = _lodash2.default.find(drydock.routes, { name: routeName });
   var route = _lodash2.default.find(drydock.routes, { name: routeName });
  //THIS IS WHERE WE MATCH UP THE HANDLER QUERYSTRING/POSTDATA WITH THE THIS REQUEST QUERYSTING/POSTDATA
  //by default, the first handler is the selectedHandler
  //return route.handlers[route.selectedHandler];
  var reternOld=route.handlers[route.selectedHandler];
  return reternOld //getSelectedHandler1(route.handlers, req)
}


//comparing arrays generically is quite difficult due to element order and types.
//I think a better approach is to create comparer methods specifically for each path in the app.
// i.e, typeAheadServiceComparer, facetServiceComparer, etc...
// Alternative, we could just manaully set the selectedHandler. Hard-code it in mock.js
function getSelectedHandler1(handlers, req){
  var rtrn;
  for(var handler in handlers){
    var handlerQueryString=JSON.parse(handlers[handler].requestQueryString);
    var handlerPostData=JSON.parse(JSON.parse(handlerPostData).text);


    console.log(handlers[handler].description);
    rtrn=handlers[handler]
  }
  return rtrn;
}



function filterRequest(req) {
  return _lodash2.default.chain(req).pick("payload", "params", "query").cloneDeep().value();
}

function getHandlerContext(drydock, req) {
  return {
    state: drydock.state,
    cookies: _lodash2.default.cloneDeep(req.state) || {},
    headers: {},
    cookieDomain: null
  };
}

function updateCookieState(reply, originalCookies, modifiedCookies, settings) {
  var cookiesDiff = (0, _jsonDiff2.default)(originalCookies, modifiedCookies);
  // jsonDiff does deep-diff; we just want shallow modifiedCookies[key]
  _lodash2.default.each(cookiesDiff.add, function (val, key) {
    return reply.state(key, modifiedCookies[key], settings);
  });
  _lodash2.default.each(cookiesDiff.del, function (val, key) {
    return reply.state(key, "", settings);
  });
}

function getHandlerArgs(req, handler) {
  var handlerArgs = [filterRequest(req)];

  if (handler.optionsType === "selectOne") {
    handlerArgs.push(handler.options[handler.selectedOption]);
  } else if (handler.optionsType === "selectMany") {
    handlerArgs.push(_lodash2.default.map(handler.selectedOptions, function (optionName) {
      return handler.options[optionName];
    }));
  }

  return handlerArgs;
}

function defineDynamicRoutes(drydock) {
  drydock._initial.routes.forEach(function (routeCfg) {
    drydock.server.route({
      method: routeCfg.method,
      path: routeCfg.path,
      vhost: routeCfg.hostname,
      handler: function handler(req, reply) {
        var drydockHandler = getSelectedHandler(drydock, routeCfg.name,req);
        var handlerCxt = getHandlerContext(drydock, req);
        var handlerArgs = getHandlerArgs(req, drydockHandler);

        _bluebird2.default.resolve().then(function () {
          return drydockHandler.handler.apply(handlerCxt, handlerArgs);
        }).then(function (response) {
          return {
            payload: response,
            type: routeCfg.type,
            code: routeCfg.defaultCode || 200
          };
        }).catch(Errors.HttpError, function (err) {
          return {
            payload: err.payload,
            type: err.type,
            code: err.code
          };
        }).then(function (responseOptions) {
          return setTimeout(function () {
            var r = reply(responseOptions.payload).type(responseOptions.type).code(responseOptions.code);

            updateCookieState(r, req.state, handlerCxt.cookies, {
              encoding: drydock.cookieEncoding,
              domain: handlerCxt.cookieDomain
            });

            _lodash2.default.each(handlerCxt.headers, function (val, key) {
              return r.header(key, val);
            });
          }, drydock.delay || 0);
        });
      }
    });
  });
}

function defineHapiRoutes(drydock) {
  drydock._initial.hapiRoutes.forEach(drydock.server.route.bind(drydock.server));
}

function defineStaticRoutes(drydock) {
  drydock._initial.staticRoutes.forEach(function (routeCfg) {
    if (routeCfg.type === "directory") {
      drydock.server.route({
        method: "GET",
        path: _path2.default.join(routeCfg.urlPath, "{param*}"),
        handler: {
          directory: {
            path: routeCfg.filePath
          }
        }
      });
    } else if (routeCfg.type === "file") {
      drydock.server.route({
        method: "GET",
        path: routeCfg.urlPath,
        handler: function handler(req, reply) {
          return reply.file(routeCfg.filePath);
        }
      });
    }
  });
}

function defineProxyRoutes(drydock) {
  drydock._initial.proxyRoutes.forEach(function (proxyRoute) {
    drydock.server.route({
      method: proxyRoute.method,
      path: proxyRoute.path,
      handler: function handler(req, reply) {
        var method = req.method;
        var headers = req.headers;
        var payload = req.payload;


        delete headers.host;

        var url = _lodash2.default.isFunction(proxyRoute.forwardTo) ? proxyRoute.forwardTo(req) : proxyRoute.forwardTo;

        (0, _request2.default)({
          url: url,
          method: method,
          headers: headers,
          body: payload,
          encoding: null
        }, function (err, _ref) {
          var statusCode = _ref.statusCode;
          var body = _ref.body;
          var responseHeaders = _ref.headers;

          if (err) {
            // eslint-disable-next-line no-console
            console.log("Unable to proxy HTTP request: " + err.stack);
            reply("Unknown failure.").code(500);
            return;
          }

          var r = reply(body).code(statusCode);
          Object.keys(responseHeaders).forEach(function (header) {
            r = r.header(header, responseHeaders[header]);
          });
        });
      }
    });
  });
}