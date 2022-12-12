if [[ `git status --porcelain` ]]; then
    echo "There are changes in the repository:"
    git status
    exit 1
else
    echo "No changes in the repository."
    exit 0
fi