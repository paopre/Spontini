%
% Created (24/06/2020) by Paolo-Prete.
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

#(define volatinaFontSize -4.8)
volatina = #(define-music-function (parser location frac mus) (pair? ly:music?)
#{
   \override Voice.NoteHead.font-size = #volatinaFontSize
   \override Voice.Rest.font-size = #volatinaFontSize
   \override Voice.Accidental.font-size = #volatinaFontSize
   \override Voice.Script.font-size = #volatinaFontSize
   \once \override Voice.TupletBracket.stencil = ##f
   \once \override Voice.TupletNumber.stencil = ##f
   \tuplet $frac $mus
   \revert Voice.NoteHead.font-size
   \revert Voice.Rest.font-size
   \revert Voice.Accidental.font-size
   \revert Voice.Script.font-size
#})

shClefAtLeft = #(define-music-function (parser location num) (number?)
#{ \once\override Staff.Clef.X-extent = #(cons num num) #})
