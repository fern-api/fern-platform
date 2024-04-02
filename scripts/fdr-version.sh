latest_tag=$(git tag -l "fdr@*" --sort=-v:refname | head -n1)

hash=$(git describe --always --first-parent)

result="$(echo "$latest_tag" | sed 's/^fdr@//;')"

echo "$result"-"$hash"
