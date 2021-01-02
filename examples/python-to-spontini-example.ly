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

%{

# Select the below Python3 snippet,
# including the line with the block definition ( #__BLOCK__1 )
# then execute "Python to Spontini" in the "TOOLS" menu:
# the output of the script will be pasted inside the corresponding block in the
# .ly text. Then press "COMPILE" button

#__BLOCK__1
expr = ' '
for i in range (8):
	expr +='a '
print(expr, end='')

%}

% Note:
% the block syntax in the .ly file must be: %{__BLOCK__blocknum%} %{%}
% blocknum can be any number}

{
%{__BLOCK__1%} %{%}
}