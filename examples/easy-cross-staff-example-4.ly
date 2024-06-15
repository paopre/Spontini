% set autoformat off
%
% Created (24/06/2020) by Paolo-Prete.
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

\include "../lib/ly/tabular-functions.ly"
\include "../lib/ly/misc.ly"
\version "2.19.84"

upper = {

<<

%% LAYER 1
\easyCrossStaff #blue %TMODE
  { \CS s8    \CS  s   \CS g'] \CS }
  { \CS e''8[ \CS  f'' \CS s   \CS }
#'( \CS C     \CS  -   \CS -   \CS )

\\
%% LAYER 2
\crossStaffTableVoice #red "upper"
{ \stemUp e''8[ e'' e''] }

\\
%% LAYER 3
\crossStaffTableVoice #green "lower"
{ \stemDown a'8[ a' a'] }

>>

} %end upper
lower = { }

\include "../lib/ly/piano-template.ly"