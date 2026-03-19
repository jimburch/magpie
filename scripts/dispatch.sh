#!/bin/bash
set -eo pipefail

SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
REPO_ROOT="$(git rev-parse --show-toplevel)"

echo "Fetching open issues labeled 'ralph'..."
ISSUES=$(gh issue list --label ralph --state open --json number,title,body,labels,comments --limit 100)

ISSUE_COUNT=$(echo "$ISSUES" | jq 'length')
echo "Found $ISSUE_COUNT open ralph issues."

if [ "$ISSUE_COUNT" -eq 0 ]; then
  echo "No open ralph issues. Nothing to dispatch."
  exit 0
fi

echo "Fetching open RALPH PRs..."
OPEN_PRS=$(gh pr list --state open --json number,title,body,headRefName --limit 100 | jq '[.[] | select(.headRefName | startswith("claude/"))]')
OPEN_PR_COUNT=$(echo "$OPEN_PRS" | jq 'length')
echo "Found $OPEN_PR_COUNT open RALPH PRs."

echo "Fetching in-progress workflow runs..."
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
IN_PROGRESS_RUNS=$(gh run list --workflow=claude-work.yml --status=in_progress --json databaseId -q '.[].databaseId' 2>/dev/null || true)
QUEUED_RUNS=$(gh run list --workflow=claude-work.yml --status=queued --json databaseId -q '.[].databaseId' 2>/dev/null || true)
ALL_RUN_IDS=$(echo -e "${IN_PROGRESS_RUNS}\n${QUEUED_RUNS}" | grep -v '^$' || true)

IN_PROGRESS_TASKS="[]"
if [ -n "$ALL_RUN_IDS" ]; then
  IN_PROGRESS_TASKS="["
  FIRST=true
  while read -r run_id; do
    INPUTS=$(gh api "repos/$REPO/actions/runs/$run_id" --jq '.inputs // empty')
    if [ -n "$INPUTS" ]; then
      if [ "$FIRST" = true ]; then
        FIRST=false
      else
        IN_PROGRESS_TASKS="${IN_PROGRESS_TASKS},"
      fi
      IN_PROGRESS_TASKS="${IN_PROGRESS_TASKS}${INPUTS}"
    fi
  done <<< "$ALL_RUN_IDS"
  IN_PROGRESS_TASKS="${IN_PROGRESS_TASKS}]"
fi

IN_PROGRESS_COUNT=$(echo "$IN_PROGRESS_TASKS" | jq 'length')
echo "Found $IN_PROGRESS_COUNT in-progress/queued tasks."

echo ""
echo "Asking orchestrator to analyze issues and plan tasks..."
echo ""

PROMPT="$(cat "$REPO_ROOT/scripts/dispatch-prompt.md")

## Open Issues

$ISSUES

## Currently In-Progress Tasks

These tasks are already running or queued on GitHub Actions. Do NOT dispatch work that conflicts with or duplicates these.

$IN_PROGRESS_TASKS

## Open RALPH PRs

These PRs were created by previous RALPH runs and are still open (awaiting review/merge). Do NOT dispatch work that duplicates or conflicts with these.

$OPEN_PRS"

RESULT=$(echo "$PROMPT" | claude -p \
  --model sonnet \
  --allowedTools "Read,Grep,Glob")

echo "$RESULT"

# Extract JSON from <task_json> tags in the result
TASKS=$(echo "$RESULT" | sed -n '/<task_json>/,/<\/task_json>/p' | sed '1d;$d')

# Validate we got valid JSON array
if ! echo "$TASKS" | jq -e 'type == "array"' > /dev/null 2>&1; then
  echo ""
  echo "Error: Orchestrator did not return a valid JSON array."
  echo "Raw output:"
  echo "$TASKS"
  exit 1
fi

TASK_COUNT=$(echo "$TASKS" | jq 'length')

if [ "$TASK_COUNT" -eq 0 ]; then
  echo ""
  echo "Orchestrator found no tasks to dispatch."
  exit 0
fi

echo ""
echo "Dispatching $TASK_COUNT tasks:"
echo ""

echo "$TASKS" | jq -c '.[]' | while read -r task; do
  BRANCH_NAME=$(echo "$task" | jq -r '.branch_name')
  ISSUE_NUMBERS=$(echo "$task" | jq -c '.issue_numbers')
  PROMPT=$(echo "$task" | jq -r '.prompt')

  echo "  -> $BRANCH_NAME"
  echo "     Issues: $ISSUE_NUMBERS"
  echo "     Prompt: ${PROMPT:0:100}..."
  echo ""

  gh workflow run claude-work.yml \
    -f branch_name="$BRANCH_NAME" \
    -f issue_numbers="$ISSUE_NUMBERS" \
    -f prompt="$PROMPT"
done

echo "All tasks dispatched. Run 'gh run list --workflow=claude-work.yml' to monitor."
