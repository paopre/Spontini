% set autoformat off
%
% Created (24/01/2020) by Paolo-Prete.
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
\version "2.19.84"

upper = {

% Use a combination of "\hiddenTuplet" and "\tupletDown/Up"
\easyCrossStaff %TMODE
  { \CS \hiddenTuplet 3/2 { s8 \CS e' \CS s }   \CS }
  { \CS \tupletDown 3/2 { c'8[ \CS c' \CS d'] } \CS }
#'( \CS D                      \CS -  \CS -     \CS )

\easyCrossStaff %TMODE
  { \CS c'8[ \CS c'] \CS }
  { \CS s8   \CS s   \CS }
#'( \CS N    \CS -   \CS )

\easyCrossStaff %TMODE
  { \CS c'8 \CS s   \CS }
  { \CS s8[ \CS c'] \CS }
#'( \CS D   \CS -   \CS )

\easyCrossStaff %TMODE
  { \CS s     \CS s   \CS }
  { \CS c'8_[ \CS c'] \CS }
#'( \CS N     \CS -   \CS )

\easyCrossStaff %TMODE
  { \CS s8[ \CS c'] \CS }
  { \CS c'8 \CS s   \CS }
#'( \CS U   \CS -   \CS )

\easyCrossStaff %TMODE
  { \CS c'8[ \CS c'] \CS }
  { \CS s8   \CS s   \CS }
#'( \CS N    \CS -   \CS )

\easyCrossStaff %TMODE
  { \CS c'8[ \CS s] \CS }
  { \CS s8   \CS c' \CS }
#'( \CS U    \CS -  \CS )

\easyCrossStaff %TMODE
  { \CS s    \CS s   \CS }
  { \CS c'8[ \CS c'] \CS }
#'( \CS N    \CS -   \CS )

\easyCrossStaff %TMODE
  { \CS s8          \CS c'] \CS }
  { \CS <c'' e''>8[ \CS s   \CS }
#'( \CS C           \CS -   \CS )

\easyCrossStaff %TMODE
  { \CS c'8[ \CS s   \CS }
  { \CS s8   \CS c'] \CS }
#'( \CS C    \CS -   \CS )

\easyCrossStaff %TMODE
  { \CS c'8[ \CS s   \CS c'4 \CS c' \CS c' \CS }
  { \CS s8   \CS c'] \CS c'4 \CS c' \CS c' \CS }
#'( \CS C    \CS -   \CS U   \CS D  \CS N  \CS )

%----------------%
% START __VARS__ %
%----------------%

#(define v2 #{
\sustainOff
#})

#(define v1 #{
\sustainOn\mf_"espressivo"
#})

%----------------%
% END __VARS__   %
%----------------%

\easyCrossStaff %TMODE
  { \CS c'4     \CS s     \CS }
  { \CS c'4 $v1 \CS r $v2 \CS }
#'( \CS D       \CS -     \CS )

} %end upper
lower = { }

\include "../lib/ly/piano-template.ly"