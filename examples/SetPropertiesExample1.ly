%
% Created (24/01/2020) by Paolo-Prete.
% This file is part of Spontini project.
% 
% Spontini is free software: you can redistribute it and/or modify
% it under the terms of the GNU General Public License as published by
% the Free Software Foundation, either version 3 of the License, or
% (at your option) any later version.
% Spontini is distributed in the hope that it will be useful,
% but WITHOUT ANY WARRANTY; without even the implied warranty of
% MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
% GNU General Public License for more details.
%
% You should have received a copy of the GNU General Public License
% along with Spontini. If not, see <http://www.gnu.org/licenses/>.
%

\version "2.19.84"
\include "../lib/JSSVG.ly"

{
    % Lilypond standard
    %
    % Tweak
    c' c'\tweak extra-offset #'(0.71 . -3.539) \mf c' c'
    % Override
    c' \once \override DynamicText.extra-offset = #'(1.806 . -2.388) c'\mf c' c'
}
{
    % Spontini's map
    %
    % Tweak
    c' c'\jsTweak "1" "extra-offset" #'(0.71 . -3.539) \mf c' c'
    % Override
    c' \jsOnceOverride "2" "extra-offset" #'(1.806 . -2.388) DynamicText c'\mf c' c'
}
