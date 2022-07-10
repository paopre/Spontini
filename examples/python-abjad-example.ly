%
% Created (10/10/2020) by Paolo-Prete.
% This file is part of Spontini-Editor project.
%
% Spontini-Editor is free software: you can redistribute it and/or modify
% it under the terms of the GNU General Public License as published by
% the Free Software Foundation, either version 3 of the License, or
% (at your option) any later version.
% Spontini-Editor is distributed in the hope that it will be useful,
% but WITHOUT ANY WARRANTY; without even the implied warranty of
% MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
% GNU General Public License for more details.
%
% You should have received a copy of the GNU General Public License
% along with Spontini-Editor. If not, see <http://www.gnu.org/licenses/>.
%

% This example shows how to integrate Abjad library (https://abjad.github.io)
% into Spontini-Editor.
%
% 1) Install Abjad (tested with version 3.2) with TOOLS ---> pip3 install ---> abjad==3.2
%
% 2) Select the below Python3 snippet, including the line
%    with the block definition ( #__BLOCK__1 )
%
% 3) Execute TOOLS ---> Python to Spontini:
%    The output of the script will be automatically pasted
%    inside the corresponding block in the edited text.
%
% 4) Press "ENGRAVE" button

%{

#__BLOCK__1
import abjad
duration = abjad.Duration(1, 4)
notes = [abjad.Note(pitch, duration) for pitch in range(8)]
container = abjad.Container(notes)
print("")
abjad.f(container)

%}

% Note:
% the block syntax in the .ly file must be: %{__BLOCK__blockname%}%{%}
% where "blockname" can be any string
\version "2.19.84"
\language "english"
{

%{__BLOCK__1%}%{%}

}