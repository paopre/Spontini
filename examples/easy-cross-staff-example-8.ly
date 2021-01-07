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

#(define pianoStaves 3)

upper = {

%%%%%%%%%%%%%%%
%% MEASURE 1 %%
%%%%%%%%%%%%%%%

\time 3/4

<<
\setCrossStaves "middleI" "lower"
\easyCrossStaff %TMODE
  { \CS c''8[ \CS c''] \CS }
  { \CS s     \CS c'   \CS }
#'( \CS U     \CS -    \CS )

\\
\crossStaffTableVoice "upper"
{ s4 }
>>

<<
\setCrossStaves "upper" "middleI"
\easyCrossStaff %TMODE
  { \CS c''8[ \CS c''] \CS }
  { \CS s     \CS c'   \CS }
#'( \CS U     \CS -    \CS )

\\
\crossStaffTableVoice "lower"
{ s4 }
>>

<<
\setCrossStaves "upper" "lower"
\easyCrossStaff %TMODE
  { \CS c''8[ \CS c''] \CS }
  { \CS s8    \CS c'   \CS }
#'( \CS U     \CS -    \CS )

\\
\crossStaffTableVoice "middleI"
{ s4 }
>>

%%%%%%%%%%%%%%%
%% MEASURE 2 %%
%%%%%%%%%%%%%%%

\override Score.NoteColumn.ignore-collision = ##t

<<
\override Score.Beam.concaveness = #20000
\setCrossStaves "upper" "lower"
\easyCrossStaff %TMODE
  { \CS \once \hide Beam s8[ \CS \once \hide NoteHead c'' \CS c''] \CS  }
  { \CS d'8                  \CS s                        \CS s    \CS  }
#'( \CS U                    \CS -                        \CS -    \CS  )

\\
\setCrossStaves "upper" "middleI"
\easyCrossStaff %TMODE
  { \CS s8[                      \CS s  \CS c''] \CS  }
  { \CS \once \hide NoteHead d'8 \CS c' \CS s    \CS  }
#'( \CS U                        \CS -  \CS -    \CS  )
>>

<<
\override Score.Beam.concaveness = #20000
\setCrossStaves "upper" "lower"
\easyCrossStaff %TMODE
  { \CS s8   \CS s \CS d'' \CS  }
  { \CS d'8[ \CS s \CS s]  \CS  }
#'( \CS D    \CS - \CS -   \CS  )

\\
\setCrossStaves "middleI" "lower"
\easyCrossStaff %TMODE
  { \CS s8                    \CS c' \CS \once \hide NoteHead d'' \CS  }
  { \CS \once \hide Beam d'8[ \CS s  \CS s]                       \CS  }
#'( \CS D                     \CS -  \CS -                        \CS  )
>>

} %end upper
middleI = { }
lower   = { }

\include "../lib/ly/piano-template.ly"