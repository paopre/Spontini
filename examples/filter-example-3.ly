% set autoformat off
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
% A combination of sections and pageBreaks (see filter-example-2(3).ly
% The markup at the beginning of the score gets included with pageBreak 1 by using the
% LINKPAGEBREAK <pageBreakNumber>  and UNLINKPAGEBREAK commands
% Note: Redundant clef, key and ottava changes are added where needed, so to have
% them if the sections they belong to are included at the beginning of the score.

\version "2.19.84"
\include "../lib/ly/misc.ly"
#(define keyChange 0)

\paper
{
  indent = 0
  ragged-last-bottom = ##f
  print-page-number = ##f
}

\LINKPAGEBREAK 1
\SECTIONSTART 1
\markup {
  \box
  "This is visible only if section 1 or pageBreak 1 is included"
}
\SECTIONEND
\UNLINKPAGEBREAK

{

\pageBreakDummy

\SECTIONSTART 1
\mark \markup { \box "Section 1" }
#(set! keyChange 1)
\key f \major c'4 d' bes' \clef bass f, \break
\SECTIONEND

\SECTIONSTART 2
\clef bass
#(if (eq? keyChange 0) #{ \key f \major #})
\mark \markup { \box "Section 2" }
bes, e, bes, \clef treble c' \break
\SECTIONEND

\pageBreak

\SECTIONSTART 3
\mark \markup { \box "Section 3" }
d'8 d' d' d' d' d' d' d'
d'8 d' d' d' d' d' \ottava #1 d''' d''' \break
\SECTIONEND

\SECTIONSTART 4
\ottava #1
\mark \markup { \box "Section 4" }
c'''1 \ottava #0 d' \break
\SECTIONEND

\pageBreak

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

\pageBreakDummy

}