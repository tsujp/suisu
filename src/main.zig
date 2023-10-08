const std = @import("std");
const httpz = @import("httpz");

pub fn main() !void {
    // Prints to stderr (it's a shortcut based on `std.io.getStdErr()`)
    std.debug.print("All your {s} are belong to us.\n", .{"codebase"});

    // stdout is for the actual output of your application, for example if you
    // are implementing gzip, then only the compressed bytes should be sent to
    // stdout, not any debugging messages.
    const stdout_file = std.io.getStdOut().writer();
    var bw = std.io.bufferedWriter(stdout_file);
    const stdout = bw.writer();

    try stdout.print("Run `zig build test` to run the tests.\n", .{});

    try bw.flush(); // don't forget to flush!

    // ------ REST
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();

    var server = try httpz.Server().init(allocator, .{ .port = 5882 });
    server.notFound(notFound);

    var router = server.router();
    router.get("/api/user/:id", getUser);

    try server.listen();
}

// const uri = std.Uri.parse("https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178") catch unreachable;
const uri = std.Uri.parse("https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178") catch unreachable;
fn getUser(req: *httpz.Request, res: *httpz.Response) !void {
    // Status code 200 is implicit.

    // Pretend this function is `getNet` (rename stuff later).
    // Want to issue 3 seperate RPC requests for:
    // net_listening ; net_peerCount ; net_version
    // Want to do a chunked response so the client has immediate access to data as it comes in
    //   since this request is effectively a JOIN on different backend RPC methods.

    // Using req.arena (std.mem.Allocator) which allows us to allocate memory that only exists for the lifetime
    //   of this request (since Httpz handles the deinit no `defer` here).
    var client: std.http.Client = .{ .allocator = req.arena };
    var headers: std.http.Headers = .{ .allocator = req.arena };
    try headers.append("Content-Type", "application/json");

    // Ditto no `defer` since `req.arena`.
    var backend_req = try client.request(.POST, uri, headers, .{});

    try backend_req.start();

    // To POST data we write data into the request. This also requires us setting the request content length. If
    //   we don't know the content length we can specify chunked encoding.
    backend_req.transfer_encoding = .chunked;

    // POST body.
    try backend_req.writer().writeAll(
        \\{"jsonrpc":"2.0","method":"net_peerCount","params": [],"id":1}
    );

    // Send final (empty) chunk so upstream server knows we're done sending.
    try backend_req.finish();

    // Wait for upstream server response.
    try backend_req.wait();

    // `backend_req.response.status == .ok`

    // curl https://mainnet.infura.io/v3/YOUR-API-KEY \
    //   -X POST \
    //   -H "Content-Type: application/json" \
    //   -d '{"jsonrpc":"2.0","method":"net_peerCount","params": [],"id":1}'
    try res.json(.{ .backend_status = backend_req.response.status, .foo = "Bar" }, .{});

    // Original line from tutorial.
    // try res.json(.{ .id = req.param("id").?, .name = "Ted" }, .{});

}

fn notFound(_: *httpz.Request, res: *httpz.Response) !void {
    res.status = 404;
    res.body = "Not found";
}

test "simple test" {
    var list = std.ArrayList(i32).init(std.testing.allocator);
    defer list.deinit(); // try commenting this out and see if zig detects the memory leak!
    try list.append(42);
    try std.testing.expectEqual(@as(i32, 42), list.pop());
}
