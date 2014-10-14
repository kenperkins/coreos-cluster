## coreos-cluster [![Build Status](https://secure.travis-ci.org/kenperkins/coreos-cluster.png?branch=master)](http://travis-ci.org/kenperkins/coreos-cluster) [![NPM version](https://badge.fury.io/js/coreos-cluster.png)](http://badge.fury.io/js/coreos-cluster)

Create a fully functional core-os cluster on Rackspace Cloud from any node.js application. A command-line version of `coreos-cluster` is available on npm as [`coreos-cluster-cli`](https://npmjs.org/package/coreos-cluster-cli).

#### Quick Example

```javascript
var cluster = require('coreos-cluster');

cluster.createCluster({
  size: 10,
  type: 'performance',
  version: 'beta',
  keyname: 'my-ssh-keyname'
}, function(err, results) {
  // will callback with a functional cluster
});
```

### Options

- `size` - Optional. Size of the cluster in nodes, minimum/default of 3
- `type` - Optional. `performance` or `onMetal` servers, defaults to `performance` vms
- `version` - Optional. coreos version: `stable` (default), `beta` or `alpha`
- `keyname` - Optional. Rackspace Cloud Servers SSH keyname. If not provided, will create a new ssh key and include in the results
- `flavor` - Optional. The Rackspace Cloud Servers flavor. Defaults to `performance1-1` flavor for `performance` and `onmetal-compute1` for `onMetal`

### Rackspace Cloud Credentials
`coreos-cluster` is built on `pkgcloud@1.0.0` and will now make use of environment variables for the Rackspace credentials:

- `PKGCLOUD_RACKSPACE_USERNAME` - Your rackspace username
- `PKGCLOUD_RACKSPACE_APIKEY` - API Key for your account
- `PKGCLOUD_RACKSPACE_PASSWORD` - Password may be used in lieu of API key
- `PKGCLOUD_RACKSPACE_REGION` - Region for the coreos cluster
- `PKGCLOUD_RACKSPACE_AUTH_URL` - Optional. Use an alternate authentication endpoint. See the [Rackspace Endpoints](http://docs.rackspace.com/servers/api/v2/cn-devguide/content/auth_endpoints.html) for more endpoint information.
- `PKGCLOUD_RACKSPACE_USE_INTERNAL` - Optional. Use the local service interface if calling from a Rackspace cloud server

### Installation

```
npm install coreos-cluster
```

### Next Steps
As `coreos-cluster` is built on `pkgcloud`, the next step is to add a `provider` option that allows you to use different compute providers within `pkgcloud`.