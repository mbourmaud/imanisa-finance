#!/bin/bash
# Ralph Monitor - Affiche le status des agents Ralph en cours

WORKTREES=(
  "/Users/fr162241/Projects/imanisa-finance-security"
)

while true; do
  clear
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                    🤖 RALPH MONITOR                          ║"
  echo "╠══════════════════════════════════════════════════════════════╣"

  for wt in "${WORKTREES[@]}"; do
    if [ -d "$wt" ]; then
      branch=$(cd "$wt" && git branch --show-current 2>/dev/null)

      if [ -f "$wt/ralph-status.json" ]; then
        status=$(cat "$wt/ralph-status.json" 2>/dev/null)
        current=$(echo "$status" | grep -o '"current_story": "[^"]*"' | cut -d'"' -f4)
        completed=$(echo "$status" | grep -o '"completed": \[[^]]*\]' | grep -o '"SEC-[0-9]*"' | wc -l | tr -d ' ')
        state=$(echo "$status" | grep -o '"status": "[^"]*"' | cut -d'"' -f4)

        # Count total stories from prd.json
        if [ -f "$wt/prd.json" ]; then
          total=$(grep -c '"id": "SEC-' "$wt/prd.json" 2>/dev/null || echo "?")
        else
          total="?"
        fi

        # Status icon
        case $state in
          "in_progress") icon="🔄" ;;
          "completed") icon="✅" ;;
          "error") icon="❌" ;;
          *) icon="⏸️" ;;
        esac

        echo "║  $icon $branch"
        echo "║     Progress: $completed/$total stories"
        echo "║     Current:  $current"
        echo "║     Status:   $state"

        # Show recent commits
        echo "║     Recent commits:"
        cd "$wt" && git log --oneline -3 2>/dev/null | while read line; do
          echo "║       • $line"
        done
      else
        echo "║  ⏳ $branch - Waiting for status..."
      fi
      echo "╠══════════════════════════════════════════════════════════════╣"
    fi
  done

  echo "║  Last refresh: $(date '+%H:%M:%S')                              ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Press Ctrl+C to exit"

  sleep 60
done
