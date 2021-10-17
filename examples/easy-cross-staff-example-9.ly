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
\include "../lib/ly/jssvg.ly"
\include "../lib/ly/misc.ly"
\version "2.19.84"

\paper {
  indent = 0\cm
}
#(set-global-staff-size 15)

%-----------------%
% START __JSSVG__ %
%-----------------%

"j15" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "16" "cpts" #'((0.194 . 0.778) (9.085 . -1.102) (0.053 . 4.318) (-0.124 . 15.465)) $mus
#})

"j14" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "14" "cpts" #'((-1.655 . 1.995) (-2.481 . -2.251) (1.089 . -3.881) (3.92 . -2.439)) $mus
#})

"j13" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "13" "cpts" #'((-0.069 . -4.591) (-2.294 . 2.804) (1.883 . 3.699) (0.935 . -1.378)) $mus
#})

"j12" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "12" "cpts" #'((0.172 . 0.045) (0 . 0) (8.286 . -1.884) (12.975 . 0.043)) $mus
#})

"j11" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "11" "extra-offset-y" #'(-2.101) TupletNumber $mus
#})

"j10" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "10" "extra-offset-y" #'(-2.101) TupletBracket $mus
#})

"j9" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "8" "extra-offset-y" #'(-1.368) $mus
#})

"j8" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "9" "extra-offset-y" #'(-1.99) $mus
#})

"j7" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "7" "cpts" #'((0.903 . -4.335) (1.458 . -5.678) (0.924 . -10.396) (-0.611 . -11.765)) $mus
#})

"j6" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "6" "X-offset" #'(-71.9) NoteColumn $mus
#})

"j5" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "5" "X-offset" #'(-71.9) NoteColumn $mus
#})

"j4" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "4" "cpts" #'((0.13 . -0.31) (0.285 . 0.071) (5.58 . 2.056) (5.784 . 2.922)) $mus
#})

"j3" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "3" "extra-offset-y" #'(-0.894) $mus
#})

"j2" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "2" "X-offset" #'(1.600) NoteColumn $mus
#})

"j1" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "1" "X-offset" #'(1.300) NoteColumn $mus
#})

%-----------------%
% END __JSSVG__   %
%-----------------%

%----------------%
% START __VARS__ %
%----------------%

#(define v2 #{
\once \override Score.TupletNumber.text = #tuplet-number::calc-fraction-text
#})

#(define v1 #{
\once \override NoteColumn.X-offset = 0.01
#})

%----------------%
% END __VARS__   %
%----------------%

#(define pianoStaves 3)

setStavesSpacing = \override Staff.VerticalAxisGroup #'staff-staff-spacing =
#'((basic-distance . 9)
(minimum-distance . 12)
(maximum-distance . 9)
(padding . -9)
(stretchability . 0))

exprMark =  #(define-music-function (parser location str) (string?)
#{ _\markup { \small \italic #str } #})

upper = {

%-------------------%
% START LAYOUT DEFS %
%-------------------%

% Set this to "true" if you want to show colored layers
% (NOTE: If it is set to "true", jstweaks can't be modified)
#(showColoredLayers "false")

#(set! showEditorStuff "true")

\setStavesSpacing
$(set! cpDiameter 0.3)
\set Score.proportionalNotationDuration = #(ly:make-moment 1/8)
\override Score.Script.padding = 0.4
\override Score.Stem #'thickness = #1
\override Score.StaffSymbol #'thickness = #0.55
\override Score.Script.font-size = #-2
\override Score.DynamicText.font-size = #-1
\override Score.Accidental.font-size = #-2
\override Score.AccidentalCautionary.font-size = #-2
\override Score.AccidentalCautionary.parenthesized = ##f
\override Score.NoteHead.font-size = #-1.8
\override Score.Rest.font-size = #-1
\override Score.Clef.font-size = #-1.3
\override Score.Dots.font-size = #-1.3
\override Score.TimeSignature.font-size = #-1.3
\override Score.TextScript.font-size = #2

%-----------------%
% END LAYOUT DEFS %
%-----------------%

%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%       SCORE       %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Piano Sonata No.1 (Sorabji, Kaikhosru Shapurji), measures 3 and 4
% https://imslp.org/wiki/Piano_Sonata_No.1_(Sorabji%2C_Kaikhosru_Shapurji)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%
%% MEASURE 1 %%
%%%%%%%%%%%%%%%

\time 6/4
<<

\crossStaffTableVoice "upper"
{
\stemDown \tupletUp 3/2 {b'8\rest e'\"j13" (\f e''} \stemNeutral \tupletUp 5/4 { es''16 bes' b' d'' des''}
\tupletDown 5/4 { c'' b' fis' a' as'} g' c' e' es')\jsShape "15" "cpts" #'((0.605 . 1.473) (1.663 . -2.841) (-0.858 . -6.301) (-1.088 . -12.842)) ( \"j1" b'4\rest) <bes' bes>_>
}

\\
\crossStaffTableVoice "middleI"
{
\stemNeutral
<d'? g'? c''? e''?>4\"j3" \f
\once \omit Voice.TupletNumber \tupletAngles 0 5
\tupletDown 9/6 { d'8[_>\exprMark "Très marqué ce motif." <g'? c''? e''?>8]_> g''4.^> r8 <a''? c'''? e'''?>4.^> }
<< { \tupletUp 3/2 {\"j2" b'8\"j14" _( c''' g'} <g'? b'?>4) } \\ { s4 e'?8 es' } >>
}

\\
\crossStaffTableVoice "lower"
{ \clef bass <f,? bes, as>4. s4. s2.}

>>

%%%%%%%%%%%%%%%
%% MEASURE 2 %%
%%%%%%%%%%%%%%%

\time 4/4
\override Score.Hairpin.rotation = #'(16 0 0)

<<

\setCrossStaves "middleI" "lower"
\easyCrossStaff %TMODE
  { \CS <d'? e'?>8   \CS \hiddenTuplet 4/3{ c'                 \CS s   \CS s          \CS s }           \CS d'16[ \CS g' \CS <c' d' g' as'>8]_>~ \CS \stemDown <c' d' g' as'>4 \CS }
  { \CS s8[\"j12" _( \CS $v2 \"j10" \"j11" \tupletDown 4/3 { s \CS ges \CS as,)\"j4"( \CS as,,])}\"j7"( \CS s16)  \CS s  \CS s8                  \CS s4                        \CS }
#'( \CS D            \CS -                                     \CS -   \CS -          \CS N             \CS U     \CS -  \CS -                   \CS N                         \CS )

\\
\crossStaffTableVoice "lower"
{ \stemUp s2 \crossStaff <e bes>4~\stemDown <e bes> }

\\
\crossStaffTableVoice "middleI"
{ s2. \stemUp <d'' d'''>4^> }

\\
\setCrossStaves "upper" "middleI"
\easyCrossStaff %TMODE
  { \CS s8 \CS s32[         \CS s     \CS s   \CS s   \CS s  \CS  s   \CS s   \CS s   \CS g' \CS c'' \CS d'' \CS g''] \CS $v1 \tupletUp 6/4 {  <c'' g'' c'''>8[^>\"j9" \ff~ \CS <c'' g'' c'''>16 \CS <b'' b'>\"j8" \exprMark "dim." \CS <as'' as'> \CS <g'' g'>] } \CS <des'' des'>[ \CS <c'' c'> \CS s           \CS s]       \CS }
  { \CS r8 \CS g'32\"j15" ( \CS c''\< \CS d'' \CS g'' \CS g' \CS  c'' \CS d'' \CS g'' \CS s  \CS s   \CS s   \CS s)\! \CS \hiddenTuplet 6/4{ s8                             \CS s16              \CS s                              \CS s          \CS s}          \CS s             \CS s        \CS <as'' as'?> \CS <g'' g'> \CS }
#'( \CS U  \CS -            \CS -     \CS -   \CS -   \CS -  \CS -    \CS -   \CS -   \CS -  \CS -   \CS -   \CS -    \CS U                                                 \CS -                \CS -                              \CS -          \CS -           \CS -             \CS -        \CS -           \CS -        \CS )

\\
\crossStaffTableVoice "upper"
{ <c' d' g' c''>4.^> }

\\
\crossStaffTableVoice "lower"
{ \stemDown s2 <as,, as,>4~<as,, as,>}

>>

\override Score.BarNumber.stencil = ##f
\stopStaff
\hide Score.Clef
\hide Score.Rest
\break r1

} %end upper
middleI = { \setStavesSpacing }
lower   = { }

\include "../lib/ly/piano-template.ly"