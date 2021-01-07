%
% Created (24/06/2020) by Paolo-Prete.
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

\include "../lib/ly/jssvg.ly"
\include "../lib/ly/tabular-functions.ly"
\include "../lib/ly/misc.ly"
\version "2.19.84"

%-------------------%
% START LAYOUT DEFS %
%-------------------%

setLayoutVars = {

#(set! volatinaFontSize -4.8)
\override Staff.VerticalAxisGroup #'staff-staff-spacing =
#'((basic-distance . 9)
(minimum-distance . 12)
(maximum-distance . 9)
(padding . -9)
(stretchability . 0))
$(set! cpDiameter 0.4)
\set Score.proportionalNotationDuration = #(ly:make-moment 1/32)
\override Score.Script.padding = 0.4
\override Score.Stem #'thickness = #1
\override Score.StaffSymbol #'thickness = #0.55
\override Score.StaffSymbol.staff-space = #0.85
\override Score.Script.font-size = #-2
\override Score.DynamicText.font-size = #-1
\override Score.Accidental.font-size = #-2
\override Score.KeySignature.font-size = #-2
\override Score.NoteHead.font-size = #-1.8
\override Score.Rest.font-size = #-1
\override Score.Clef.font-size = #-1.3
\override Score.Dots.font-size = #-1.3
\override Score.TimeSignature.font-size = #-1.3
\override Score.TextScript.font-size = #2
\override Score.TextScript.outside-staff-padding = #1
\override Score.TextSpanner.outside-staff-padding = #1
\override Score.OttavaBracket.outside-staff-padding = #0.7
\override Score.Script.padding = #0.8
\override Score.Script.outside-staff-padding = #0.8
\override Score.DynamicLineSpanner.padding = #0.8
\override Score.DynamicLineSpanner.outside-staff-padding = #0.8
% Ensures compatibility for Chrome/ium and FF
\override Score.TextScript.font-family = #'typewriter

% Set this to "true" if you want to show colored layers
% (NOTE: If it is set to "true", jstweaks can't be modified)
#(showColoredLayers "false")

#(set! showEditorStuff "true")

}

\paper {
  indent = 0\cm
  system-system-spacing.basic-distance = #30
}

startAgogicSpan = #(define-music-function (parser location str mus) (string? ly:music?) #{
 \once \override Staff.TextSpanner.bound-details.left.text = \markup { \normal-text \small \bold #str } $mus \startTextSpan
#})

stopAgogicSpan = #(define-music-function (parser location mus) (ly:music?) #{
 $mus \stopTextSpan
#})

exprMark =  #(define-music-function (parser location str) (string?)
#{ -\markup { \small \italic #str } #})

agogicMark =  #(define-music-function (parser location str) (string?)
#{ -\markup { \normal-text \small \bold #str } #})

%-------------------%
% END LAYOUT DEFS %
%-------------------%

%-----------------%
% START __JSSVG__ %
%-----------------%

"j9" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "10" "extra-offset" #'(0.545 . -1.299) $mus
#})

"j8" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "9" "extra-offset" #'(0.800 . 0) NoteColumn $mus
#})

"j7" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "8" "X-offset" #'(0.800) NoteColumn $mus
#})

"j6" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "7" "cpts" #'((0.544 . -4.41) (-3.523 . 2.938) (2.343 . 0.918) (0 . 0)) $mus
#})

"j5" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "6" "cpts" #'((1.198 . -9.86) (-0.284 . 1.153) (0.037 . 2.171) (0.279 . -2.116)) $mus
#})

"j4" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOffset "5" "positions" #'(-0.526 . 1.754) $mus
#})

"j3" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "4" "cpts" #'((-0.019 . -0.09) (-0.989 . 0.794) (3.136 . 1.414) (0.497 . -3.1)) $mus
#})

"j2" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOffset "3" "positions" #'(-1.053 . 3.332) $mus
#})

"j1" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "2" "extra-offset-y" #'(-2.612) TupletNumber $mus
#})

%-----------------%
% END __JSSVG__   %
%-----------------%

%----------------%
% START __VARS__ %
%----------------%

#(define v2 #{
\once \override Voice.NoteColumn.X-offset = 0.3
#})

#(define v1 #{
% prevents a "may not find good beam slope" warning
\once \override Beam.positions = #'( 7 . 7)
#})

%----------------%
% END __VARS__   %
%----------------%

upper = {

%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%       SCORE       %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Préludes, Livre 1 (Debussy, Claude)
% ... Voiles (extrait)
% https://imslp.org/wiki/Pr%C3%A9ludes%2C_Livre_1_(Debussy%2C_Claude)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\setLayoutVars

%%%%%%%%%%%%%%%
%% MEASURE 1 %%
%%%%%%%%%%%%%%%

\time 2/4

<<

%% LAYER 1
\setCrossStaffVoiceContext "ctx1"
\easyCrossStaffII #layer1DefaultColor %TMODE
  { \CS \clef treble \startAgogicSpan "Cédez" s16 \CS s  \CS \vTwoTemp s \CS s      \CS \"j1" \tupletDown 3/2 ##f { s8 \"j6" \( \CS \clef bass bes \CS \stopAgogicSpan as]~\) } \bar "||" \CS }
  { \CS \clef bass  d'16[\(                       \CS c' \CS bes         \CS as]\)~ \CS \hiddenTuplet 3/2 {  as8[               \CS s              \CS s  }                               \CS }
#'( \CS D                                         \CS -  \CS -           \CS -      \CS C                                       \CS -              \CS -                                  \CS )

\\
%% LAYER 2
\crossStaffTableVoice #layer2DefaultColor "upper"
{ \stemUp d''8 b'\rest }

\\
%% LAYER 3
\crossStaffTableVoice #layer3DefaultColor "upper"
{ \stemDown <fis' as'>8 _\exprMark "dim. molto" }

\\
%% LAYER 4
\crossStaffTableVoice #layer4DefaultColor "lower"
{ \stemDown bes,,2 }

>>

%%%%%%%%%%%%%%%
%% MEASURE 2 %%
%%%%%%%%%%%%%%%

<<

%% LAYER 1
\easyCrossStaff #layer1DefaultColor %TMODE
  { \CS \key bes \minor as32\"j4" [\"j3" \(^\agogicMark "En animant" \CS bes \CS as \CS ges \CS \vFourTemp s8\) \CS s4                      \CS }
  { \CS \key bes \minor s32\p                                        \CS s   \CS s  \CS s   \CS es8]~           \CS \once \stemUp \"j8" es4 \CS }
#'( \CS C                                                            \CS -   \CS -  \CS -   \CS -               \CS -                       \CS )

\\
%% LAYER 2
\unsetCrossStaffVoiceContext
\easyCrossStaff #layer2DefaultColor %TMODE
  { \CS s8 \CS \volatina 14/4 { \vThreeTemp { s32 \"j5" \( } \CS s   \CS s  \CS s   \CS s    \CS \clef treble es' \CS ges' \CS as' \CS bes' \CS des''] \CS es''[ \CS ges'' \CS as'' \CS bes''] } \CS \"j7" des'''16[(^> \CS bes'']\)) \CS as'32[^- \CS bes' \CS as' \CS ges'] \CS }
  { \CS s8 \CS \volatina 14/4 { $v2 $v1 es32 \"j2" [         \CS ges \CS as \CS bes \CS des' \CS s\<              \CS s    \CS s   \CS s    \CS s      \CS s     \CS s     \CS s    \CS s }      \CS s16                \CS s         \CS as32(\mf \CS bes  \CS as  \CS ges)  \CS }
#'( \CS N  \CS C                                             \CS -   \CS -  \CS -   \CS -    \CS -                \CS -    \CS -   \CS -    \CS -      \CS U     \CS -     \CS -    \CS -        \CS N                  \CS -         \CS U        \CS -    \CS -   \CS -     \CS )

\\
%% LAYER 3
\crossStaffTableVoice #layer3DefaultColor "lower"
{ \stemDown bes,,2 }

>>

\break

%%%%%%%%%%%%%%%
%% MEASURE 3 %%
%%%%%%%%%%%%%%%

% Note: setting \context Voice = "tempctx" allows to have the spanner on different measures
\once \override Score.TextSpanner.bound-details.left.text = \markup { \small \bold "Cédez" }

<<

%% LAYER 1
\easyCrossStaff #layer1DefaultColor %TMODE
  { as'32[^- \CS bes' \CS as' \CS ges' \CS es'8]^- \CS des''''16[^>( \CS bes'''])\ottava #0 \CS  es''16[ \CS des''] \CS }
  { as32(    \CS bes  \CS as  \CS ges  \CS es8)    \CS s16           \CS s                  \CS  s16     \CS s      \CS }
#'( U        \CS -    \CS -   \CS -    \CS -       \CS N             \CS -                  \CS  -       \CS -      \CS )

\\
%% LAYER 2
\easyCrossStaff #layer2DefaultColor %TMODE
  { s8 \CS \volatina 19/4 { s32       \CS s   \CS s  \CS s   \CS s    \CS es'                       \CS ges' \CS as'^\exprMark "(rapide)" \CS bes' \CS des'' \CS s                 \CS s     \CS s    \CS s     \CS s      \CS \ottava #1 es'''    \CS ges''' \CS as''' \CS bes'''] } }
  { s8 \CS \volatina 19/4 { $v2 es32[ \CS ges \CS as \CS bes \CS des' \CS s\"j9"^\exprMark "cresc." \CS s    \CS s                        \CS s    \CS s     \CS \clef treble es'' \CS ges'' \CS as'' \CS bes'' \CS des''' \CS s^\exprMark "molto" \CS s      \CS s     \CS s     }   }
#'( -  \CS C                          \CS -   \CS -  \CS -   \CS -    \CS -                         \CS -    \CS -                        \CS -    \CS -     \CS -                 \CS -     \CS -    \CS -     \CS -      \CS -                   \CS -      \CS -     \CS -         )

\\
%% LAYER 3
\crossStaffTableVoice #layer3DefaultColor "upper" "ctx2"
{ \stemUp s4. \startAgogicSpan "Emporté" <as'' as'>32[\jsShape "11" "cpts" #'((0 . 0) (3.556 . 1.914) (-2.512 . 0.838) (0 . 0)) ^\( <bes'' bes'> <as'' as'> <ges'' ges'>] }

\\
%% LAYER 4
\crossStaffTableVoice #layer4DefaultColor "lower"
{ \stemDown bes,,2 }

\\
%% LAYER 5
\crossStaffTableVoice #layer5DefaultColor "lower" "ctx3"
{ s4. \clef bass <es bes>16[_\(\mf\< \CS <ges des'>] }

>>

%%%%%%%%%%%%%%%
%% MEASURE 4 %%
%%%%%%%%%%%%%%%

<<

%% LAYER 1
\setCrossStaffVoiceContext "ctx3"
\easyCrossStaff #layer1DefaultColor %TMODE
  { s16          \CS s           \CS <es' as' des''>8~ \CS \once \stemDown <es' as' des''>4 \CS }
  { <bes es'>16[ \CS <des' ges'> \CS s8]\)\f           \CS s4                               \CS }
#'( D            \CS -           \CS -                 \CS N                                \CS )

\\
%% LAYER 2
\crossStaffTableVoice #layer2DefaultColor "upper" "ctx2"
{
  \stemUp <as'' as'>32[ <bes'' bes'> <des''' des''> <es''' es''> <as'' des''' as'''>8]~\stopTextSpan
  \startAgogicSpan  "Cédez" <as'' des''' as'''>16[ \>_\exprMark "molto" <es''' es''>
  <des''' des''> \stopAgogicSpan <bes'' bes'>]\)\!
}

\\
%% LAYER 3
\crossStaffTableVoice #layer3DefaultColor "upper"
{ \stemDown es''16[ ges''] }

>>

} %end upper
lower = { }

\include "../lib/ly/piano-template.ly"