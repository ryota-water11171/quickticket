const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { getPublishedEvents } = require("./src/events");
const { getEventById } = require("./src/event-detail");


const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

const server = http.createServer(async (req, res) => {
  let pathname;

  try {
    pathname = new URL(req.url, "http://localhost").pathname;
  } catch {
    res.writeHead(400);
    return res.end("Bad Request");
  }

  if (pathname === "/api/events") {
    if (req.method !== "GET") {
      res.writeHead(405, {
        "Content-Type": "application/json; charset=utf-8",
        "Allow": "GET"
      });
      return res.end(JSON.stringify({ error: "Method Not Allowed" }));
    }

    try {
      const events = await getPublishedEvents();

      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      });

      return res.end(JSON.stringify(events));
    } catch (error) {
      console.error("Failed to fetch events:", error);

      res.writeHead(500, {
        "Content-Type": "application/json; charset=utf-8"
      });

      return res.end(
        JSON.stringify({ error: "Internal Server Error" })
      );
    }
  }









  const eventMatch = pathname.match(/^\/api\/events\/([^/]+)$/);

  if (eventMatch) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
      res.writeHead(405, { Allow: "GET" });
      return res.end(
        JSON.stringify({ error: "Method Not Allowed" })
      );
    }

    const eventId = eventMatch[1];

    if (!/^[1-9]\d*$/.test(eventId)) {
      res.writeHead(400);
      return res.end(
        JSON.stringify({ error: "Invalid event ID" })
      );
    }

    try {
      const event = await getEventById(eventId);

      if (!event) {
        res.writeHead(404);
        return res.end(
          JSON.stringify({ error: "Event not found" })
        );
      }

      res.writeHead(200);
      return res.end(JSON.stringify(event));
    } catch (error) {
      console.error("Failed to fetch event:", error);

      res.writeHead(500);
      return res.end(
        JSON.stringify({ error: "Internal Server Error" })
      );
    }
  }





  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end("Method Not Allowed");
  }

  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400);
    return res.end("Bad Request");
  }

  const filePath = path.resolve(
    PUBLIC_DIR,
    "." + (decodedPath === "/" ? "/index.html" : decodedPath)
  );

  if (
    filePath !== PUBLIC_DIR &&
    !filePath.startsWith(PUBLIC_DIR + path.sep)
  ) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 500);
      return res.end("File unavailable");
    }

    const contentType =
      mimeTypes[path.extname(filePath).toLowerCase()] ||
      "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType
    });

    if (req.method === "HEAD") {
      return res.end();
    }

    res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`QuickTicket running on port ${PORT}`);
});
