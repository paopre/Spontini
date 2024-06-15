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
% along with Spontini-Editor.  If not, see <http://www.gnu.org/licenses/>.
%

\include "../lib/ly/jssvg.ly"
\version "2.19.84"

$(set! showEditorStuff "true")

{

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%&%%
% Brackets are placed with the mouse
% so to hit (on Lilypond version 2.22.0 and 2.23.0)
% the nearest horiz line of the grid
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%
% OTTAVA BRACKET
%%%%%%%%%%%%%%%%%%

\jsOnceOverride "1" "Y-offset" #'(6.600) Staff.OttavaBracket
\ottava #1 c'''4_\markup { \fontsize #-4 Y-offset} c''' c''' \ottava #0
c''''

\jsOnceOverride "2" "padding" #'(3.9) Staff.OttavaBracket
\ottava #1 c'''4_\markup { \fontsize #-4 padding} c''' c''' \ottava #0
r

\jsOnceOverride "3" "staff-padding" #'(4.7) Staff.OttavaBracket
\ottava #1 c'''4_\markup { \fontsize #-4 staff-padding} c''' c''' \ottava #0
r

\jsOnceOverride "4" "outside-staff-padding" #'(3.9) Staff.OttavaBracket
\ottava #1 c'''4_\markup { \fontsize #-4 outside-staff-padding} c''' c''' \ottava #0
r

\break

\once \override Staff.OttavaBracket.direction = #DOWN
\jsOnceOverride "5" "Y-offset" #'(-5.7) Staff.OttavaBracket
\ottava #1 c'''4^\markup {\fontsize #-4 Y-offset} c''' c''' \ottava #0 c,

\once \override Staff.OttavaBracket.direction = #DOWN
\jsOnceOverride "6" "padding" #'(1.700) Staff.OttavaBracket
\ottava #1 c'''4^\markup {\fontsize #-4 padding} c''' c''' \ottava #0
r

\once \override Staff.OttavaBracket.direction = #DOWN
\jsOnceOverride "7" "staff-padding" #'(3.600) Staff.OttavaBracket
\ottava #1 c'''4^\markup {\fontsize #-4 staff-padding} c''' c''' \ottava #0
r

\once \override Staff.OttavaBracket.direction = #DOWN
\jsOnceOverride "8" "outside-staff-padding" #'(1.700) Staff.OttavaBracket
\ottava #1 c'''4^\markup {\fontsize #-4 outside-staff-padding} c''' c''' \ottava #0
r

\break

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% TUPLET BRACKET
% NOTE1: Y-offset is not supported for TupletBracket
% NOTE2: outside-staff-padding is supported
%        only for TupletBrackets against other grobs
%        nearest to the staff
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\once \override TupletBracket.direction = #UP
\jsOnceOverride "9" "padding" #'(7) TupletBracket
\tuplet 3/2 { c'''4_\markup {\fontsize #-4 padding} c'' c'' } r2

\once \override TupletBracket.direction = #UP
\jsOnceOverride "10" "staff-padding" #'(6) TupletBracket
\tuplet 3/2 { c'''4_\markup {\fontsize #-4 staff-padding} c'' c'' } r2

\jsOnceOverride "11" "padding" #'(4.8) TupletBracket
\tuplet 3/2 { c'''4^\markup {\fontsize #-4 padding} c'' c'' } r2

\jsOnceOverride "12" "staff-padding" #'(4.3) TupletBracket
\tuplet 3/2 { c'''4^\markup {\fontsize #-4 staff-padding} c'' c'' } r2

\break

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% TUPLET + OTTAVA BRACKET
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% OTTAVA NEAREST TO THE STAFF
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\once \override TupletBracket.outside-staff-priority = 10000
\once \override TupletBracket.direction = #UP
\jsOnceOverride "13" "padding" #'(2.100) Staff.OttavaBracket
\jsOnceOverride "14" "outside-staff-padding" #'(2) TupletBracket
\tuplet 3/2 { \ottava #1 c''''4_\markup {\fontsize #-4 "padding + outside-staff-padding"} c''' c''' \ottava #0 } c''''' r
\once \override TupletBracket.outside-staff-priority = 10000
\once \override TupletBracket.direction = #UP
\jsOnceOverride "15" "staff-padding" #'(5.300) Staff.OttavaBracket
\jsOnceOverride "16" "outside-staff-padding" #'(2.1) TupletBracket
\tuplet 3/2 { \ottava #1 c''''4_\markup {\fontsize #-4 "staff-padding + outside-staff-padding"} c''' c''' \ottava #0 } r2

\once \override TupletBracket.outside-staff-priority = 10000
\once \override TupletBracket.direction = #UP
\jsOnceOverride "17" "Y-offset" #'(7.500) Staff.OttavaBracket
\jsOnceOverride "18" "outside-staff-padding" #'(2.2) TupletBracket
\tuplet 3/2 { \ottava #1 c''''4_\markup {\fontsize #-4  "Y-offset + outside-staff-padding"} c''' c''' \ottava #0 } r2

\break

\once \override TupletBracket.outside-staff-priority = 10000
\once \override Staff.OttavaBracket.direction = #DOWN
\jsOnceOverride "19" "padding" #'(2) Staff.OttavaBracket
\jsOnceOverride "20" "outside-staff-padding" #'(1.400) TupletBracket
\tuplet 3/2 { \ottava #1 c''''4^\markup {\fontsize #-4  "padding + outside-staff-padding"} c''' c''' \ottava #0 } c, r
\once \override TupletBracket.outside-staff-priority = 10000
\once \override Staff.OttavaBracket.direction = #DOWN
\jsOnceOverride "21" "staff-padding" #'(3) Staff.OttavaBracket
\jsOnceOverride "22" "outside-staff-padding" #'(1.300) TupletBracket
\tuplet 3/2 { \ottava #1 c''''4^\markup {\fontsize #-4  "staff-padding + outside-staff-padding"} c''' c''' \ottava #0 } r2

\once \override TupletBracket.outside-staff-priority = 10000
\once \override Staff.OttavaBracket.direction = #DOWN
\jsOnceOverride "23" "Y-offset" #'(-5) Staff.OttavaBracket
\jsOnceOverride "24" "outside-staff-padding" #'(1.400) TupletBracket
\tuplet 3/2 { \ottava #1 c''''4^\markup {\fontsize #-4  "Y-offset + outside-staff-padding"} c''' c''' \ottava #0 } r2

\break

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% TUPLET NEAREST TO THE STAFF
% NOTE: Y-offset is not supported for TupletBracket
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\once \override TupletBracket.direction = #UP
\jsOnceOverride "25" "outside-staff-padding" #'(2.800) Staff.OttavaBracket
\jsOnceOverride "26" "padding" #'(4.6) TupletBracket
\tuplet 3/2 { \ottava #1 c''''4_\markup {\fontsize #-4 "padding + outside-staff-padding"} c''' c''' \ottava #0 } c''''' r

a,,
\once \override TupletBracket.outside-staff-priority = 100
\once \override Staff.OttavaBracket.direction = #DOWN
\jsOnceOverride "27" "outside-staff-padding" #'(1.9) Staff.OttavaBracket
\jsOnceOverride "28" "padding" #'(1.100) TupletBracket
\tuplet 3/2 { \ottava #1 c''''4^\markup {\fontsize #-4 "padding + outside-staff-padding"} c''' c''' \ottava #0 } r

\pageBreak

\once \override TupletBracket.direction = #UP
\jsOnceOverride "29" "outside-staff-padding" #'(2.100) Staff.OttavaBracket
\jsOnceOverride "30" "staff-padding" #'(2.700) TupletBracket
\tuplet 3/2 { \ottava #1 c''''4_\markup {\fontsize #-4 "staff-padding + outside-staff-padding"} c''' c''' \ottava #0 } c''''' r

a,,
\once \override TupletBracket.outside-staff-priority = 100
\once \override Staff.OttavaBracket.direction = #DOWN
\jsOnceOverride "31" "outside-staff-padding" #'(2.000) Staff.OttavaBracket
\jsOnceOverride "32" "staff-padding" #'(1.600) TupletBracket
\tuplet 3/2 { \ottava #1 c''''4^\markup {\fontsize #-4 "staff-padding + outside-staff-padding"} c''' c''' \ottava #0 }

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