%
% Created (28/11//2021) by Paolo-Prete.
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
% See filter-example-1.ly.
% This example is focused on pages. You can exclude them by using 'pageBreak' as bookmark and
% adding a 'p' character at the beginning of the string that defines what to include/exclude
% Note: a pageBreakDummy command (which has no effect on the score) must be placed at the beginning of first page and at the end of the last page,
% so to help the filter to check pages in the score.
%

\version "2.19.84"
\include "../lib/ly/misc.ly"

#(set! paper-alist (cons '("my size" . (cons (* 209 mm) (* 29.7 mm))) paper-alist))
\paper {
  print-page-number = ##f
  #(set-paper-size "my size")
  ragged-last = ##f
  oddFooterMarkup = \markup \fill-line { " " }
  evenFooterMarkup = \markup \fill-line { " " }
}

{

\pageBreakDummy

\mark \markup { \box "Page 1" }
c' c' c' c'

\pageBreak

\mark \markup { \box "Page 2" }
d' d' d' d'

\pageBreak

\mark \markup { \box "Page 3" }
e' e' e' e'

\pageBreak

\mark \markup { \box "Page 4" }
f' f' f' f'

\pageBreak

\mark \markup { \box "Page 5" }
g' g' g' g'

\pageBreakDummy

}