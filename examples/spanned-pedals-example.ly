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

\version "2.19.83"
\include "../lib/ly/jssvg.ly"
\include "../lib/ly/oso-padding.ly"
\include "../lib/ly/tabular-functions.ly"
#(define showEditorStuff "true")

upper = {

\time 2/4
\set Score.pedalSustainStyle = #'mixed
\override Score.TextScript.font-family = #'typewriter

#(define l1 #{

\resetOSPositions
% START POSITION DOWN WILL BE "6"
\incrPositions #DOWN 5
\setOSPosition #DOWN 7 Score.SustainPedalLineSpanner
\setOSPosition #DOWN 9 Score.SostenutoPedalLineSpanner

#})

#(define l2 #{

\jsOSOPadder "4" "pads" #'(0 0 1.799 0) _\mp
_\sustainOn
\jsOSOPadder "5" "pads" #'(0.415 0 2.26 0) _\OSBox
_\sostenutoOn
\jsOSOPadder "3" "pads" #'(0 0 3.489 0) _\OSBox

#})

\easyCrossStaff %TMODE
  { c'2       \CS c' \CS c'\break \CS }
  { $l1 s $l2 \CS s  \CS s        \CS }
#'( U         \CS -  \CS -        \CS )

\break

#(define l2 #{

\resetOSPositions
\jsOSOPadder "6" "pads" #'()_>
\jsOSOPadder "7" "pads" #'() _\mf
\jsOSOPadder "1" "pads" #'(0 0.039 2.995 0) _"Handle pedals with care"
\tweakOSPosition 7 \jsPadder "8" "pads" #'(0 0 5.632 0) _\OSBox
% Alternatively:
% \incrPositions #DOWN 3 \jsOSOPadder "8" "pads" #'(0 0 5.632 0) _\OSBox

#})

\easyCrossStaff %TMODE
  { c'    \CS c'            \CS c'              \CS }
  { s $l2 \CS s_\sustainOff \CS s_\sostenutoOff \CS }
#'( U     \CS -             \CS -               \CS )

}

lower = {}

\layout {
  \context {
    \Staff
      \override StaffSymbol.output-attributes.gridify = $showEditorStuff
      \override StaffSymbol.output-attributes.gridstep = "1"
      \override StaffSymbol.output-attributes.gridcolor = "#f0eee9"
  }
}

\include "../lib/ly/piano-template.ly"