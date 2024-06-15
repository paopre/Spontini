% set autoformat off
%
% Created (10/10/2020) by Paolo-Prete.
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

% Taken from:
% http://lilypond.org/doc/v2.19/Documentation/learning/string-quartet
%
% This example shows how parts can be automatically managed.
% Play with parts by moving them inline/included with:
%
%   TOOLS ---> Make all __BLOCK__s included
%   TOOLS ---> Make all __BLOCK__s inline
%   TOOLS ---> Make __BLOCK__ included
%   TOOLS ---> Make __BLOCK__ inline
%
% When using "Make __BLOCK__ included/inline", the name of the wanted block will be asked:
% it corresponds to the string soon after "__BLOCK__" token, for example: "string-quartet-template_violinOne".
% Note too that:
%   1) jssvg editing is disabled for all the included blocks.
%   2) when making a block included, a string in the form "maxjssvgid=NUM" will be added to the block.
%      DON'T REMOVE IT MANUALLY! This string stores the value of the max generated ID of the \jsXXX functions
%      inside the included block, and the editor will use it for generating the next useful ID for any new added \jsXXX function.

\version "2.19.84"
\include "../lib/ly/jssvg.ly"

global= {
  \time 4/4
  \key c \major
}

%{__BLOCK__string-quartet-template_violinOne%}
violinOne = \new Voice \relative c'' {
  c2 d\jsTweak "1" "extra-offset-y" #'() \mf
  e1
  \bar "|."
}
%{%}

%{__BLOCK__string-quartet-template_violinTwo%}
violinTwo = \new Voice \relative c'' {
  g2 f\jsTweak "2" "extra-offset-y" #'(-0.879) \mf
  e1
  \bar "|."
}
%{%}

%{__BLOCK__string-quartet-template_viola%}
viola = \new Voice \relative c' {
  \clef alto
  e2 d\jsTweak "3" "extra-offset-y" #'(-0.584) \mf
  c1
  \bar "|."
}
%{%}

%{__BLOCK__string-quartet-template_cello%}
cello = \new Voice \relative c' {
  \clef bass
  c2 b\jsTweak "4" "extra-offset-y" #'(-0.59) \mf
  a1
  \bar "|."
}
%{%}

\score {
  \new StaffGroup <<
    \new Staff << \global \violinOne >>
    \new Staff << \global \violinTwo >>
    \new Staff << \global \viola >>
    \new Staff << \global \cello >>
  >>
  \layout { }
  \midi { }
}