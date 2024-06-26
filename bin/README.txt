----------------------------
*) python3 create_binary_dist.py

It collects required packages and pyinstaller with pip, calls pyinstaller and creates a binary artifact, embedded into a tar.gz (linux and macos) or zip archive (win), for the current platform

----------------------------
*) [LINUX] create_binary_dist_on_docker.sh

This scripts pulls a docker image of an old version of ubuntu, set with $UBUNTU_VERSION, and runs a container for it. Inside this container it downloads and installs, with pyenv, a $PYTHON_VERSION of Python and runs create_binary_dist.py with it. This procedure ensures that the executable (built with pyinstaller) dinamically links a version of Glibc which is enough old so to make the executable compatible with many Linux distros and installations: in fact Glibc has a versioning system that allows backward compatibility (older programs built to run on older versions of glibc will continue to run on new glibc)

----------------------------
*) Steps to make a release and upload binary artifacts for win/lin/macos:

1) Update the release number (releaseNumber) inside lib/version.txt.
2) Update NEWS.txt by putting all the stuff withing the "Development" section inside a new releaseNumber section
3) Create a tag which corresponds to releaseNumber: git tag releaseNumber; git push repoUrl --tags
4) The previous git command will trigger a GitHub action (make_release.yaml) that will create a GitHub release with "releaseNumber" version and with binary artifacts for win/macos/linux.
5) (should be done automagically from GitHub) add changelog in the release description by picking the content of "releaseNumber" from NEWS.txt,
6) test it and remove the "draft" flag

