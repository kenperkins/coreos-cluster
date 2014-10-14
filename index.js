var Cluster = require('./lib/cluster').Cluster;

/**
 * Create a coreos cluster
 *
 * @param {object}      options               options for your new cluster
 * @param {string}      [options.type]        'onMetal' or 'performance', performance is default
 * @param {string}      [options.flavor]      cloud servers flavor, defaults to smallest for type
 * @param {string}      [options.release]     coreos release, 'alpha', 'beta', 'stable', stable is default
 * @param {number}      [options.size]        number of nodes, defaults to 3
 * @param {string}      [options.keyname]     ssh keyname; if not provided will create a new key 'coreos-cluster'
 *
 * @param callback      callback with err, results
 */
exports.createCluster = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (!callback) {
    throw new Error('You must provide a callback to createCluster');
  }

  var cluster = Cluster(options);

  try {
    cluster = new Cluster(options);
  }
  catch (e) {
    callback(e);
  }

  cluster.initialize(function(err) {
    if (err) {
      callback(err);
      return;
    }

    cluster.provision(function(err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null, cluster.toJSON());
    });
  });
};

exports.Cluster = Cluster;
