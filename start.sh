#!/bin/bash
# ============================================================
#  Hermes AI Trading OS — Linux Startup Script
#  Runs all 3 services in a tmux session with split panes
# ============================================================

SESSION="hermes"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill existing session if running
tmux kill-session -t $SESSION 2>/dev/null

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       HERMES AI TRADING OS — STARTING UP         ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Project: $PROJECT_DIR"
echo ""

# Check PostgreSQL
echo "[ 1/4 ] Checking PostgreSQL..."
if pg_isready -q 2>/dev/null; then
    echo "        ✅ PostgreSQL is running"
else
    echo "        ⚠️  PostgreSQL not detected — engine may fail to start"
    echo "        Run: sudo service postgresql start"
fi

# Check Python dependencies
echo "[ 2/4 ] Checking Python packages..."
if python3 -c "import fastapi, uvicorn, asyncpg" 2>/dev/null; then
    echo "        ✅ Python packages OK"
else
    echo "        📦 Installing Python packages..."
    pip install -r "$PROJECT_DIR/ai_engine/requirements.txt" -q
fi

# Check Node dependencies
echo "[ 3/4 ] Checking Node packages..."
if [ -d "$PROJECT_DIR/client/node_modules" ]; then
    echo "        ✅ Node packages OK"
else
    echo "        📦 Installing Node packages..."
    cd "$PROJECT_DIR" && npm install -q
    cd "$PROJECT_DIR/client" && npm install -q
fi

echo "[ 4/4 ] Starting services in tmux..."
echo ""

# Create tmux session
tmux new-session -d -s $SESSION -x 220 -y 50

# ── Window 1: AI Engine (FastAPI port 8000) ──
tmux rename-window -t $SESSION:0 "AI-Engine"
tmux send-keys -t $SESSION:0 "
echo ''; echo '🤖 HERMES AI ENGINE — FastAPI on :8000'; echo ''
cd $PROJECT_DIR/ai_engine
python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
" Enter

# ── Window 2: React Frontend (port 5173) ──
tmux new-window -t $SESSION -n "Frontend"
tmux send-keys -t $SESSION:1 "
echo ''; echo '🖥  REACT FRONTEND — Vite on :5173'; echo ''
cd $PROJECT_DIR/client
npm run dev
" Enter

# ── Window 3: Express Server (port 3001) ──
tmux new-window -t $SESSION -n "Server"
tmux send-keys -t $SESSION:2 "
echo ''; echo '⚡ EXPRESS SERVER — Node on :3001'; echo ''
cd $PROJECT_DIR/server
npm run dev
" Enter

# ── Window 4: Logs monitor ──
tmux new-window -t $SESSION -n "Status"
tmux send-keys -t $SESSION:3 "
echo ''
echo '══════════════════════════════════════════'
echo '  HERMES AI TRADING OS — ALL SERVICES UP'
echo '══════════════════════════════════════════'
echo ''
echo '  🌐 Frontend   →  http://localhost:5173'
echo '  🤖 AI Engine  →  http://localhost:8000'
echo '  ⚡ API Server  →  http://localhost:3001'
echo ''
echo '  📈 AI Fund page → http://localhost:5173/ai-fund'
echo ''
echo '  tmux windows:'
echo '    [0] AI-Engine   [1] Frontend'
echo '    [2] Server      [3] Status (this window)'
echo ''
echo '  Switch windows: Ctrl+B then 0/1/2/3'
echo '  Detach tmux:    Ctrl+B then D'
echo '  Kill session:   tmux kill-session -t hermes'
echo ''
echo 'Waiting 5s for services to start...'
sleep 5
echo ''
echo 'Health check:'
curl -s http://localhost:8000/health && echo ' ✅ AI Engine OK' || echo ' ❌ AI Engine not ready yet (wait a few more seconds)'
" Enter

# Go back to window 0 (AI Engine) to show startup logs
tmux select-window -t $SESSION:0

echo "✅ All services starting in tmux session: '$SESSION'"
echo ""
echo "  View logs:    tmux attach -t hermes"
echo "  Frontend:     http://localhost:5173"
echo "  AI Engine:    http://localhost:8000"
echo "  AI Fund page: http://localhost:5173/ai-fund"
echo ""

# Auto-attach to the session
tmux attach -t $SESSION
