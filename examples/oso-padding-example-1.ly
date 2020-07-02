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
\include "../lib/jssvg.ly"
\include "../lib/oso-padding.ly"

#(set! showEditorStuff "true")

{

\time 1/4

\override Score.TextScript.font-family = #'typewriter

% Default Lilypond order
c'\mf_"text"_>
\break

% (top -> bottom) 1) dynamic 2) articulation 3) text
% NOTE: the object's direction must be explicitly written (we set it with "_")
\resetOSPositions
c' \jsOSOPadder "1" "pads" #'() _\mf \jsOSOPadder "2" "pads" #'(0 0 1.553 0) _> \jsOSOPadder "3" "pads" #'() _"text"
\break

% (top -> bottom) 1) text 2) articulation 3) dynamic
% NOTE: the object's direction must be explicitly written (we set it with "_")
\resetOSPositions
c' \jsOSOPadder "6" "pads" #'(2.947 0 1.848 0) _"text" \jsOSOPadder "4" "pads" #'(0 0 1.526 0) _> \jsOSOPadder "5" "pads" #'() _\mf
\break

% Default Lilypond order
\time 3/4
\once \override TupletBracket.direction = #UP
\ottava #1 \tuplet 3/2 { c'''^> c''' c''' \ottava #0 } c''
\break

% (bottom -> top) 1) OttavaBracket 2) articulation 3) TupletBracket
% NOTE: for objects declared *before* the corresponding note (tuplet and ottava brackets)
% we must *explicitly* set their positions (and their OSOPadders) as follows
\time 3/4
\resetOSPositions
\setOSPosition #UP 1 Staff.OttavaBracket
\setOSPosition #UP 3 TupletBracket
\jsOSOPadder "7" "pads" #'(0.897 0 2.629 0) Staff.OttavaBracket
\jsOSOPadder "8" "pads" #'(0 0 1.427 0) TupletBracket
\once \override TupletBracket.direction = #UP
\ottava #1 \tuplet 3/2 { c''' \jsOSOPadder "9" "pads" #'() ^> c''' c''' \ottava #0 } c''
\break

}

\paper {
  system-system-spacing.basic-distance = #30
}

\layout {
  \context {
    \Staff
      \override StaffSymbol.output-attributes.gridify = $showEditorStuff
      \override StaffSymbol.output-attributes.gridstep = "3"
  }
}
