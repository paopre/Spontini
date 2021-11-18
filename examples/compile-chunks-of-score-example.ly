%
% Created (14/11/2021) by Paolo-Prete.
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

% THIS EXAMPLE SHOWS HOW TO QUICKLY TEST IF A SINGLE MEASURE
% DOESN'T HAVE ERRORS.
%
% Select a single measure with the mouse and
% compile it with "TOOLS--->Compile selected chunks"
% It will be compiled (no output will be generated) together
% with the score included between __COMMONSTART__ and __COMMONEND__ tags

\include "../lib/ly/tabular-functions.ly"
\version "2.19.84"

upper = {
%__COMMONDELIMITER__

\time 2/4

% Correct measure!
\easyCrossStaff %TMODE
  { \CS s8   \CS s  \CS e'' \CS f''] \CS }
  { \CS c'8[ \CS d' \CS s   \CS s    \CS }
#'( \CS C    \CS -  \CS -   \CS -    \CS )

% Correct measure!
\easyCrossStaff %TMODE
  { \CS s8   \CS s  \CS e'' \CS f''] \CS }
  { \CS c'8[ \CS d' \CS s   \CS s    \CS }
#'( \CS C    \CS -  \CS -   \CS -    \CS )

% Ouch! There's an error here.
% Try to compile this chunk alone
X\easyCrossStaff %TMODE
  { \CS s8   \CS s  \CS e'' \CS f''] \CS }
  { \CS c'8[ \CS d' \CS s   \CS s    \CS }
#'( \CS C    \CS -  \CS -   \CS -    \CS )

% Correct measure!
\easyCrossStaff %TMODE
  { \CS s8   \CS s  \CS e'' \CS f''] \CS }
  { \CS c'8[ \CS d' \CS s   \CS s    \CS }
#'( \CS C    \CS -  \CS -   \CS -    \CS )

%__COMMONDELIMITER__
} %end upper
lower = { }

\include "../lib/ly/piano-template.ly"