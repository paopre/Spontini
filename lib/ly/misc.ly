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

% Thanks to Harm, see: http://lilypond.1069038.n5.nabble.com/angle-of-a-tuplet-bracket-td55019.html
tupletAngles =
#(define-music-function (parser location y-off angl)(number? number?)
"
 angl is supposed to be the angle of the TupletBracket in degrees,
 y-off a (possible) offset in Y-direction
 "
#{
\once\override TupletBracket.after-line-breaking =
#(lambda (grob)
  (let* ((pos (ly:grob-property grob 'positions))
         (y-length (interval-length pos))
         (st (ly:tuplet-bracket::print grob))
         (st-x-ext (ly:stencil-extent st X))
         (st-x-length (interval-length st-x-ext))
         (alpha (degrees->radians angl))
         (new-start (+ (car pos) y-off))
         (new-y (* st-x-length (tan alpha))))
  (ly:grob-set-property! grob 'positions (cons new-start (+ new-start new-y)))))
#})

checkFontFile = #(define-scheme-function (parser location fontName fontFile) (string? string?)
(let
  ((warning (not (string-contains (ly:font-config-get-font-file fontName) fontFile))))
  (if warning
    (begin
      (display "\nwarning: font '")
      (display fontFile)
      (display "' not found!\n")
    )
  )
))

#(define dummyNum 0)
CHUNKSTART = {}
CHUNKEND = {}
COMMONDELIMITER = #(define-scheme-function (parser location) () (set! dummyNum 0))
SECTIONSTART = #(define-scheme-function (parser location sectionNum) (number?) (set! dummyNum 0))
LINKPAGEBREAK = #(define-scheme-function (parser location pbNum) (number?) (set! dummyNum 0))
SECTIONEND = #(define-scheme-function (parser location) () (set! dummyNum 0))
UNLINKPAGEBREAK = #(define-scheme-function (parser location) () (set! dummyNum 0))
pageBreakDummy = {}
