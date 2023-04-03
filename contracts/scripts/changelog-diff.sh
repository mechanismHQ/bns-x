for changelog in $(find . -name "CHANGELOG.md"); do
  combined_diff=""
  for commit in $(git log --since="1 week ago" | grep "^commit" | awk '{print $2}'); do
    diff_output=$(git diff $commit^..$commit -- $changelog | grep '^+' | grep -v '+++' | sed 's/^+//')
    if [ ! -z "$diff_output" ]; then
      combined_diff+=$'\n'"$diff_output"
    fi
  done
  if [ ! -z "$combined_diff" ]; then
    echo "----------------------------------------"
    echo -e $'\n'"$changelog"
    echo -e "$combined_diff"
  fi
done