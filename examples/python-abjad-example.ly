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

% This example shows how to integrate Abjad library ( http://abjad.mbrsi.org/ )
% into Spontini-Editor.
% Install Abjad with TOOLS ---> pip3 install.
% THEN:
% Select the below Python3 snippet,
% including the line with the block definition ( #__BLOCK__1 )
% then execute "Python to Spontini" in the "TOOLS" menu:
% the output of the script will be pasted inside the corresponding block in the
% edited text. Then press "COMPILE" button

%{

#__BLOCK__1

import os
import sys

# this is a hack for filtering an
# Abjad note after import abjad is done
tmpstdout = sys.stdout
f = open(os.devnull, 'w')
sys.stdout = f
import abjad
f.close()
sys.stdout = tmpstdout
# end of the hack

duration = abjad.Duration(1, 4)
notes = [abjad.Note(pitch, duration) for pitch in range(8)]
outStr = str(abjad.Container(notes))
# Remove 'Container("' and ')"' tokens from the string (beginning and end)
# Note that this is a hack, but I could not find a function for getting
# the container's content as a plain string without newlines and brackets
# from the class' API
outStr = outStr[11 : (len(outStr) - 2)]
print(outStr, end='')

%}

% Note:
% the block syntax in the .ly file must be: %{__BLOCK__blocknum%} %{%}
% blocknum can be any number

\version "2.19.84"
\language "english"
{

r1
%{__BLOCK__1%}%{%}
r1

}