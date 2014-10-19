## coreos-cluster [![Build Status](https://secure.travis-ci.org/kenperkins/coreos-cluster.png?branch=master)](http://travis-ci.org/kenperkins/coreos-cluster) [![NPM version](https://badge.fury.io/js/coreos-cluster.png)](http://badge.fury.io/js/coreos-cluster)

Create a fully functional [CoreOs Cluster](https://coreos.com/using-coreos/) on Rackspace Cloud from any node.js application. A command-line version of `coreos-cluster` is available on npm as [`coreos-cluster-cli`](https://npmjs.org/package/coreos-cluster-cli).

#### Quick Example

```javascript
var cluster = require('coreos-cluster');

cluster.createCluster({
  numNodes: 10,
  type: 'performance',
  release: 'beta',
  keyname: 'my-ssh-keyname',
  credentials: {
    username: 'your-user-name',
    apiKey: 'some-key-here',
    region: 'iad'
  }
}, function(err, results) {
  // will callback with a functional cluster
});
```

### Options

- `numNodes` - required. Number of nodes. Clusters must have at least 3 nodes
- `type` - Optional. `performance` or `onMetal` servers, defaults to `performance` vms
- `release` - Optional. coreos release: `stable` (default), `beta` or `alpha`
- `keyname` - Optional. Rackspace Cloud Servers SSH keyname. If not provided, will create a new ssh key and include in the results
- `flavor` - Optional. The Rackspace Cloud Servers flavor. Defaults to `performance1-1` flavor for `performance` and `onmetal-compute1` for `onMetal`
- `privateNetwork` - Optional. Guid for a rackspace private network. Will configure etcd to use the private network.
- `monitoringToken` - Optional. Will configure the nodes for Rackspace cloud monitoring.
- `discoveryServiceUrl` - Optional. Url for an existing cluster's discovery service. Will add `numNodes` to current cluster instead of create a new cluster.
- `credentials` - Required. The credentials for the create cluster call
  - `username` - Username for your rackspace account
  - `apiKey` - Api key for your rackspace account
  - `region` - Region to create the cluster in
  - `useInternal` - Optional, use local service net interface if calling from Rackspace Cloud machines

### Advanced Usage Example
```javascript
var cluster = require('coreos-cluster');

cluster.createCluster({
  numNodes: 10,
  type: 'performance',
  release: 'beta',
  keyname: 'my-ssh-keyname',
  discoveryServiceUrl: 'https://discovery.etcd.io/some-guid-here',
  privateNetwork: '4c371711-44ae-15ab-86af-45438fb96a15',
  monitoringToken: 'your-monitoring-token',
  updateGroup: '0a809ab1-c01c-4a6b-8ac8-6b17cb9bae09',
  updateServer: 'https://customer.update.core-os.net/v1/update/'
  credentials: {
    username: 'your-user-name',
    apiKey: 'some-key-here',
    region: 'iad'
  }
}, function(err, results) {
  // will callback with a details of the added nodes
});
```

### Installation

```
npm install coreos-cluster
```

### Next Steps
As `coreos-cluster` is built on `pkgcloud`, the next step is to add a `provider` option that allows you to use different compute providers within `pkgcloud`.