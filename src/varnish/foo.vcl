vcl 4.1;

import json;

# VCL is transformed into C when Varnish loads.

# Varnish admin console `varnishadm`, user needs to read `/etc/varnish/secret` to authenticate.
# From the admin console can:
#   - Stop/start cache process.
#   - Load VCL.
#   - Adjust built-in load balancer and invalidate cached content.

# Varnish logs to a chunk of memory (not disk), use `varnishlog` to read logs.

# Varnish can join several backends together into clusters of backends for load balancing.

# A `backend` is the source of the content Varnish is caching.
backend default {
	# This is the backend forwarded to NOT what Varnish is listening to connections on.
    .host = "www.varnish-cache.org";
    .port = "80";
}
