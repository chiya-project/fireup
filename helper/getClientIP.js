'use strict';
export var regexes = {
	ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
	ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
};

function not(func) {
	return function () {
		return !func.apply(null, Array.prototype.slice.call(arguments));
	};
}

function existy(value) {
	return value != null;
}

function ip(value) {
	return (existy(value) && regexes.ipv4.test(value)) || regexes.ipv6.test(value);
}

function getClientIpFromXForwardedFor(value) {
	if (!existy(value)) {
		return null;
	}

	if (not.string(value)) {
		throw new TypeError('Expected a string, got "'.concat(typeof value, '"'));
	}

	var forwardedIps = value.split(',').map(function (e) {
		var ip = e.trim();

		if (ip.includes(':')) {
			var splitted = ip.split(':');

			if (splitted.length === 2) {
				return splitted[0];
			}
		}

		return ip;
	});

	for (var i = 0; i < forwardedIps.length; i++) {
		if (ip(forwardedIps[i])) {
			return forwardedIps[i];
		}
	}

	return null;
}

/**
 *
 * @source https://github.com/pbojinov/request-ip
 * @param {import('express').Request} req
 * @returns {string}
 * @example getClientIp(req) // 192.168.1
 */
function getClientIp(req) {
	if (ip(req.ip)) {
		return req.ip;
	}

	if (existy(req.socket) && ip(req.socket.remoteAddress)) {
		return req.socket.remoteAddress;
	}

	if (existy(req.requestContext) && existy(req.requestContext.identity) && ip(req.requestContext.identity.sourceIp)) {
		return req.requestContext.identity.sourceIp;
	}

	if (req.headers) {
		if (ip(req.headers['cf-connecting-ip'])) {
			return req.headers['cf-connecting-ip'];
		}

		if (ip(req.headers['Cf-Pseudo-IPv4'])) {
			return req.headers['Cf-Pseudo-IPv4'];
		}

		if (ip(req.headers['x-client-ip'])) {
			return req.headers['x-client-ip'];
		}

		var xForwardedFor = getClientIpFromXForwardedFor(req.headers['x-forwarded-for']);

		if (ip(xForwardedFor)) {
			return xForwardedFor;
		}

		if (ip(req.headers['fastly-client-ip'])) {
			return req.headers['fastly-client-ip'];
		}

		if (ip(req.headers['true-client-ip'])) {
			return req.headers['true-client-ip'];
		}

		if (ip(req.headers['x-real-ip'])) {
			return req.headers['x-real-ip'];
		}

		if (ip(req.headers['x-cluster-client-ip'])) {
			return req.headers['x-cluster-client-ip'];
		}

		if (ip(req.headers['x-forwarded'])) {
			return req.headers['x-forwarded'];
		}

		if (ip(req.headers['forwarded-for'])) {
			return req.headers['forwarded-for'];
		}

		if (ip(req.headers.forwarded)) {
			return req.headers.forwarded;
		}

		if (ip(req.headers['x-appengine-user-ip'])) {
			return req.headers['x-appengine-user-ip'];
		}
	}

	if (existy(req.raw)) {
		return getClientIp(req.raw);
	}

	return null;
}

function mw(options) {
	var configuration = not.existy(options) ? {} : options;

	if (not.object(configuration)) {
		throw new TypeError('Options must be an object!');
	}

	var attributeName = configuration.attributeName || 'clientIp';
	return function (req, res, next) {
		var ip = getClientIp(req);
		Object.defineProperty(req, attributeName, {
			get: function get() {
				return ip;
			},
			configurable: true,
		});
		next();
	};
}

export default getClientIp;
export { getClientIpFromXForwardedFor, getClientIp, mw, ip };
