%
% Created (16/10/2021) by Paolo-Prete.
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
% Each pair of "__SECTION__sectionNumber" and "__SECTIONEND__"
% tags marks a text area which can be excluded or included by
% the compiler with (just play with it!):
%
% TOOLS--->Add pages/sections filter
%
% Note 1) if you include 1;3 sections, section 3 will have the wrong clef.
% Note 2) multiple sections with the same sectionNumber are allowed
%

\version "2.19.84"
\include "../lib/ly/misc.ly"

\SECTIONSTART 1
\markup {
  \box
  "This is visible only if section 1 is included"
}
\SECTIONEND

{

\SECTIONSTART 1
\mark \markup { \box "Section 1" }
c'4 d' e' f' \break
\SECTIONEND

\SECTIONSTART 2
\mark \markup { \box "Section 2" }
f' e' d' c' \break
\SECTIONEND

\SECTIONSTART 3
\mark \markup { \box "Section 3" }
d'8 d' d' d' d' d' d' d'
d'8 d' d' d' d' d' d' d' \break
\SECTIONEND

\SECTIONSTART 4
\mark \markup { \box "Section 4" }
c'1 d' \break
\SECTIONEND

\SECTIONSTART 5
\mark \markup { \box "Section 5" }
e'1 \break
\SECTIONEND

\SECTIONSTART 6
\mark \markup { \box "Section 6" }
r1 r \break
\SECTIONEND

\SECTIONSTART 7
\mark \markup { \box "Section 7" }
c'4 d' e' f' \break
\SECTIONEND

}