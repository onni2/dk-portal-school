# Docker — How To Guide

## What is this?

Docker packages the app into a small container that can run anywhere — your machine, a server, the cloud. You don't need Node installed to run it.

---

## How to build it

```bash
docker build -t dk-portal .
```

This builds the app and creates an image called `dk-portal`. It takes about a minute the first time (faster after that because Docker caches the steps).

### With a specific API token

The API token gets baked in at build time. To pass it:

```bash
docker build -t dk-portal --build-arg VITE_API_TOKEN=your-token-here .
```

---

## How to run it

```bash
docker run -p 8080:80 dk-portal
```

Now open your browser and go to: **http://localhost:8080**

To stop it: press `Ctrl+C` in the terminal.

---

## How to test that it works

1. Open http://localhost:8080 — you should see the portal
2. Click around the sidebar — pages should load
3. **Important:** refresh the page while on a sub-page (like `/projects`) — it should still work, not show a nginx error. If this works, the routing is set up correctly.

---

## Common problems

### "Port already in use"

Something else is running on port 8080. Either stop it or use a different port:

```bash
docker run -p 9090:80 dk-portal
```

Then visit http://localhost:9090 instead.

### "I changed code but the container shows the old version"

You need to rebuild:

```bash
docker build -t dk-portal .
docker run -p 8080:80 dk-portal
```

Docker doesn't auto-update. Build again after every code change.

### "I don't have Docker installed"

Install Docker Desktop: https://www.docker.com/products/docker-desktop/
