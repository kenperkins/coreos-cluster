var async = require('async'),
    helpers = require('./helpers'),
    pkgcloud = require('pkgcloud'),
    request = require('request'),
    cloudConfig = require('./cloud-config'),
    _ = require('lodash');

var Cluster = function(options) {
  options = options || {};

  this.basename = options.basename || 'cluster-';
  this.type = helpers.getType(options.type);
  this.release = helpers.getRelease(options.release);
  this.flavor = helpers.getFlavor(options.flavor, this.type);

  // these parameters are not required at all
  this.discoveryServiceUrl = options.discoveryServiceUrl;
  this.keyname = options.keyname;
  this.monitoringToken = options.monitoringToken;
  this.ephemeral = options.ephemeral;
  this.newDiscoveryServiceUrl = options.newDiscoveryServiceUrl || 'https://discovery.etcd.io/new';
  this.privateNetwork = options.privateNetwork;
  this.update = options.update || {};


  if (this.privateNetwork && this.type === 'onMetal') {
    throw new Error('onMetal does not support private networks at this time');
  }

  // local values
  this._initialized = false;
  this._servers = {};
  this._credentials = options.credentials || {};

  // TODO make this multi-provider capable
  this._credentials.provider = 'rackspace';

  if (this._credentials) {
    this._client = pkgcloud.compute.createClient(this._credentials);
  }
};

Cluster.prototype.initialize = function(callback) {
  var self = this;

  if (!self._client) {
    callback(new Error('must have a client to call initialize'));
    return;
  }

  function loadImages(next) {
    self._client.getImages(function(err, images) {
      if (err) {
        next(err);
        return;
      }

      self._image = _.find(images, function(item) {
        var match = (self.type === 'onMetal' ? 'onmetal - ' : '') +
          'coreos (' + self.release + ')';

        return item.name.toLowerCase().indexOf(match) === 0;
      });

      if (!self._image) {
        next(new Error('Unable to find matching image'));
        return;
      }

      next();
    });
  }

  function loadFlavors(next) {
    self._client.getFlavors(function(err, flavors) {
      if (err) {
        next(err);
        return;
      }

      self._flavor = _.find(flavors, function(item) {
        return item.id.toLowerCase() === self.flavor;
      });

      if (!self._flavor) {
        next(new Error('Unable to find matching flavor'));
        return;
      }

      next();
    });
  }

  function createKeyIfNotExists(next) {
    if (!self.keyname) {
      self.keyname = 'coreos-cluster';
    }

    self._client.getKey(self.keyname, function(err, key) {
      if (err && err.statusCode !== 404) {
        next(err);
        return;
      }
      else if (err && self.keyname === 'coreos-cluster') {
        self._client.addKey(self.keyname, function(err, keypair) {
          if (err) {
            next(err);
            return;
          }

          self._keypair = keypair;
          next();
        });

        return;
      }

      next();
    });
  }

  function getServiceDiscoveryUrl(next) {
    function getClusterToken() {
      self._clusterToken = self.discoveryServiceUrl.match('([0-9a-f]{32,32})')[0];
      next();
    }

    if (!self.discoveryServiceUrl) {
      request(self.newDiscoveryServiceUrl, function(err, resp, body) {
        if (err) {
          next(err);
          return;
        }

        self.discoveryServiceUrl = body;
        getClusterToken();
      });

      return;
    }

    getClusterToken();
  }

  async.parallel([
    loadImages,
    loadFlavors,
    createKeyIfNotExists,
    getServiceDiscoveryUrl,
  ], function(err) {
    if (err) {
      callback(err);
      return;
    }

    self._initialized = true;

    cloudConfig.getCloudConfig({
      privateNetwork: self.privateNetwork,
      monitoringToken: self.monitoringToken,
      ephemeral: self.ephemeral,
      update: self.update,
      discoveryServiceUrl: self.discoveryServiceUrl,
      region: self._credentials.region
    }, function(err, config) {
      if (err) {
        callback(err);
        return;
      }

      self._cloudConfig = config;
      callback();
    });
  });
};

Cluster.prototype._waitForServers = function(callback) {
  var self = this;

  async.each(Object.keys(this._servers), function(name, next) {
    var server = self._servers[name];

    server.setWait({ status: server.STATUS.running }, 5000, 90000, function(err) {
      if (err) {
        next(err);
        return;
      }

      self._servers[name].refresh(next);
    });
  }, callback);
};

Cluster.prototype.addNodes = function(number, callback) {
  var self = this, names = [],
    networks = [
      {
        "uuid": "00000000-0000-0000-0000-000000000000"
      },
      {
        "uuid": "11111111-1111-1111-1111-111111111111"
      }
    ],
    metadata = {
      cluster_token: self._clusterToken
    };

  if (self.privateNetwork) {
    networks.push({ uuid: self.privateNetwork });
    metadata.privateNetwork = self.privateNetwork;
  }

  function createServer(name, next) {
    self._client.createServer({
      name: name,
      flavor: self._flavor,
      image: self._image,
      keyname: self.keyname,
      metadata: metadata,
      cloudConfig: self._cloudConfig,
      networks: networks
    }, function(err, server) {
      if (err) {
        next(err);
        return;
      }

      self._servers[name] = server;
      next();
    });
  }

  for (var i = 1; i <= number; i++) {
    names.push(self.basename +
      Math.floor((Date.now() / 1000)) + '-' +
      helpers.pad(i, 2));
  }

  async.each(names, createServer, function(err) {
    if (err) {
      callback(err);
      return;
    }

    self._waitForServers(callback);
  });
};

Cluster.prototype.validateNodeOptions = function(callback) {
  var self = this;

  self._client.getServers(function(err, servers) {
    if (err) {
      callback(err);
      return;
    }

    var clusterMembers = _.filter(servers, function(server) {
      return server.metadata.cluster_token && server.metadata.cluster_token === self._clusterToken;
    });

    var length = clusterMembers.length;

    clusterMembers = _.filter(clusterMembers, function(server) {
      return server.metadata.privateNetwork == self.privateNetwork;
    });

    if (clusterMembers.length !== length) {
      callback('Private network settings don\'t match!');
    }
    else {
      callback(null, length);
    }
  });
};

Cluster.prototype.toJSON = function() {
  var self = this;

  var data = _.pick(this, ['type', 'flavor', 'keyname', 'release']);

  data.selectedImage = this._image && this._image.toJSON();
  data.selectedFlavor = this._flavor && this._flavor.toJSON();
  data.createdKeypair = this._keypair;
  data.servers = Object.keys(this._servers).map(function(key) {
    return self._servers[key].toJSON();
  });

  return data;
};

exports.Cluster = Cluster;
