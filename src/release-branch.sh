#!/bin/bash

# read contents of version.txt
export VERSION=$(cat version.txt)

# Increment version number
export RELEASE_VERSION=$(node -pe "require('semver').inc('${VERSION}', 'patch').trim()")

echo "Version: ${RELEASE_VERSION}"

# Create new branch and check it out
git checkout -b development

# Update version.txt
echo ${RELEASE_VERSION} > version.txt

# Stage only version file, commit and push to remote
git add version.txt
git commit -m "chore: update to version ${RELEASE_VERSION}"
git push -u origin development
echo -e "\n\n\n🚂 Ready for departure 🚂 "

exit 0