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
% along with Spontini.  If not, see <http://www.gnu.org/licenses/>.
%

\version "2.19.83"
\include "../lib/JSSVG.ly"
\include "../lib/OSOPadding.ly"
#(set! showEditorStuff "true")

{

\time 2/4

\set Staff.pedalSustainStyle = #'mixed
\once \override TupletBracket.direction = #UP
\override Score.TextScript.font-family = #'typewriter

#(define OSSLayoutA  #{

\resetOSPositions
\setOSPosition #UP 2 TupletBracket
\setOSPosition #UP 4 Slur
\setOSPosition #UP 6 Staff.OttavaBracket
\setOSPosition #DOWN 4 DynamicLineSpanner

\jsOSOPadder "1" "pads" #'(0 0.08 0 0.118) Staff.OttavaBracket
\jsOSOPadder "2" "pads" #'(0 0.269 0 0.052) TupletBracket

#})

\override Staff.TextScript.avoid-slur = #'ignore
\override Staff.DynamicLineSpanner.outside-staff-padding = 0

#(define OSSLayoutB  #{

%-----------ABOVE STAFF------------ (bottom -> top order)
\jsOSOPadder "3" "pads" #'(3.03 1 0 3.685) ^\OSBox
\jsOSOPadder "4"  "pads" #'(5 1 1 1) ^\OSBox
\jsOSOPadder "5"  "pads" #'(5 1 1 1) ^\OSBox
\jsOSOPadder "6" "pads" #'(2.427 1 1 1) ^\OSBox
\jsOSOPadder "7" "pads" #'(0 0.066 0 0.396) ^\fermata

%-----------BELOW STAFF------------ (top -> bottom order)
\jsOSOPadder "8"  "pads" #'(1 1 1 1) _\OSBox
\jsOSOPadder "9"  "pads" #'(1 1 1 1) _>
\jsOSOPadder "10" "pads" #'(4 1 1 1) _\OSBox
\jsOSOPadder "11" "pads" #'(0 0 0 0) _\p\<
\jsOSOPadder "12" "pads" #'(1 0.027 1 0) _\sostenutoOn
\jsOSOPadder "13" "pads" #'(1 1 1 1) _\OSBox
\jsOSOPadder "14" "pads" #'(1 0 1 0) _\sustainOn
\jsOSOPadder "15" "pads" #'(1 0.732 1 1) _\OSBox
\jsOSOPadder "16" "pads" #'(0 1 0 1) _"Use ped. with care!"
\jsOSOPadder "17" "pads" #'(1 1 1 1) _\OSBox

#})

\tuplet 3/2 { $OSSLayoutA \ottava #1 c''''( $OSSLayoutB a'''' c''''\ff)\sustainOff\sostenutoOff \ottava #0 }

}