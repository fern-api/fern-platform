latest_tag=$(git tag -l "generator-cli@*" --sort=-v:refname | head -n1)

hash=$(git describe --always --first-parent)

result="$(echo "$latest_tag" | sed 's/^generator-cli@//;')"

echo "$result"-"$hash"
