%
% Created (24/01/2020) by Paolo-Prete.
% This file is part of Spontini project.
% 
% Spontini is free software: you can redistribute it and/or modify
% it under the terms of the GNU General Public License as published by
% the Free Software Foundation, either version 3 of the License, or
% (at your option) any later version.
% Spontini is distributed in the hope that it will be useful,
% but WITHOUT ANY WARRANTY; without even the implied warranty of
% MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
% GNU General Public License for more details.
%
% You should have received a copy of the GNU General Public License
% along with Spontini. If not, see <http://www.gnu.org/licenses/>.
%

\include "../lib/JSSVG.ly"
\include "../lib/EasyCrossStaff.ly"
\version "2.19.84"

upper = {

% Use a combination of "\hiddenTuplet" and "\tupletDown/Up"
\easyCrossStaff %TMODE
  { \hiddenTuplet 3/2 { s8 \CS c' \CS s }   \CS }
  { \tupletDown 3/2 { c'8[ \CS c' \CS d'] } \CS }
#'( D                      \CS -  \CS -     \CS )

\easyCrossStaff %TMODE
  { c'8[ \CS c'] \CS }
  { s8   \CS s   \CS }
#'( N    \CS -   \CS )

\easyCrossStaff %TMODE
  { c'8 \CS s   \CS }
  { s8[ \CS c'] \CS }
#'( D   \CS -   \CS )

\easyCrossStaff %TMODE
  { s     \CS s   \CS }
  { c'8_[ \CS c'] \CS }
#'( N     \CS -   \CS )

\easyCrossStaff %TMODE
  { s8[ \CS c'] \CS }
  { c'8 \CS s   \CS }
#'( U   \CS -   \CS )

\easyCrossStaff %TMODE
  { c'8[ \CS c'] \CS }
  { s8   \CS s   \CS }
#'( N    \CS -   \CS )

\easyCrossStaff %TMODE
  { c'8[ \CS s] \CS }
  { s8   \CS c' \CS }
#'( U    \CS -  \CS )

\easyCrossStaff %TMODE
  { s    \CS s   \CS }
  { c'8[ \CS c'] \CS }
#'( N    \CS -   \CS )

\easyCrossStaff %TMODE
  { s8          \CS c'] \CS }
  { <c'' e''>8[ \CS s   \CS }
#'( C           \CS -   \CS )

\easyCrossStaff %TMODE
  { c'8[ \CS s   \CS }
  { s8   \CS c'] \CS }
#'( C    \CS -   \CS )

\easyCrossStaff %TMODE
  { c'8[ \CS s   \CS c'4 \CS c' \CS c' \CS }
  { s8   \CS c'] \CS c'4 \CS c' \CS c' \CS }
#'( C    \CS -   \CS U   \CS D  \CS N  \CS )

%%% __LAYOUT__ %%%

#(define l2 #{
\sustainOff
#})

#(define l1 #{
\sustainOn\mf_"espressivo"
#})

%%%%%%%%%%%%%%%%%%

\easyCrossStaff %TMODE
  { c'4     \CS s     \CS }
  { c'4 $l1 \CS r $l2 \CS }
#'( D       \CS -     \CS )

} %end upper                                                                                                                                                                                                                                                                            
lower = { }

\include "../lib/PianoTemplate.ly"