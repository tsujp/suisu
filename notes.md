# Resources

- https://github.com/karlseguin/http.zig
- https://richiejp.com/barely-http2-zig (mentions those http/2 downgrade attacks)
- https://richiejp.com/zig-vs-c-mini-http-server (good nuggets of how Zig works)
- https://www.digitalocean.com/community/tutorials/http-1-1-vs-http-2-what-s-the-difference (mentions http/1.1 multiple requests)



-------

// http.zig library basic REST -> JSON-RPC request
// response to the comments in the Varnish Discord
// work on EPF project proposal
// http/1.1 is fine because there are no other links to discover.
//    - https://www.digitalocean.com/community/tutorials/http-1-1-vs-http-2-what-s-the-difference
//      mentions that http/2 vs http/1.1 was that with 1.1 any other resources required to
//      completed the downloaded page (e.g. images, video etc) are given as links and not inline
//      content so further requests have to be made but in the rest wrappers case it's _just_ an
//      api so there will be no other images, videos etc thus http/1.1 is fine.
//    - also mention no http/2 because of the downgrade attacks mentioned in: https://richiejp.com/barely-http2-zig
//      but competent administrators can deploy if they wish behind a proxy downgrading to http/1.1
