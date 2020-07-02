%
% Created (24/06/2020) by Paolo-Prete.
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

\include "../lib/jssvg.ly"
\include "../lib/easy-cross-staff.ly"
\version "2.19.84"

upper = {

\tabularTwoStavesPolyII %TMODE
  { \stemUp c'''4 \CS d'''4 \CS e''' \CS f''' \CS }
  { \stemDown a'2 \CS       \CS b'2  \CS      \CS }%_
  { c'1           \CS       \CS      \CS      \CS }%
  { \stemUp g'4   \CS a'2.  \CS      \CS      \CS }

} %end upper                                                                                                                                                                                                                                                                            
lower = { }

\include "../lib/piano-template.ly"