#!/bin/bash
# Opens the Clay config page for the running emulator
# Usage: ./open_config.sh [platform]
PLATFORM=${1:-emery}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Clean up old instances
ps aux | grep -E "config_server.py|emu-app-config" | grep -v grep | awk '{print $2}' | xargs -r kill 2>/dev/null
sleep 1

# Serve the config page over HTTP
python3 "$SCRIPT_DIR/config_server.py" "$SCRIPT_DIR/config_page.html" "$PLATFORM" &
SERVER_PID=$!
sleep 2

# Get the server URL
PORT=$(ss -tlnp 2>/dev/null | grep "pid=$SERVER_PID" | grep -oP ':\K\d+' | head -1)

if [ -z "$PORT" ]; then
    echo "ERROR: Config server failed to start."
    exit 1
fi

URL="http://localhost:$PORT/"
echo ""
echo "  Config page: $URL"
echo "  Platform: $PLATFORM"
echo "  Server PID: $SERVER_PID"
echo ""
echo "  Save applies settings and keeps the server running."
echo "  Press Ctrl+C when done."
echo ""

# Open in browser
wslview "$URL" 2>/dev/null || xdg-open "$URL" 2>/dev/null || echo "Open $URL in your browser."

wait $SERVER_PID 2>/dev/null
