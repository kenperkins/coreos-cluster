
var TYPE = {
  onMetal: 'onMetal',
  performance: 'performance'
};

var VERSION = {
  stable: 'stable',
  beta: 'beta',
  alpha: 'alpha'
};

exports.getClusterSize = function(size) {
  if (typeof size === 'undefined') {
    return 3;
  }
  else if (typeof size === 'number' && size >= 3) {
    return parseInt(size);
  }
  else if (parseInt(size) >= 3) {
    return parseInt(size);
  }

  throw new Error('cluster size must be at least 3')
};

exports.getType = function(type) {
  if ((type && type.toLowerCase() === TYPE.onMetal.toLowerCase()) ||
    (type && type.toLowerCase() === TYPE.performance.toLowerCase())) {
    return type;
  }
  else if (!type) {
    return TYPE.performance;
  }

  throw new Error('type may only be onMetal or performance (or empty)');
};

exports.getFlavor = function(flavor, type) {
  // default flavor if not provided
  if (!flavor) {
    return type === TYPE.onMetal ? 'onmetal-compute1' : 'performance1-1'
  }
  // otherwise check the name of the flavor as a function of the type
  else if (type === TYPE.onMetal && flavor.indexOf(TYPE.onMetal.toLowerCase()) !== 0) {
    throw new Error('onMetal type must use onmetal flavors');
  }
  else if (type === TYPE.performance && flavor.indexOf(TYPE.performance.toLowerCase()) !== 0) {
    throw new Error('performance type must use performance flavors');
  }

  // must be good
  return flavor;
};

exports.getVersion = function(version) {
  if ((version && version.toLowerCase() === VERSION.stable) ||
    (version && version.toLowerCase() === VERSION.beta) ||
    (version && version.toLowerCase() === VERSION.alpha)) {
    return version;
  }
  else if (!version) {
    return VERSION.stable;
  }

  throw new Error('type may only be stable, beta or alpha (or empty)');
};

// wonderful little helper function for padding found at
// http://stackoverflow.com/a/10073788/560565
exports.pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};
