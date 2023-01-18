#
# Created (10/01/2023) by Paolo-Prete.
# This file is part of Spontini-Editor project.
#
# Spontini-Editor is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# Spontini-Editor is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Spontini-Editor. If not, see <http://www.gnu.org/licenses/>.
#

#!/bin/bash

PYTHON_VERSION=3.9.1
PYENV_VERSION=2.3.11
UBUNTU_VERSION=18.04

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

#extend permissions of Spontini src tree to the ubuntu user we're going to create inside the docker container (it will have uid=1000)
setfacl -m u:1000:rwx $SCRIPTPATH/..

# create an ubuntu container
docker create ubuntu:$UBUNTU_VERSION

# run the container with mounting Spontini src tree mapped as /Spontini
docker run -v $SCRIPTPATH/..:/Spontini -d --name ubuntu_for_pyinstaller -it ubuntu:$UBUNTU_VERSION

docker exec ubuntu_for_pyinstaller bash -c "\
# avoid apt hangs, see https://dev.to/grigorkh/fix-tzdata-hangs-during-docker-image-build-4o9m
ln -snf /usr/share/zoneinfo/Europe/Rome /etc/localtime && echo 'Europe/Rome' > /etc/timezone
apt update &&
apt install -y sudo curl git gcc make tcl-dev tk-dev libssl-dev libffi-dev libbz2-dev ncurses-dev libreadline-dev wget &&
useradd -ms /bin/bash dummyuser &&
echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers &&
usermod -aG sudo dummyuser &&
su dummyuser &&
curl -LO https://github.com/pyenv/pyenv/archive/refs/tags/v$PYENV_VERSION.tar.gz &&
tar zxvf v$PYENV_VERSION.tar.gz &&
pyenv-$PYENV_VERSION/bin/./pyenv install -v $PYTHON_VERSION &&
cd /Spontini/bin/ &&
~/.pyenv/versions/$PYTHON_VERSION/bin/python3 create_binary_dist.py &&
sudo chmod 777 -R Spontini-Editor*
"
docker stop ubuntu_for_pyinstaller
docker rm ubuntu_for_pyinstaller
