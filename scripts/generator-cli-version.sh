# Get the latest tag
latest_tag=$(git tag -l "generator-cli@*" --sort=-v:refname | head -n1)

# Get the commit hash of the latest tag
tag_commit=$(git rev-list -n 1 $latest_tag)

# Get the current commit hash
current_commit=$(git rev-parse HEAD)

# Extract the version number from the tag
result=$(echo "$latest_tag" | sed 's/^generator-cli@//')

# Check if the latest tag is on the current commit
if [ "$tag_commit" = "$current_commit" ]; then
    echo "$result"
else
    # If not, append the short hash
    hash=$(git describe --always --first-parent)
    echo "$result-$hash"
fi