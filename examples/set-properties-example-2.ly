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

    % Dynamics (works for pedal spanners too)
    \time 6/4
    c' \jsTweak "1" "Y-offset" #'(-7.4) DynamicLineSpanner \mf
    c' \jsTweak "2" "X-offset" #'(-7.7) \mf
    c' \jsTweak "3" "padding" #'(3.209) DynamicLineSpanner \mf
    c' \jsTweak "4" "outside-staff-padding" #'(3.088) DynamicLineSpanner \mf
    c' \jsTweak "5" "staff-padding" #'(5.388) DynamicLineSpanner \mf
    c' \jsTweak "6" "extra-offset-y" #'(-5.827) \mf
    \break

    % Beams
    \time 2/4
    f8 \jsOnceOffset "7" "positions" #'(-3.304 . 0.355) [ c' c' e'']
    \break

    % Scripts
    \time 6/4
    c'4 \jsTweak "8" "Y-offset" #'(-6.3) _>
    c' \jsTweak "9" "X-offset" #'(-0.1) _>
    c' \jsTweak "10" "padding" #'(2.300) _>
    % Give an outside-staff-priority to the script in order to make
    % outside-staff-padding property work for this
    \once \override Script.outside-staff-priority = 100
    c' \jsTweak "11" "outside-staff-padding" #'(2.300) _>
    c' \jsTweak "12" "staff-padding" #'(4.300) _>
    c' \jsTweak "13" "extra-offset-y" #'(-1.987) _>
    \break

    % Note Columns
    \time 3/4
    c'
    % Tune the distance between the small red marker and
    % the blue vertical bar displayed in the SVG panel
    \jsOnceOverride "14" "X-offset" #'(12.900) NoteColumn c'
    c'
    \break

    % Curves
    \time 6/4
    c' \jsShape "15" "cpts" #'((0 . 0) (-2.176 . -3.505) (2.383 . -3.505) (0 . 0)) (
    c' )
    c' \jsShape "16" "cpts" #'((0 . 0) (-2.176 . -3.505) (2.383 . -3.505) (0 . 0)) \(
    c' \)
    c' \jsShape "17" "cpts" #'((0 . 0) (-1.371 . -4.701) (1.352 . -4.614) (0 . 0)) ~
    c'
    \break

    % OttavaBrackets
    \time 3/4
    \ottava #1
    \jsOnceOverride "18" "Y-offset" #'(6.600) Staff.OttavaBracket
    \jsOnceOverride "19" "shorten-pair" #'(-5.151 . 0) Staff.OttavaBracket
    c''''
    c'''' \ottava #0 r
    \break

    % NOTE: "shorten-pair" works for pedal brackets too

    % TextScripts
    \time 6/4
    c' \jsTweak "20" "Y-offset" #'(-8.8) _"text"
    c' \jsTweak "21" "X-offset" #'(2.100) _"text"
    c' \jsTweak "22" "padding" #'(5.100) _"text"
    c' \jsTweak "23" "outside-staff-padding" #'(3.600) _"text"
    c' \jsTweak "24" "staff-padding" #'(6.600) _"text"
    c' \jsTweak "25" "extra-offset-y" #'(-3.004) _"text"
    \break

}

\paper {
  system-system-spacing.basic-distance = #15
}

\layout {
  \context {
    \Staff
      \override StaffSymbol.output-attributes.gridify = $showEditorStuff
      \override StaffSymbol.output-attributes.gridstep = "3"
  }
}