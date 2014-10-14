var async = require('async'),
    helpers = require('./helpers'),
    pkgcloud = require('pkgcloud'),
    request = require('request'),
    _ = require('lodash');

var Cluster = function(options) {
  options = options || {};

  this.type = helpers.getType(options.type);
  this.version = helpers.getVersion(options.version);
  this.flavor = helpers.getFlavor(options.flavor, this.type);
  this.size = helpers.getClusterSize(options.size);
  this.keyname = options.keyname;

  // default cloud config, ideally we should support replacing
  this.cloudConfig = '#cloud-config \n \
  coreos: \n \
    etcd: \n \
      # generate a new token for each unique cluster from https://discovery.etcd.io/new \n \
      discovery: {discovery_url} \n \
      # multi-region and multi-cloud deployments need to use $public_ipv4 \n \
      # feel free to switch to $private_ipv4 \n \
      addr: $public_ipv4:4001 \n \
      peer-addr: $public_ipv4:7001 \n \
    fleet: \n \
      metadata: provider=rackspace,region={region} \n \
    units: \n \
      - name: etcd.service \n \
        command: start \n \
      - name: fleet.service \n \
        command: start \n \
    update: \n \
      group: stable';

  this.discoveryUrl = options.discoveryUrl || 'https://discovery.etcd.io/new';

  // local values
  this._initialized = false;
  this._servers = {};
  this._config = pkgcloud.providers.rackspace.getConfig();
  this._client = pkgcloud.compute.createClient(this._config);
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
          'coreos (' + self.version + ')';

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
    request(self.discoveryUrl, function(err, resp, body) {
      if (err) {
        next(err);
        return;
      }

      self._serviceDiscoveryUrl = body;
      next();
    });
  }
  async.parallel([
    loadImages,
    loadFlavors,
    createKeyIfNotExists,
    getServiceDiscoveryUrl
  ], function(err) {
    if (err) {
      callback(err);
      return;
    }

    self._initialized = true;
    callback();
  });
};

Cluster.prototype.provision = function(callback) {
  var self = this;

  if (!self._initialized) {
    self.initialize(function(err) {
      if (err) {
        callback(err);
        return;
      }

      self.provision(callback);
    });

    return;
  }

  var names = [];

  function createServer(name, next) {
    self._client.createServer({
      name: name,
      flavor: self._flavor,
      image: self._image,
      keyname: self.keyname,
      cloudConfig: self.getTemplate()
    }, function(err, server) {
      if (err) {
        next(err);
        return;
      }

      self._servers[name] = server;
      next();
    });
  }

  for (var i = 1; i <= self.size; i++) {
    names.push('coreos-cluster-' + helpers.pad(i, 2));
  }

  async.each(names, createServer, function(err) {
    if (err) {
      callback(err);
      return;
    }

    self._waitForServers(callback);
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

Cluster.prototype.getTemplate = function() {
  var template = this.cloudConfig;

  template = template.replace('{region}', this._config.region);
  template = template.replace('{discovery_url}', this._serviceDiscoveryUrl);

  return new Buffer(template).toString('base64');
};

Cluster.prototype.toJSON = function() {
  var self = this;

  var data = _.pick(this, ['type', 'flavor', 'keyname', 'size', 'version']);

  data.selectedImage = this._image && this._image.toJSON();
  data.selectedFlavor = this._flavor && this._flavor.toJSON();
  data.createdKeypair = this._keypair;
  data.servers = Object.keys(this._servers).map(function(key) {
    return self._servers[key].toJSON();
  });

  return data;
};

exports.Cluster = Cluster;
