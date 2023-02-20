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
\include "../lib/ly/tabular-functions.ly"
\include "../lib/ly/oso-padding.ly"
#(set! showEditorStuff "true")

upper = {

\time 3/4
\override Score.DynamicLineSpanner.outside-staff-padding = 0
\override Score.TextScript.font-family = #'typewriter
\override Score.TextScript.avoid-slur = #'ignore
\set Score.pedalSustainStyle = #'mixed
\override Score.SostenutoPedal.font-family = #'typewriter

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(define lU1 #{
\resetOSPositions
\setOSPosition #UP 3 TupletBracket
\setOSPosition #UP 4 Staff.OttavaBracket
\setOSPosition #UP 2 Slur
\once \override TupletBracket.positions = #'(2 . 0)
\jsOSOPadder "106" "pads" #'(0 0.04 0.047 0) TupletBracket
\jsOSOPadder "82" "pads" #'(0 4.945 0.012 0) Staff.OttavaBracket
#})

#(define lU2 #{
\jsOSOPadder "84" "pads" #'(1.571 0 0 0)^\OSBox
#})

#(define lD1 #{
\setOSPosition #DOWN 1 DynamicLineSpanner
#})

#(define lD2 #{
\jsOSOPadder "93" "pads" #'(0.107 0 0 0) _\mf\<
\jsOSOPadder "94" "pads" #'() _\sustainOn
\jsOSOPadder "95" "pads" #'(0 0 0.012 0) _\sostenutoOn
\jsOSOPadder "96" "pads" #'(0 0 0 0)  _"Use pedals with care!"
#})

\easyCrossStaff %TMODE
  { \CS $lU1 \tupletUp 3/2 { \ottava #1 <c'''' e''''>8[( $lU2 \CS s   \CS s }    \CS e''''4) \ottava #0            \CS r \CS }
  { \CS $lD1 \hiddenTuplet 3/2 { s8 $lD2                      \CS c'' \CS g''] } \CS s4\ff\sustainOff\sostenutoOff \CS s \CS }
#'( \CS C                                                     \CS -   \CS -      \CS -                             \CS - \CS )

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(define lU1 #{
\resetOSPositions
\once \override TupletBracket.positions = #'(0 . 2)
\setOSPosition #UP 2 TupletBracket
\setOSPosition #UP 3 Staff.OttavaBracket
\jsOSOPadder "97" "pads" #'(0 6.505 0 0.006) TupletBracket
\jsOSOPadder "98" "pads" #'() Staff.OttavaBracket
#})

#(define lU2 #{
\jsOSOPadder "103" "pads" #'(2.162 10.172 0 0)^\OSBox
\jsShape "108" "cpts" #'((-0.146 . -4) (6.164 . -11.768) (1.038 . -7.473) (0.393 . -4.243)) _(
#})

#(define lD1 #{
\setOSPosition #DOWN 1 DynamicLineSpanner
#})

#(define lD2 #{
\jsOSOPadder "99" "pads" #'()  _\mf\<
\jsOSOPadder "100" "pads" #'() _\sostenutoOn
\jsOSOPadder "101" "pads" #'() _\sustainOn
\jsOSOPadder "102" "pads" #'(0 0 0.052 0) _"Use pedals with care!"
#})

\easyCrossStaff %TMODE
  { \CS $lU1 \tupletUp 3/2 { \ottava #1 s8 [ $lU2 \CS g''' \CS g'''] } \CS e''''4) \ottava #0            \CS r \CS }
  { \CS $lD1 \hiddenTuplet 3/2 { c'''8 $lD2       \CS c''  \CS s }     \CS s4\ff\sustainOff\sostenutoOff \CS s \CS }
#'( \CS U                                         \CS -    \CS -       \CS N                             \CS - \CS )

\break

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(define lU1 #{
\resetOSPositions
\once \override TupletBracket.positions = #'(0 . 0)
\setOSPosition #UP 3 TupletBracket
\setOSPosition #UP 4 Staff.OttavaBracket
\setOSPosition #UP 2 Slur
\jsOSOPadder "109" "pads" #'(1.531 0 0.061 0) TupletBracket
\jsOSOPadder "110" "pads" #'(2.054 0 0 0) Staff.OttavaBracket
#})

#(define lU2 #{
\jsOSOPadder "111" "pads" #'(3.405 8.204 0.134 0.061) ^\OSBox
#})

#(define lD1 #{
\setOSPosition #DOWN 1 DynamicLineSpanner
#})

#(define lD2 #{
\jsOSOPadder "112" "pads" #'(0.047 0 0 0) _\mf\<
\jsOSOPadder "113" "pads" #'(0.251 0 0 0) _\sustainOn
\jsOSOPadder "114" "pads" #'() _\sostenutoOn
\jsOSOPadder "115" "pads" #'(0 0 0 0) _"Use pedals with care!"
#})

$(set! crossStaffUDBeamThreeshold 6)

\easyCrossStaff %TMODE
  { \CS $lU1 \tupletUp 3/2 { \ottava #1 g'''8 ^( $lU2 \CS s   \CS <g'' b''>} \CS e''''4) \ottava #0            \CS r \CS }
  { \CS $lD1 \hiddenTuplet 3/2 {  s8 [  $lD2          \CS c'' \CS g''] }     \CS s4\ff\sustainOff\sostenutoOff \CS s \CS }
#'( \CS D                                             \CS -   \CS -          \CS N                             \CS - \CS )

$(set! crossStaffUDBeamThreeshold 0)

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(define lU1 #{
\resetOSPositions
\setOSPosition #UP 3 Staff.OttavaBracket
\setOSPosition #UP 2 Slur
\jsOSOPadder "117" "pads" #'(0 0 0.096 0) Staff.OttavaBracket
#})

#(define lU2 #{
\jsOSOPadder "118" "pads" #'(0.966 17.772 0 0) ^\OSBox
^(
#})

#(define lD1 #{
\setOSPosition #DOWN 1 TupletBracket
\setOSPosition #DOWN 2 DynamicLineSpanner
\once \override TupletBracket.positions = #'(0 . -3)
\jsOSOPadder "123" "pads" #'(0.257 0 0.291 0) TupletBracket
#})

#(define lD2 #{
\jsOSOPadder "119" "pads" #'() _\mf\<
\jsOSOPadder "120" "pads" #'() _\sustainOn
\jsOSOPadder "121" "pads" #'() _\sostenutoOn
\jsOSOPadder "122" "pads" #'(0.045 0 0 0) _"Use pedals with care!"
#})

\easyCrossStaff %TMODE
  { \CS $lU1 \hiddenTuplet 3/2 { \ottava #1 c''''8  $lU2 \CS s   \CS s }    \CS e''''4) \ottava #0            \CS r \CS }
  { \CS $lD1 \tupletDown 3/2 { s8 [ $lD2                 \CS c'' \CS g''] } \CS s4\ff\sustainOff\sostenutoOff \CS s \CS }
#'( \CS D                                                \CS -   \CS -      \CS N                             \CS - \CS )

\break

}

lower = {}

\layout {
  \context {
    \Staff
      \override StaffSymbol.output-attributes.gridify = $showEditorStuff
      \override StaffSymbol.output-attributes.gridstep = "1"
      \override StaffSymbol.output-attributes.gridcolor = "#f0eee9"
      \override StaffSymbol.staff-space = 0.85
  }
}

\include "../lib/ly/piano-template.ly"