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
\include "nederlands.ly"
\version "2.19.84"

\paper {
  indent = 0\cm
  system-system-spacing.basic-distance = #30
}

%-----------------%
% START __JSSVG__ %
%-----------------%

"j24" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "24" "extra-offset" #'(0.005 . -0.353) Accidental $mus
#})

"j23" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "23" "extra-offset" #'(-0.329 . -0.007) Dots $mus
#})

"j22" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "22" "X-offset" #'(-1.3) NoteColumn $mus
#})

"j21" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "21" "X-offset" #'(-1.3) NoteColumn $mus
#})

"j20" = #(define-music-function (parser location mus) (ly:music?) #{
\once \override DynamicLineSpanner.Y-offset = -4.5 $mus
#})

"j19" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "20" "Y-offset" #'(-4.6) DynamicLineSpanner $mus
#})

"j18" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "17" "extra-offset" #'(-0.35 . 0.063) Dots $mus
#})

"j17" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOffset "10" "positions" #'(2.598 . 3.1) $mus
#})

"j16" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOffset "16" "positions" #'(0 . -0.877) $mus
#})

"j15" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "8" "extra-offset" #'(3.491 . -1.778) $mus
#})

"j14" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "18" "extra-offset-y" #'(1.029) $mus
#})

"j13" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "15" "cpts" #'((0 . 0) (0.968 . -0.19) (0.369 . -0.894) (0.199 . -2.389)) $mus
#})

"j12" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "14" "extra-offset" #'(0.7 . 0) Dots $mus
#})

"j11" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "7" "cpts" #'((-0.005 . 0.842) (0 . 0) (-2.35 . -2.975) (-0.037 . 0.677)) $mus
#})

"j10" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOffset "6" "positions" #'(0 . -1.754) $mus
#})

"j9" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "19" "Y-offset" #'(-4.3) DynamicLineSpanner $mus
#})

"j8" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "13" "extra-offset" #'(0.7 . 0) Dots $mus
#})

"j7" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "12" "extra-offset" #'(0.7 . 0) Dots $mus
#})

"j6" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "11" "extra-offset" #'(0.7 . 0) Dots $mus
#})

"j5" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "4" "extra-offset" #'(1.034 . -0.885) Accidental $mus
#})

"j4" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "3" "extra-offset" #'(1.171 . -0.821) Accidental $mus
#})

"j3" = #(define-music-function (parser location mus) (ly:music?) #{
\jsShape "5" "cpts" #'((0.255 . -0.348) (0 . 0) (-0.532 . -1.33) (-0.278 . 0.54)) $mus
#})

"j2" = #(define-music-function (parser location mus) (ly:music?) #{
\jsOnceOverride "2" "extra-offset" #'(0.994 . -0.738) Accidental $mus
#})

"j1" = #(define-music-function (parser location mus) (ly:music?) #{
\jsTweak "1" "extra-offset" #'(1.1 . -0.747) Accidental $mus
#})

%-----------------%
% END __JSSVG__   %
%-----------------%

upper = {

%-------------------%
% START LAYOUT DEFS %
%-------------------%

% Set this to "true" if you want to show colored layers
% (NOTE: If it is set to "true", jstweaks can't be modified)
#(showColoredLayers "false")

#(set! showEditorStuff "true")

\override Staff.VerticalAxisGroup #'staff-staff-spacing =
#'((basic-distance . 9)
(minimum-distance . 12)
(maximum-distance . 9)
(padding . -9)
(stretchability . 0))
$(set! cpDiameter 0.4)
\set Score.proportionalNotationDuration = #(ly:make-moment 1/8)
\override Score.Script.padding = 0.4
\override Score.Stem #'thickness = #1
\override Score.StaffSymbol #'thickness = #0.55
\override Score.StaffSymbol.staff-space = #0.85
\override Score.Script.font-size = #-2
\override Score.DynamicText.font-size = #-1
\override Score.Accidental.font-size = #-2
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

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Préludes, Livre 1 (Debussy, Claude)
% ... Danseuses de Delphes (extrait)
% https://imslp.org/wiki/Pr%C3%A9ludes%2C_Livre_1_(Debussy%2C_Claude)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%
%% MEASURE 1 %%
%%%%%%%%%%%%%%%

\time 3/4

<<

%% LAYER 1
\easyCrossStaff #layer1DefaultColor %TMODE
  { \CS \key bes \major <d' f'>4^.^\( \CS <es' g'>^. \CS <f' a'>^.\) \CS }
  { \CS \key bes \major \clef bass f4 \CS g          \CS a           \CS }
#'( \CS U                             \CS -          \CS -           \CS )

\\
%% LAYER 2
\crossStaffTableVoice #layer2DefaultColor "upper"
{ \forceHShiftOnVoice 1.4 \stemDown bes4_\( \"j1" b8. c'16 \"j2" cis'4\) }

\\
%% LAYER 3
\crossStaffTableVoice #layer3DefaultColor "lower"
{ \stemDown \clef bass < bes, bes,,>4_._\(\p \CS <a, a,,>_. <f, f,,>_.\) }

>>

%%%%%%%%%%%%%%%
%% MEASURE 2 %%
%%%%%%%%%%%%%%%

<<

%% LAYER 1
\easyCrossStaff #layer1DefaultColor %TMODE
  { \CS <d' f'>4^.^\( \CS <es' g'>^. \CS <f' a'>^.\) \CS }
  { \CS f4            \CS g          \CS a           \CS }
#'( \CS U             \CS -          \CS -           \CS )

\\
%% LAYER 2
\crossStaffTableVoice #layer2DefaultColor "upper"  "ctx1"
{ \forceHShiftOnVoice 1.4 \stemDown bes4 \"j3" _\( \"j4" b8. c'16 \"j5" cis'8. f'16 }

\\
%% LAYER 3
\crossStaffTableVoice #layer3DefaultColor "lower"
{ \stemDown <bes, bes,,>4_._\( <a, a,,>_. <f, f,,>_.\) }

>>

%%%%%%%%%%%%%%%
%% MEASURE 3 %%
%%%%%%%%%%%%%%%
\override Score.NoteColumn.ignore-collision = ##t
<<

%% LAYER 1
\setCrossStaffVoiceContext "ctx2"
\easyCrossStaff #layer1DefaultColor %TMODE
  { \CS d'    \CS d'    \CS es'   \CS }
  { \CS <f g> \CS <f g> \CS <f g> \CS }
#'( \CS U     \CS -     \CS -     \CS )

\\
%% LAYER 2
\crossStaffTableVoice #layer2DefaultColor "upper"  "ctx1"
{ \override Voice.NoteColumn.X-offset = -0.4
  \stemUp \"j6" g'8.^-\)^\(\p\< a'16^.\)\! \"j7" g'8.^-^\(\"j19" \<\p
  a'16^.\!\) \"j9" \"j20" \"j8" g'8.^-^\( \<\p a'16^.\) \break
}

\\
%% LAYER 3
\crossStaffTableVoice #layer3DefaultColor "lower"
{ \stemDown \forceHShiftOnVoice -0.4 <bes, bes,,>4_._\( <b, b,,>_. <c c,>_.\) }

>>

%%%%%%%%%%%%%%%
%% MEASURE 4 %%
%%%%%%%%%%%%%%%

<<

%% LAYER 1
\setCrossStaffVoiceContext "ctx2"
\easyCrossStaff #layer1DefaultColor %TMODE
  { \CS \"j24" e'4 \CS f'8      \CS <d' f' bes' d''>      \CS <a d' f' a'> \CS s             \CS s          \CS s             \CS }
  { \CS <f g>4     \CS <f bes>8 \CS s\"j10" [_.\"j11" _\( \CS s_.          \CS <f a d' f'>_. \CS <d a d'>_. \CS <g bes d'>]_. \CS }
#'( \CS U          \CS -        \CS D                     \CS -            \CS -             \CS -          \CS -             \CS )

\\
%% LAYER 2
\crossStaffTableVoice #layer2DefaultColor "upper" "ctx1"
{  \time 4/4 \"j12" g'8.^-\"j13" ^\( bes'16\! \"j14" r8\)\"j15" \pp
   \revert Voice.NoteColumn.X-offset
   <f'' bes'' f'''>[^.^\( <d'' a'' d'''>^. \CS <a' d'' a''>^. <f' a' d'' f''>^. <g' bes' d'' g''>]^.
}

\\
%% LAYER 3
\crossStaffTableVoice #layer3DefaultColor "lower"
{ \stemDown <cis cis,>4_._\( <d d,>2_.\) s4 }

>>

%%%%%%%%%%%%%%%
%% MEASURE 5 %%
%%%%%%%%%%%%%%%

<<

%% LAYER 1
\crossStaffTableVoice #layer1DefaultColor "upper" "ctx1"
{
  \time 3/4 <e' g' c'' e''>8[-. <d' f' a' d''>-. <d' f' bes' d''>-.
  <c' e' g' c''>]-. <f' a' c'' f''>4--\) \bar "||"
}

\\
%% LAYER 2
\crossStaffTableVoice #layer2DefaultColor "lower" "ctx2"
{ <c g c'>8\"j16" [_. <d a>_. <bes, f bes>_. <c g>]_. <f, c f>4_-\) }

>>

%%%%%%%%%%%%%%%
%% MEASURE 6 %%
%%%%%%%%%%%%%%%

<<

%% LAYER 1
\easyCrossStaff #layer1DefaultColor %TMODE
  { \CS s4 \CS \"j21" \"j23" b8.\"j17" [ \CS c'16] \CS s \CS }
  { \CS s4 \CS \"j22" \"j18" b,8.        \CS c16   \CS s \CS }
#'( \CS -  \CS U                         \CS -     \CS - \CS )

%% LAYER 2
\crossStaffTableVoice #layer2DefaultColor "upper"
{ r8 <f' bes' d'' f''>4^\(^. <g' b' es'' g''>^. <a' cis'' f'' a''>8^.\) }

%% LAYER 3
\crossStaffTableVoice #layer3DefaultColor "upper"
{ bes4 }

%% LAYER 4
\crossStaffTableVoice #layer4DefaultColor "lower"
{ r8 <f bes d'>4^. <g b es'>^. <a cis' f'>8^. }

%% LAYER 5
\crossStaffTableVoice #layer5DefaultColor "lower"
{ \stemDown <bes, bes,,>4_._\(\p \CS <a, a,,>_. <f, f,,>_.\) }

>>

} %end upper
lower = { }

\include "../lib/ly/piano-template.ly"