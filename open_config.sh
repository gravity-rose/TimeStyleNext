#!/bin/bash
# Opens the Clay config page for the running emulator
# Usage: ./open_config.sh [platform]
PLATFORM=${1:-emery}

# Clean up old instances
pkill -f "config_server.py" 2>/dev/null
pkill -f "emu-app-config" 2>/dev/null
sleep 1

# Get the config URL from emu-app-config
echo "Getting config page from emulator..."
TMPFILE=$(mktemp)
pebble emu-app-config --emulator "$PLATFORM" > "$TMPFILE" 2>&1 &
EMU_PID=$!

# Wait for URL
for i in $(seq 1 15); do
    grep -q "CONFIG URL" "$TMPFILE" 2>/dev/null && break
    sleep 1
done

if ! grep -q "CONFIG URL" "$TMPFILE" 2>/dev/null; then
    echo "ERROR: Timed out. Is the emulator running with the app installed?"
    kill $EMU_PID 2>/dev/null
    rm -f "$TMPFILE"
    exit 1
fi

# Get the callback port that emu-app-config is listening on
CBPORT=$(ss -tlnp 2>/dev/null | grep '"pebble"' | grep -oP ':\K\d+' | head -1)

# Decode and serve the config page
python3 "$(dirname "$0")/config_server.py" "$TMPFILE" "$CBPORT" &
SERVER_PID=$!

sleep 3
PORT=$(ss -tlnp 2>/dev/null | grep "pid=$SERVER_PID" | grep -oP ':\K\d+' | head -1)

echo ""
echo "  Config page: http://localhost:$PORT/"
echo "  Callback port: $CBPORT (emu-app-config PID $EMU_PID)"
echo ""
echo "  Open the URL above, make changes, hit Save."
echo "  Press Ctrl+C when done."
echo ""

# Wait for either process to exit
wait $EMU_PID 2>/dev/null
kill $SERVER_PID 2>/dev/null
rm -f "$TMPFILE"
