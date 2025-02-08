%
% Created (14/11/2022) by Paolo-Prete.
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

  % OttavaBrackets
  \ottava #1
  % FIXME: remove when https://github.com/dagmike/BinPacking/issues/15 is solved. And uncomment dasharrays
  % in perceptualrefs *.svg
  \once \override Staff.OttavaBracket.dash-fraction = 1
  \once \override Staff.OttavaBracket.Y-offset = 7.6
  \jsOnceOverride "20" "shorten-pair" #'(-2.246 . -8.995) Staff.OttavaBracket
  c''''
  c'''' \ottava #0
  r1
  \break

  % Curves
  c'4 \jsShape "22" "cpts" #'((0 . 0) (-2.263 . -5.745) (2.271 . -5.608) (0 . 0)) (
  c' )
  c''' \jsShape "23" "cpts" #'((0 . 0) (-2.295 . 2.933) (2.287 . 2.818) (0 . 0)) \(
  c''' \)
  r2
  \break

  % Beams
  r2
  f8\jsOnceOffset "26" "positions" #'(6.767 . 4.901) [ c' c' c'']
  f \jsOnceOffset "27" "positions" #'(5.793 . 3.451) [ c' c' e'']
  \break

  % Note Columns
  c'4
  % Tune the distance between the small red marker and
  % the blue vertical bar displayed in the SVG panel
  \jsOnceOverride "28" "X-offset" #'(-10.4) Staff.NoteColumn << c' \\ s >>
  r1
  \break

}

\paper {
  indent = 0\cm
  system-system-spacing.basic-distance = #20
  top-margin = 5\mm
}

\header {
  tagline = ##f
}

\layout {
  \context {
    \Staff
      \override StaffSymbol.output-attributes.gridify = $showEditorStuff
      \override StaffSymbol.output-attributes.gridstep = "4"
  }
}
