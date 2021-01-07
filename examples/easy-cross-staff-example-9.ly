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
\language "italiano"

\paper {
  indent = 0\cm
}
#(set-global-staff-size 16)

%-----------------%
% START __JSSVG__ %
%-----------------%

"j14" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "14" "cpts" #'((-1.655 . 1.995) (-2.481 . -2.251) (1.089 . -3.881) (3.92 . -2.439)) $mus
#})

"j13" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "13" "cpts" #'((-0.034 . -3.691) (-2.294 . 2.804) (1.883 . 3.699) (0.935 . -1.378)) $mus
#})

"j12" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "12" "cpts" #'((0 . 0) (0 . 0) (8.286 . -1.884) (11.884 . 0.913)) $mus
#})

"j11" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "11" "extra-offset-y" #'(-2.101) TupletNumber $mus
#})

"j10" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "10" "extra-offset-y" #'(-2.101) TupletBracket $mus
#})

"j9" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "8" "extra-offset-y" #'(-2.9) $mus
#})

"j8" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "9" "extra-offset-y" #'(-3.494) $mus
#})

"j7" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "7" "cpts" #'((0.875 . -3.234) (1.483 . -4.389) (0.498 . -8.781) (-0.796 . -10.058)) $mus
#})

"j6" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "6" "X-offset" #'(-71.9) NoteColumn $mus
#})

"j5" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "5" "X-offset" #'(-71.9) NoteColumn $mus
#})

"j4" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "4" "cpts" #'((0.391 . -0.187) (0.9 . 0.592) (5.517 . 2.466) (6.342 . 3.005)) $mus
#})

"j3" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "3" "extra-offset-y" #'(-1.694) $mus
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
\override Score.StaffSymbol.staff-space = #0.85
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
\stemDown \tupletUp 3/2 {si'8\rest mi'\"j13" (\f mi''} \stemNeutral \tupletUp 5/4 { mib''16 sib' si' re'' reb''}
\tupletDown 5/4 { do'' si' fad' la' lab'} sol' do' mi' mib')\jsShape "15" "cpts" #'((0.605 . 1.473) (1.663 . -2.841) (-0.858 . -6.301) (-1.088 . -12.842)) ( \"j1" si'4\rest) <sib' sib>_>
}

\\
\crossStaffTableVoice "middleI"
{
\stemNeutral
<re'? sol'? do''? mi''?>4\"j3" \f
\once \omit Voice.TupletNumber \tupletAngles 0 5
\tupletDown 9/6 { re'8[_>\exprMark "Très marqué ce motif." <sol'? do''? mi''?>8]_> sol''4.^> r8 <la''? do'''? mi'''?>4.^> }
<< { \tupletUp 3/2 {\"j2" si'8\"j14" _( do''' sol'} <sol'? si'?>4) } \\ { s4 mi'?8 mib' } >>
}

\\
\crossStaffTableVoice "lower"
{ \clef bass <fa,? sib, lab>4. s4. s2.}

>>

%%%%%%%%%%%%%%%
%% MEASURE 2 %%
%%%%%%%%%%%%%%%

\time 4/4
\override Score.Hairpin.rotation = #'(20 0 0)

<<
\setCrossStaves "middleI" "lower"
\easyCrossStaff %TMODE
  { \CS <re'? mi'?>8 \CS \hiddenTuplet 4/3{ do'                \CS s    \CS s           \CS s }            \CS re'16[ \CS sol' \CS <do' re' sol' lab'>8]_>~ \CS \stemDown <do' re' sol' lab'>4 \CS }
  { \CS s8[\"j12" _( \CS $v2 \"j10" \"j11" \tupletDown 4/3 { s \CS solb \CS lab,)\"j4"( \CS lab,,])}\"j7"( \CS s16)   \CS s    \CS s8                       \CS s4                             \CS }
#'( \CS D            \CS -                                     \CS -    \CS -           \CS N              \CS U      \CS -    \CS -                        \CS N                              \CS )

\\
\crossStaffTableVoice "lower"
{ \stemUp s2 \crossStaff <mi sib>4~\stemDown <mi sib> }

\\
\crossStaffTableVoice "middleI"
{ s2. \stemUp <re'' re'''>4^> }

\\
\setCrossStaves "upper" "middleI"
\easyCrossStaff %TMODE
  { \CS s8 \CS s32[   \CS s      \CS s    \CS s     \CS s    \CS  s    \CS s    \CS s     \CS sol' \CS do'' \CS re'' \CS sol''] \CS $v1 \tupletUp 6/4 {  <do'' sol'' do'''>8[^>\"j9" \ff~ \CS <do'' sol'' do'''>16 \CS <si'' si'>\"j8" \exprMark "dim." \CS <lab'' lab'> \CS <sol'' sol'>] } \CS <reb'' reb'>[ \CS <do'' do'> \CS s             \CS s]           \CS }
  { \CS r8 \CS sol'32 \CS do''\< \CS re'' \CS sol'' \CS sol' \CS  do'' \CS re'' \CS sol'' \CS s    \CS s    \CS s    \CS s\!    \CS \hiddenTuplet 6/4{ s8                                 \CS s16                  \CS s                                \CS s            \CS s}              \CS s             \CS s          \CS <lab'' lab'?> \CS <sol'' sol'> \CS }
#'( \CS U  \CS -      \CS -      \CS -    \CS -     \CS -    \CS -     \CS -    \CS -     \CS -    \CS -    \CS -    \CS -      \CS U                                                     \CS -                    \CS -                                \CS -            \CS -               \CS -             \CS -          \CS -             \CS -            \CS )

\\
\crossStaffTableVoice "upper"
{ <do' re' sol' do''>4.^> }

\\
\crossStaffTableVoice "lower"
{ \stemDown s2 <lab,, lab,>4~<lab,, lab,>}

>>

\override Score.BarNumber.stencil = ##f
\break s1

} %end upper
middleI = { \setStavesSpacing }
lower   = { }

\include "../lib/ly/piano-template.ly"