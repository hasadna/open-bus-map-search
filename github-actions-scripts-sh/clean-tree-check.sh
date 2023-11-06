if [[ -n $(git status -s) ]]; then
  echo "ERROR: tree is dirty after $1"
  git status
  exit 1
else
  echo "Working tree is clean."
fi