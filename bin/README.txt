----------------------------
*)python3 create_binary_dist.py

It collects required packages and pyinstaller with pip, calls pyinstaller and creates a binary artifact, embedded into a tar.gz (linux and macos) or zip archive (win), for the current platform
----------------------------
*) Steps to make a release and upload binary artifacts for win/lin/macos:

1) Given versionNumber inside version.txt, exec: git tag versionNumber; git push repoUrl --tags
2) The previous git command will trigger a GitHub action (make_release.yaml) that will create a GitHub release with "versionNumber" version and with binary artifacts for win/macos/linux.
3) Add changelog in the release description from NEWS.txt, test it and remove the "draft" flag

