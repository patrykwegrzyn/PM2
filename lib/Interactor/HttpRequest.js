
var http            = require('http');
var https           = require('https');

var HttpsProxyAgent = require('https-proxy-agent');
var HttpProxyAgent  = require('http-proxy-agent');

var debug           = require('debug')('interface:http');

var HttpRequest = module.exports = {};

var _http_proxy_agent  = null;
var _https_proxy_agent = null;

if (process.env.https_proxy) {
  _http_proxy_agent  = new HttpProxyAgent(process.env.https_proxy);
  _https_proxy_agent = new HttpsProxyAgent(process.env.https_proxy);
}
else if (process.env.http_proxy) {
  _http_proxy_agent  = new HttpProxyAgent(process.env.http_proxy);
  _https_proxy_agent = new HttpsProxyAgent(process.env.http_proxy);
}

HttpRequest.post = function(opts, cb) {
  if (!(opts.port && opts.data && opts.url))
    return cb({msg : 'missing parameters', port : opts.port, data : opts.data, url : opts.url});

  var port = 0;

  var options = {
    hostname : opts.url,
    path     : '/api/node/verifyPM2',
    method   : 'POST',
    port     : opts.port,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(opts.data))
    }
  };

  var client = (opts.port == 443) ? https : http;

  if (_http_proxy_agent && opts.port != 443) {
    options.agent = _https_proxy_agent;
  }
  else if (_https_proxy_agent && opts.port == 443) {
    options.agent = _https_proxy_agent;
  }

  if (cb) {
    var timeout = setTimeout(function() {
      cb({msg : 'Connection timed out ' + opts.url, success:false});
    }, 7000);
  }

  var req = client.request(options, function(res){
    var dt = '';

    res.on('data', function (chunk) {
      dt += chunk;
    });

    res.on('end',function(){
      cb ? clearTimeout(timeout) : null;
      try {
        cb ? cb(null, JSON.parse(dt)) : null;
      } catch(e) {
        cb ? cb(e) : null;
      }
    });

    res.on('error', function(e){
      cb ? clearTimeout(timeout) : null;
      cb ? cb(e) : null;
    });
  });

  req.on('error', function(e) {
    clearTimeout(timeout);
    cb ? cb(e) : null;
  });

  req.write(JSON.stringify(opts.data));

  req.end();
};
