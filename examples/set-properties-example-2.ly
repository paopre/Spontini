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

\version "2.19.84"
\include "../lib/ly/jssvg.ly"

% Set this to "false" if you want to hide all the editor's additional objects
$(set! showEditorStuff "true")
% Set this to change the diameter of the control points of the curves (default = 0.6)
$(set! cpDiameter 0.5)

{

  % This include is needed for regression tests only. You don't need it in your own projects
  \include "regression-helper.ily"

  \override Score.TimeSignature.stencil = ##f
  \time 6/4

  % Dynamics (works for pedal spanners too)
  c' \jsTweak "1" "extra-offset" #'(3.868 . -4.322) \mf
  c' \jsTweak "2" "X-offset" #'(-8) \mf
  c' \jsTweak "3" "Y-offset" #'(-7.4) DynamicLineSpanner \mf
  c' \jsTweak "4" "padding" #'(3.309) DynamicLineSpanner \mf
  c' \jsTweak "5" "outside-staff-padding" #'(3.288) DynamicLineSpanner \mf
  c' \jsTweak "6" "staff-padding" #'(5.388) DynamicLineSpanner \mf
  \break

  % Scripts
  c' \jsTweak "7" "extra-offset-y" #'(-4.15) _>
  c' \jsTweak "8" "X-offset" #'(-5.3) _>
  c' \jsTweak "9" "Y-offset" #'(-8.4) _>
  c' \jsTweak "10" "padding" #'(4.400) _>
  % Give an outside-staff-priority to the script in order to make
  % outside-staff-padding property work for this
  \once \override Script.outside-staff-priority = 100
  c' \jsTweak "11" "outside-staff-padding" #'(4.400) _>
  c' \jsTweak "12" "staff-padding" #'(6.300) _>
  \break

  % TextScripts
  c' \jsTweak "13" "extra-offset" #'(2.232 . -3.77) _"text"
  c' \jsTweak "14" "X-offset" #'(-8.8) _"text"
  c' \jsTweak "15" "Y-offset" #'(-9.4) _"text"
  c' \jsTweak "16" "padding" #'(5.700) _"text"
  c' \jsTweak "17" "outside-staff-padding" #'(4.300) _"text"
  c' \jsTweak "18" "staff-padding" #'(7.400) _"text"
  \break

  % OttavaBrackets
  \ottava #1
  \jsOnceOverride "19" "Y-offset" #'(7.600) Staff.OttavaBracket
  \jsOnceOverride "20" "shorten-pair" #'(-2.246 . -8.995) Staff.OttavaBracket
  c''''
  c'''' \ottava #0
  r
  \jsOnceOverride "21" "extra-offset" #'(-4.687 . 0.527) Staff.OttavaBracket
  \ottava #1 c''''
  c'''' \ottava #0
  r
  \break

  % Curves
  c' \jsShape "22" "cpts" #'((0 . 0) (-2.263 . -5.745) (2.271 . -5.608) (0 . 0)) (
  c' )
  c''' \jsShape "23" "cpts" #'((0 . 0) (-2.295 . 2.933) (2.287 . 2.818) (0 . 0)) \(
  c''' \)
  c' \jsShape "24" "cpts" #'((0 . 0) (-1.517 . -3.842) (1.444 . -3.788) (0 . 0)) ~
  c'
  \break

  % Beams
  f8 \jsOnceOffset "25" "positions" #'(-3.605 . 1.149) [ c' c' e'']
  f \jsOnceOffset "26" "positions" #'(4.573 . -0.814) [ c' c' c'']
  f \jsOnceOffset "27" "positions" #'(3.477 . 1.149) [ c' c' e'']
  \break

  % Note Columns
  c'4
  % Tune the distance between the small red marker and
  % the blue vertical bar displayed in the SVG panel
  \jsOnceOverride "28" "X-offset" #'(-10.4) Staff.NoteColumn << c' \\ s >>
  c'
  c'
  \jsOnceOverride "29" "X-offset" #'(-7.5) Staff.NoteColumn << c' \\ s >>
  c'
  \break

}

\paper {
  indent = 0\cm
  system-system-spacing.basic-distance = #20
}

\layout {
  \context {
    \Staff
      \override StaffSymbol.output-attributes.gridify = $showEditorStuff
      \override StaffSymbol.output-attributes.gridstep = "3"
  }
}