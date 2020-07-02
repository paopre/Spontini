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

\include "../lib/easy-cross-staff.ly"
\version "2.19.84"

upper = {

\easyCrossStaff %TMODE
  { c'8\mf[ \CS c'] \CS }
  { s8      \CS c'  \CS }
#'( U       \CS -   \CS )

} %end upper                                                                                                                                                                                                                                                                            
lower = { }

\include "../lib/piano-template.ly"
