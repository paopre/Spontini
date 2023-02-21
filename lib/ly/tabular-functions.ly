%
% Created (09/01/2020) by Paolo-Prete.
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
% along with Spontini-Editor.  If not, see <http://www.gnu.org/licenses/>.
%

\version "2.19.84"

% WORKAROUND FOR https://gitlab.com/lilypond/lilypond/-/issues/6482
% See: https://lists.gnu.org/archive/html/lilypond-user/2023-02/msg00367.html (thanks to J. A. Samra!)
noSkipTuplets =
\musicMap
#(lambda (m)
   (if (and (eq? (list-ref (ly:version) 1) 25)
            (music-is-of-type? m 'time-scaled-music)
            (every (lambda (e)
                     (music-is-of-type? e 'skip-event))
                   (extract-typed-music m 'rhythmic-event)))
       (ly:music-property m 'element)
       m))
\etc
toplevel-music-functions = #(cons noSkipTuplets toplevel-music-functions)
% END OF WORKAROUND

#(define smartBeams "false")

#(define-public (spontiniRgbColor? x)
   (and (list? x)
        (= 3 (length x))
        (every number? x)
        (every (lambda (y) (<= 0 y 1)) x)))

#(define crossStaffTrash #{
  \override Flag.stencil = ##f
  \override BreathingSign.stencil = ##f
  \override TupletBracket.stencil = ##f
  \override TupletNumber.stencil = ##f
  \override Fingering.stencil = ##f
#})

#(define upperStaffName "upper")
#(define lowerStaffName "lower")

staffUp = \change Staff = $upperStaffName
staffDown = \change Staff = $lowerStaffName
CS = {}

setCrossStaves = #(define-scheme-function (parser location upperName lowerName) (string? string?)
  (set! upperStaffName upperName)
  (set! lowerStaffName lowerName)
)

tupletUp = #(define-music-function (parser location frac vis mus) (pair? (boolean? #t) ly:music?)
#{ \once \override TupletBracket.direction = #UP
   \once \override TupletBracket.bracket-visibility = #vis
   \tuplet $frac $mus
#})

tupletDown = #(define-music-function (parser location frac vis mus) (pair? (boolean? #t) ly:music?)
#{ \once \override TupletBracket.direction = #DOWN
   \once \override TupletBracket.bracket-visibility = #vis
   \tuplet $frac $mus
#})

hiddenTuplet = #(define-music-function (parser location frac mus) (pair? ly:music?)
#{
   \once \override TupletBracket.stencil = ##f
   \once \override TupletNumber.stencil = ##f
   \tuplet $frac $mus
#})

getDuration = #(define-scheme-function (parser location mus) (ly:music?)
(let ((ret '()))
(begin

  (map-some-music (lambda (y)
    (let ((name (ly:music-property y 'name)))
      (cond
        ((or (eq? name 'NoteEvent)(eq? name 'RestEvent)(eq? name 'SkipEvent))
          (set! ret (ly:music-property y 'duration))
        y)
        (else #f))))
  mus)
)
ret))

getArticulationsOfNoteOrChord = #(define-scheme-function (parser location mus) (ly:music?)
(let ((ret '()))
(begin
  (map-some-music (lambda (y)
    (let ((name (ly:music-property y 'name)))
      (cond
        ((and (not (eq? name 'BeamEvent))(not (eq? name 'NoteEvent))(not (eq? name 'EventChord)))
          (set! ret (cons y ret))
        y)
        (else #f))))
  mus)
)
ret))

edgeNoteInChord = #(define-scheme-function (parser location direction chord) (number? ly:music?)
(let ((ret '())
      (maxPitchSteps -1000)
      (minPitchSteps 1000)
      (maxPitch '())
      (minPitch '()))
(begin

  (map-some-music (lambda (y)
    (let ((name (ly:music-property y 'name)))
      (cond
        ((eq? name 'NoteEvent)

          (if ( > (ly:pitch-steps (ly:music-property y 'pitch)) maxPitchSteps)
            (begin
              (set! maxPitchSteps (ly:pitch-steps (ly:music-property y 'pitch)))
              (set! maxPitch (ly:music-property y 'pitch))))

          (if ( < (ly:pitch-steps (ly:music-property y 'pitch)) minPitchSteps)
            (begin
              (set! minPitchSteps (ly:pitch-steps (ly:music-property y 'pitch)))
              (set! minPitch (ly:music-property y 'pitch))))

        y)
        (else #f))))
  chord)

  (if (eq? direction 1)
    (set! ret maxPitch)
    (set! ret minPitch))

)
ret))

horizontalTuplets =
\override TupletBracket.stencil =
#(lambda (grob)
  (let* ((pos (ly:grob-property grob 'positions))
        (dir (ly:grob-property grob 'direction))
        (new-pos (if (= dir 1)
                   (max (car pos)(cdr pos))
                   (min (car pos)(cdr pos)))))
   (ly:grob-set-property! grob 'positions (cons new-pos new-pos))
   (ly:tuplet-bracket::print grob)))

#(define (nth n l)
  (if (or (> n (length l)) (< n 0))
    (error "Index out of bounds.")
    (if (eq? n 0)
      (car l)
      (nth (- n 1) (cdr l)))))

putBeamsAndStemsDirectionsOnMusicAsProperty =
#(define-scheme-function (parser location mus beamPositions staffNum) (ly:music? list? number?)
  (let ((counter 0)
        (beamPositionsTemp '())
        (currBeamPos '()))
  (begin

    (set! currBeamPos (nth 0 beamPositions))

    (map (lambda (x)
      (if (or (eq? x 'U) (eq? x 'C) (eq? x 'D) (eq? x 'N))
        (set! currBeamPos x))
      (if (or (eq? x 'U) (eq? x 'C) (eq? x 'D) (eq? x 'N) (eq? x '-))
        (set! beamPositionsTemp (cons currBeamPos beamPositionsTemp)))
    ) beamPositions )

    (set! beamPositions beamPositionsTemp)
    (set! beamPositions (reverse beamPositions))

    (map-some-music (lambda (evt)
      (let ((name (ly:music-property evt 'name)))
        (cond
          ((or (eq? name 'NoteEvent) (eq? name 'RestEvent) (eq? name 'SkipEvent) (eq? name 'EventChord))

            (ly:music-set-property! evt 'idx counter)
            (ly:music-set-property! evt 'beamPosition (nth counter beamPositions))

            (if (eq? (nth counter beamPositions) 'U)
              (set! evt #{ \once \stemUp $evt #}))

            (if (eq? (nth counter beamPositions) 'D)
              (set! evt #{ \once \stemDown $evt #}))

            (if (and (eq? staffNum 1) (eq? (nth counter beamPositions) 'C))
              (set! evt #{ \once \stemDown $evt #}))

            (if (and (eq? staffNum 2) (eq? (nth counter beamPositions) 'C))
              (set! evt #{ \once \stemUp $evt #}))

            (set! counter (+ counter 1))
            evt)
          (else #f))))
    mus))))

replaceSkipsWithInvisibleRests = #(define-scheme-function (parser location mus) (ly:music?)
  (map-some-music (lambda (evt)
    (let ((name (ly:music-property evt 'name))
          (beamPos (ly:music-property evt 'beamPosition))
          (fakeRest '()))
      (cond
        ((and (eq? name 'SkipEvent)(or (eq? beamPos 'U)(eq? beamPos 'D)))
          (set! fakeRest (make-music 'RestEvent))
          (ly:music-set-property! fakeRest 'duration (ly:music-property evt 'duration))
          (ly:music-set-property! fakeRest 'articulations (ly:music-property evt 'articulations))
          (set! evt #{ \once \override Rest.stencil = ##f \once \override Dots.stencil = ##f $fakeRest #} )
          evt)
        (else #f))))
  mus))

removeUnwantedBeamsI = #(define-scheme-function (parser location mus) (ly:music?)
  (map-some-music (lambda (evt)
    (let ((name (ly:music-property evt 'name))
          (beamPos (ly:music-property evt 'beamPosition))
          (fakeRest '()))
        (cond

          ((and (eq? name 'SkipEvent)(eq? beamPos 'C))
            (map-some-music (lambda (x)
              (let ((name (ly:music-property x 'name)))
                (cond
                  ((eq? name 'BeamEvent)
                    (set! x '())
                    x)
                  (else #f))))
            evt)
          evt)

        (else #f))))
  mus))

removeUnwantedBeamsII = #(define-scheme-function (parser location mus dir) (ly:music? scheme?)
  (map-some-music (lambda (evt)
    (let ((name (ly:music-property evt 'name))
          (beamPos (ly:music-property evt 'beamPosition))
          (fakeRest '()))
        (cond

          ((and (or (eq? name 'SkipEvent)(eq? name 'NoteEvent)(eq? name 'EventChord))
                (or (and (eq? beamPos 'U)(eq? dir 'D))(and (eq? beamPos 'D)(eq? dir 'U))))
            (map-some-music (lambda (x)
              (let ((name (ly:music-property x 'name)))
                (cond
                  ((eq? name 'BeamEvent)
                    (set! x '())
                    x)
                  (else #f))))
            evt)
          evt)

        (else #f))))
  mus))

removeMidiGraces = #(define-scheme-function (parser location mus) (ly:music?)
  (map-some-music (lambda (evt)
    (let ((name (ly:music-property evt 'name))
          (midiGraces (ly:music-property evt 'midi-graces)))
      (cond
        ((and (eq? name 'TimeScaledMusic))

         (if (not (eq? midiGraces '()))
          (begin
           (ly:music-set-property! evt 'denominator (- (ly:music-property evt 'denominator) midiGraces))

           (map-some-music (lambda (evt2)
            (let ((name2 (ly:music-property evt2 'name)))
             (cond
              ((or (eq? name2 'NoteEvent)(eq? name2 'SkipEvent)(eq? name2 'RestEvent))
                (ly:music-set-property! evt2 'duration (ly:make-duration 3 0 (ly:music-property evt 'numerator) (ly:music-property evt 'denominator)))
                evt2)

              ((eq? name2 'EventChord)
                (map (lambda (x)
                   (ly:music-set-property! x 'duration (ly:make-duration 3 0 (ly:music-property evt 'numerator) (ly:music-property evt 'denominator)))
                ) (ly:music-property evt2 'elements)) ; return the modified note - don't go deeper
                evt2)

              (else #f))
             ))
            evt)))

          evt)
        (else #f))
      ))
  mus)

  (map-some-music (lambda (evt2)
    (let ((name2 (ly:music-property evt2 'name))
          (isMidi (ly:music-property evt2 'id)))
      (cond
        ( (and (or (eq? name2 'RestEvent)(eq? name2 'SkipEvent))(not (eq? isMidi '())))
          (if (eq? isMidi 'midiGrace)
            (set! evt2 '()))
        evt2)
        (else #f))
      ))
  mus)

)

removeCenteredCSMusicAndPreserveArts = #(define-scheme-function (parser location mus dir) (ly:music? number?)
  (map-some-music (lambda (x)
    (let ((name (ly:music-property x 'name))
          (beamPos (ly:music-property x 'beamPosition))
          (tupletAnchor (ly:music-property x 'tupletAnchor))
          (skip '()))
      (cond
        ((and (eq? beamPos 'C)(or (eq? name 'NoteEvent)(eq? name 'RestEvent)(eq? name 'SkipEvent)(eq? name 'EventChord)))

        (if (eq? name 'RestEvent)
          (begin
          (set! skip (make-music 'SkipEvent))
          (ly:music-set-property! skip 'duration (ly:music-property x 'duration))
          (ly:music-set-property! skip 'articulations (ly:music-property x 'articulations))
        ))

        (if (and (eq? name 'SkipEvent)(not (eq? tupletAnchor '())))
          (begin
          (set! skip (make-music 'RestEvent))
          (if (not (eq? (ly:music-property x 'temppitch) '()))
            (ly:music-set-property! skip 'pitch (ly:music-property x 'temppitch)))

          (ly:music-set-property! skip 'duration (ly:music-property x 'duration))
          (ly:music-set-property! skip 'articulations (ly:music-property x 'articulations))
        ))

        (if (and (eq? name 'SkipEvent)(eq? tupletAnchor '()))
          (begin
          (set! skip (make-music 'SkipEvent))
          (ly:music-set-property! skip 'duration (ly:music-property x 'duration))
          (ly:music-set-property! skip 'articulations (ly:music-property x 'articulations))
        ))

        (if (eq? name 'EventChord)
          (begin
          (set! skip x)
          ;(ly:music-set-property! skip 'pitch (edgeNoteInChord dir x))
          ;(ly:music-set-property! skip 'duration (getDuration x))
          ;(ly:music-set-property! skip 'articulations (getArticulationsOfNoteOrChord x))
        ))

        (if (eq? name 'NoteEvent)
          (begin
          (set! skip x)
          ;(ly:music-set-property! skip 'pitch (ly:music-property x 'pitch))
          ;(ly:music-set-property! skip 'duration (ly:music-property x 'duration))
          ;(ly:music-set-property! skip 'articulations (getArticulationsOfNoteOrChord x))
        ))

        (map-some-music (lambda (evt)
          (let ((name (ly:music-property evt 'name)))
            (cond
              ((eq? name 'BeamEvent)
                (set! evt '())
                evt)
              (else #f))))
        x)

        (set! x #{
          \once \override Beam.stencil = ##f
          %\once \hide Rest
          \once \override Rest.stencil = ##f
          \once \override Rest.font-size = -10
          \once \override Stem.stencil = ##f
          \once \override Flag.stencil = ##f
          %\once \hide Stem
          \once \hide Dots
          %\once \hide Flag
          \once \hide Accidental
          \tweak NoteHead.color #red
          \once \override NoteHead.no-ledgers = ##t
          \once \override NoteColumn.ignore-collision = ##t
          \once \override Rest.ignore-collision = ##t
          $skip #})

        x)
        (else #f))))
  mus))

leaveOnlyNotesRestsAndBeams = #(define-scheme-function (parser location mus) (ly:music?)
  (map-some-music (lambda (x)
    (let ((name (ly:music-property x 'name))
          (origArts (ly:music-property x 'articulations))
          (beamPos (ly:music-property x 'beamPosition))
          (overridePropSymbol (ly:music-property x 'symbol))
          (newArts '()))
      (cond

        ((eq? name 'OttavaMusic)
         (set! x #{   #})
        x)

        ((and (eq? name 'NoteEvent)(not (eq? beamPos 'C)))
         (ly:music-set-property! x 'articulations '())
        x)

        ; prevents warning on JSOSOPadder for OttavaBracket
        ((and (eq? name 'OverrideProperty)(eq? overridePropSymbol 'OttavaBracket))
         (set! x '())
        x)

        ((or (eq? name 'ArticulationEvent)
             (eq? name 'AbsoluteDynamicEvent)
             (eq? name 'ScriptEvent)
             (eq? name 'TextScriptEvent)
             (eq? name 'TextSpanEvent)
             (eq? name 'MeasureCounterEvent)
             (eq? name 'PhrasingSlurEvent)
             (eq? name 'SlurEvent)
             (eq? name 'TieEvent)
             (eq? name 'SustainEvent)
             (eq? name 'DecrescendoEvent)
             (eq? name 'CrescendoEvent)
             (eq? name 'SostenutoEvent)
             (eq? name 'UnaCordaEvent))
         (set! x '())
        x)

        (else #f))))
  mus))

#(define crossStaffUDBeamThreeshold 0)

makeCrossStaffUDStepOne = #(define-scheme-function (parser location mus1 mus2 dir) (ly:music? ly:music? scheme?)
  (map-some-music (lambda (x)
    (let ((name1 (ly:music-property x 'name))
          (beamPos (ly:music-property x 'beamPosition))
          (idx1 (ly:music-property x 'idx))
          (noCS (ly:music-property x 'noCrossStaff))
          (arts1 (ly:music-property x 'articulations)))
      (cond ;MODMOD
        ((and (not (eq? name1 'RestEvent))(eq? beamPos dir))

            (map-some-music (lambda (y)
              (let ((name2 (ly:music-property y 'name))
                    (idx2 (ly:music-property y 'idx)))
                (cond
                  ((and (not (eq? noCS 'T))(eq? idx1 idx2)(not (eq? name2 'SkipEvent))(not (eq? name2 'RestEvent)))
                   (ly:music-set-property! y 'mustCrossStaff 'T)
                   (set! y #{ \once \override Flag.stencil = ##f $y #})
                  y)
                (else #f))))
            mus2)
        x)
        ;MODMOD
        ((and (eq? name1 'RestEvent)(eq? beamPos dir))

            (map-some-music (lambda (y)
              (let ((name2 (ly:music-property y 'name))
                    (idx2 (ly:music-property y 'idx))
                    (fakeNote (make-music 'NoteEvent))
                    (beam '())
                    (yOffs 0))
                (if (eq? dir 'U)
                  (begin
                    (set! yOffs (- 0 crossStaffUDBeamThreeshold))
                    (set! yOffs (- yOffs 2.5)))
                  (begin
                    (set! yOffs (+ 0 crossStaffUDBeamThreeshold))
                    (set! yOffs (+ yOffs 2.5))))
                (cond
                  ((and (eq? idx1 idx2)(not (eq? name2 'SkipEvent))(not (eq? name2 'RestEvent)))
                   (ly:music-set-property! fakeNote 'duration (getDuration y))
                   (ly:music-set-property! fakeNote 'pitch (ly:make-pitch 0 0))
                   (ly:music-set-property! fakeNote 'articulations arts1)
                   (ly:music-set-property! y 'mustCrossStaff 'T)
                   (set! y #{
                      %TODO tag midi/display
                      \once \override Flag.stencil = ##f
                      $y #})
                   (set! x #{
                       \once \override NoteHead.no-ledgers = ##t
                       \once \hide NoteHead
                       \once \hide Dots
                       \once \hide Accidental
                       \once \override Stem.length = 0
                       #(if (eq? dir 'D)
                        #{ \once \stemDown #}
                        #{ \once \stemUp #})
                       \once \override NoteHead.color = #red
                       \once \override NoteHead.Y-offset = #yOffs
                       $fakeNote
                     #})
                  y)
                (else #f))))
            mus2)
        x)
      (else #f))))
  mus1))

makeCrossStaffUDStepTwo = #(define-scheme-function (parser location mus) (ly:music?)
  ; modify stems upper staff
  (map-some-music (lambda (evt)
    (let ((name (ly:music-property evt 'name))
          (beamPos (ly:music-property evt 'beamPosition))
          (mustCrossStaff (ly:music-property evt 'mustCrossStaff)))
      (cond
        ((and (eq? mustCrossStaff 'T) (or (eq? name 'NoteEvent)(eq? name 'EventChord))
                                      (or (eq? beamPos 'U)(eq? beamPos 'D)))
          (set! evt #{ \once \override Dots.stencil = ##f \crossStaff $evt #} )
          evt)
        (else #f))))
  mus))

#(define layer1DefaultColor darkred)
#(define layer2DefaultColor darkgreen)
#(define layer3DefaultColor blue)
#(define layer4DefaultColor red)
#(define layer5DefaultColor magenta)

#(define (showColoredLayers val)
(if (string=? val "false")
  (begin
		(set! layer1DefaultColor #f)
    (set! layer2DefaultColor #f)
    (set! layer3DefaultColor #f)
    (set! layer4DefaultColor #f)
    (set! layer5DefaultColor #f))))

#(define (override-color-for-all-grobs color)
  (lambda (context)
   (let loop ((x all-grob-descriptions))
    (if (not (null? x))
     (let ((grob-name (caar x)))
      (ly:context-pushpop-property context grob-name 'color color)
      (loop (cdr x)))))))

#(define (boolean-or-color? x) (or (boolean? x) (spontiniRgbColor? x)))

displayColoredMusic = #(define-music-function (parser location musColor mus) ((boolean-or-color? #f) ly:music?)
(if (eq? musColor #f)
#{ $mus #}
#{ \context Voice \applyContext #(override-color-for-all-grobs musColor) $mus #})
)

easyCrossStaff = #(define-music-function (parser location musColor music1 music2 beamPositions)
            ((boolean-or-color? #f) ly:music? ly:music? list?)
#{ \easyCrossStaffAll #musColor #music1 #music2 #beamPositions {} {} {} {} {} {} {} {} #'() #})

easyCrossStaffII = #(define-music-function (parser location musColor music1 music2 beamPositions music3 music4)
            ((boolean-or-color? #f) ly:music? ly:music? list? ly:music? ly:music?)
#{ \easyCrossStaffAll #musColor #music1 #music2 #beamPositions #music3 #music4 {} {} {} {} {} {} #'() #})

easyCrossStaffB = #(define-music-function (parser location musColor music1 music2 beamPositions music3 music5 music7 music9 music4 music6 music8 music10)
            ((boolean-or-color? #f) ly:music? ly:music? list? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music?)
#{ \easyCrossStaffAll #musColor #music1 #music2 #beamPositions #music3 #music4 #music5 #music6 #music7 #music8 #music9 #music10 #'() #})

easyCrossStaffC = #(define-music-function (parser location musColor music1 music2 beamPositions music3 music5 music7 music9 music4 music6 music8 music10 midiMusic)
            ((boolean-or-color? #f) ly:music? ly:music? list? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music?)
#{ \easyCrossStaffAll #musColor #music1 #music2 #beamPositions #music3 #music4 #music5 #music6 #music7 #music8 #music9 #music10 #midiMusic #})

easyCrossStaffIII = #(define-music-function (parser location musColor music1 music2 beamPositions midiMusic)
            ((boolean-or-color? #f) ly:music? ly:music? list? ly:music?)
#{ \easyCrossStaffAll #musColor #music1 #music2 #beamPositions {} {} {} {} {} {} {} {} #midiMusic #})

easyCrossStaffIV = #(define-music-function (parser location musColor music1 music2 beamPositions music3 music4 midiMusic)
            ((boolean-or-color? #f) ly:music? ly:music? list? ly:music? ly:music? ly:music?)
#{ \easyCrossStaffAll #musColor #music1 #music2 #beamPositions #music3 #music4 {} {} {} {} {} {} #midiMusic  #})

easyCrossStaffPolyI = #(define-music-function (parser location musColor musicUpV1 musicUpCS musicDownCS musicDownV1 beamPositions)
            ((boolean-or-color? #f) ly:music? ly:music? ly:music? ly:music? list?)
#{ \easyCrossStaffAll #musColor #musicUpCS #musicDownCS #beamPositions
                      #musicUpV1 #musicDownV1 {} {} {} {} {} {} #'() #})
easyCrossStaffPolyII = #(define-music-function (parser location musColor musicUpV1 musicUpV2 musicUpCS musicDownCS musicDownV1 musicDownV2 beamPositions)
            ((boolean-or-color? #f) ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? list?)
#{ \easyCrossStaffAll #musColor #musicUpCS #musicDownCS #beamPositions
                      #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 {} {} {} {} #'() #})

easyCrossStaffPolyIII = #(define-music-function (parser location musColor musicUpV1 musicUpV2 musicUpV3 musicUpCS
                                                 musicDownCS musicDownV1 musicDownV2 musicDownV3 beamPositions)
            ((boolean-or-color? #f) ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? list?)
#{ \easyCrossStaffAll #musColor #musicUpCS #musicDownCS #beamPositions
                      #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 #musicUpV3 #musicDownV3 {} {} #'() #})

easyCrossStaffPolyIV = #(define-music-function (parser location musColor musicUpV1 musicUpV2 musicUpV3 musicUpV4 musicUpCS
                                                 musicDownCS musicDownV1 musicDownV2 musicDownV3 musicDownV4 beamPositions)
            ((boolean-or-color? #f) ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? list?)
#{ \easyCrossStaffAll #musColor #musicUpCS #musicDownCS #beamPositions
                      #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 #musicUpV3 #musicDownV3 #musicUpV4 #musicDownV4 #'() #})

tabularTwoStavesPolyI = #(define-music-function (parser location musColor musicUpV1 musicDownV1)
            ((boolean-or-color? #f) ly:music? ly:music?)
#{ \easyCrossStaffAll #musColor {} {} #'( - ) #musicUpV1 #musicDownV1 {} {} {} {} {} {} #'() #})

tabularTwoStavesPolyII = #(define-music-function (parser location musColor musicUpV1 musicUpV2 musicDownV1 musicDownV2)
            ((boolean-or-color? #f) ly:music? ly:music? ly:music? ly:music?)
#{ \easyCrossStaffAll #musColor {} {} #'( - ) #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 {} {} {} {} #'() #})

tabularTwoStavesPolyIII = #(define-music-function (parser location musColor musicUpV1 musicUpV2 musicUpV3 musicDownV1 musicDownV2 musicDownV3)
            ((boolean-or-color? #f) ly:music? ly:music? ly:music? ly:music? ly:music? ly:music?)
#{ \easyCrossStaffAll #musColor {} {} #'( - ) #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 #musicUpV3 #musicDownV3 {} {} #'() #})

tabularTwoStavesPolyIV = #(define-music-function (parser location musColor musicUpV1 musicUpV2 musicUpV3 musicUpV4 musicDownV1 musicDownV2 musicDownV3 musicDownV4)
            ((boolean-or-color? #f) ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? )
#{ \easyCrossStaffAll #musColor {} {} #'( - ) #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 #musicUpV3 #musicDownV3 #musicUpV4 #musicDownV4 #'() #})

forceHShiftOnVoice =  #(define-music-function (parser location num) (number?)
#{ \override Voice.NoteColumn.force-hshift = #num #})

getNumOfElems = #(define-scheme-function (parser location mus) (ly:music?)
(let ((ret 0))
(begin

  (map-some-music (lambda (y)
    (let ((name (ly:music-property y 'name)))
      (cond
        ((or (eq? name 'NoteEvent)(eq? name 'RestEvent)(eq? name 'SkipEvent))
          (set! ret (+ ret 1))
        y)
        (else #f))))
  mus)
)
ret))

transfMusIntoOneSkip =
#(define-music-function (parser location note) (ly:music?)
   (make-music 'SkipEvent
               'length (ly:music-length note)))

cstVoice = ""
setCrossStaffVoiceContext = #(define-scheme-function (parser location str) (string?) (set! cstVoice str))
unsetCrossStaffVoiceContext = #(define-scheme-function (parser location) () (set! cstVoice ""))
crossStaffVoiceContext =  #(define-music-function (parser location mus) (ly:music?)
#{ \context Voice = $cstVoice $mus #})

tupletAnchor =
#(define-music-function (parser location note) (ly:music?)
(let ((newskip (make-music 'SkipEvent
                           'temppitch (ly:music-property note 'pitch)
                           'tupletAnchor "true"
                           'duration (ly:music-property note 'duration))))
#{ $newskip #}))

forcedSkip =
#(define-music-function (parser location note) (ly:music?)
(let ((newskip (make-music 'SkipEvent
                           'forcedSkip "true"
                           'duration (ly:music-property note 'duration))))
#{ $newskip #}))

markFirstSkipInTuplets = #(define-scheme-function (parser location mus) (ly:music?)
  (map-some-music (lambda (evt)
  	(let ((name (ly:music-property evt 'name))
          (checked "false")
          (ctr 1)
          (denominat 0))
  	  (cond
  		((eq? name 'TimeScaledMusic)
        (set! denominat (ly:music-property evt 'denominator))
        (map-some-music (lambda (evt2)
          (let ((name2 (ly:music-property evt2 'name)))
            (cond
              ((and (or (eq? name2 'NoteEvent)(eq? name2 'SkipEvent)(eq? name2 'EventChord)))
               ;(display "\n ctr=")
               ;(display ctr)
               ;(display "  denominat=")
               ;(display denominat)
               ;(display "\n")
                (if (and (eq? name2 'SkipEvent) (or (eq? ctr 1)(eq? ctr denominat)))
                  (begin
                    (if (eq? (ly:music-property evt2 'forcedSkip) '())
                      (ly:music-set-property! evt2 'tupletAnchor "true"))
                    ))
                (set! ctr (+ ctr 1))
                evt2)
              (else #f))))
        evt)
      evt)
  		(else #f))))
  mus)
)

easyCrossStaffAll = #(define-music-function (parser location musColor music1 music2 beamPositions
                                                                      music3 music4 music5 music6 music7
                                                                      music8 music9 music10 midiMusic)
            ((boolean-or-color? #f) ly:music? ly:music? list?
             ly:music? ly:music? ly:music? ly:music?
             ly:music? ly:music? ly:music? ly:music? scheme?)
(let
  ((counter 0)
   (music1Voice1 '())
   (music1Voice2 '())
   (music2Voice1 '())
   (music2Voice2 '()))
  (begin

  (markFirstSkipInTuplets music1)
  (markFirstSkipInTuplets music2)

  (putBeamsAndStemsDirectionsOnMusicAsProperty music1 beamPositions 1)
  (putBeamsAndStemsDirectionsOnMusicAsProperty music2 beamPositions 2)

;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;; VOICE 1
;;;;;;;;;;;;;;;;;;;;

  (set! music1Voice1 (ly:music-deep-copy music1))
  (set! music2Voice1 (ly:music-deep-copy music2))

  (removeMidiGraces music1Voice1)
  (removeMidiGraces music2Voice1)

  ;; this is not necessary but can be useful for internal use with templates
  (if (string=? smartBeams "true")
    (begin
      (removeUnwantedBeamsI music1Voice1)
      (removeUnwantedBeamsI music2Voice1)
      (removeUnwantedBeamsII music1Voice1 'U)
      (removeUnwantedBeamsII music2Voice1 'D)))

  (replaceSkipsWithInvisibleRests music1Voice1)
  (replaceSkipsWithInvisibleRests music2Voice1)

  (putBeamsAndStemsDirectionsOnMusicAsProperty music1Voice1 beamPositions 1)
  (putBeamsAndStemsDirectionsOnMusicAsProperty music2Voice1 beamPositions 2)

  (makeCrossStaffUDStepOne music1Voice1 music2Voice1 'U)
  (makeCrossStaffUDStepOne music2Voice1 music1Voice1 'D)

  (set! music1Voice2 (ly:music-deep-copy music1Voice1))
  (set! music2Voice2 (ly:music-deep-copy music2Voice1))

  (makeCrossStaffUDStepTwo music1Voice2)
  (makeCrossStaffUDStepTwo music2Voice2)

  (removeCenteredCSMusicAndPreserveArts music1Voice1 -1)
  (removeCenteredCSMusicAndPreserveArts music2Voice1 1)

;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;; VOICE 2
;;;;;;;;;;;;;;;;;;;;

  (leaveOnlyNotesRestsAndBeams music1Voice2)
  (leaveOnlyNotesRestsAndBeams music2Voice2)

  (map-some-music (lambda (evtDown)
    (let ((nameDown (ly:music-property evtDown 'name))
          (beamPos (ly:music-property evtDown 'beamPosition))
          (mustCrossStaffDown (ly:music-property evtDown 'mustCrossStaff))
          (idxDown (ly:music-property evtDown 'idx)))
         (cond
          ((and (eq? beamPos 'C)(eq? nameDown 'SkipEvent))
            (map-some-music (lambda (evtUp)
              (let ((nameUp (ly:music-property evtUp 'name))
                    (tempSkip (make-music 'SkipEvent))
                    (idxUp (ly:music-property evtUp 'idx)))
                (cond
                  ((and (eq? idxUp idxDown)
                        (or (eq? nameUp 'NoteEvent)(eq? nameUp 'EventChord)))
                      (if (eq? nameUp 'EventChord)
                        (ly:music-set-property! tempSkip 'duration (getDuration evtUp))
                        (ly:music-set-property! tempSkip 'duration (ly:music-property evtUp 'duration)))
                      (set! evtDown #{ \staffUp \once \stemDown $evtUp \staffDown #})
                      (set! evtUp #{ \staffDown \once \stemUp $tempSkip \staffUp #})
                    evtUp)
                  (else #f))))
            music1Voice2)
          evtDown)

          ((or (eq? beamPos 'U)(eq? beamPos 'D)(eq? beamPos 'N))
            (map-some-music (lambda (evtUp)
              (let ((nameUp (ly:music-property evtUp 'name))
                    (tempSkip (make-music 'SkipEvent))
                    (mustCrossStaffUp (ly:music-property evtUp 'mustCrossStaff))
                    (idxUp (ly:music-property evtUp 'idx)))
                (cond
                  ((eq? idxUp idxDown)
                      (if (eq? nameUp 'EventChord)
                        (ly:music-set-property! tempSkip 'duration (getDuration evtUp))
                        (ly:music-set-property! tempSkip 'duration (ly:music-property evtUp 'duration)))
                      (if (not (eq? mustCrossStaffDown 'T))
                        (set! evtDown #{ $tempSkip #}))
                      (if (not (eq? mustCrossStaffUp 'T))
                        (set! evtUp #{ $tempSkip #}))
                    evtUp)
                  (else #f))))
            music1Voice2)
          evtDown)

        (else #f))))
  music2Voice2)

 )
#{
  \tag #'display
  <<
    \new Voice {
      \change Staff = $upperStaffName
      % Articolazioni, dinamiche e note senza staff change
      #(if (not (string=? cstVoice ""))
           #{ \context Voice = $cstVoice { \displayColoredMusic #musColor \autoBeamOff $music1Voice1 } #}
        #{ \displayColoredMusic #musColor \autoBeamOff $music1Voice1 #} )
    }
    \new Voice {
      \change Staff = $lowerStaffName
      % Articolazioni, dinamiche e note senza staff change
      #(if (not (string=? cstVoice ""))
           #{ \context Voice = $cstVoice { \displayColoredMusic #musColor \autoBeamOff  $music2Voice1 } #}
        #{ \displayColoredMusic #musColor \autoBeamOff $music2Voice1 #} )
    }
    #(if (not (eq? (getNumOfElems music1Voice2) 0)) #{
    \new Voice {
      \change Staff = $upperStaffName
      \override NoteColumn.ignore-collision = ##t
      $crossStaffTrash
      \autoBeamOff
      \displayColoredMusic #musColor
      $music1Voice2
    }
    #})
    #(if (not (eq? (getNumOfElems music2Voice2) 0)) #{
    \new Voice {
      \change Staff = $lowerStaffName
      \override NoteColumn.ignore-collision = ##t
      $crossStaffTrash
      \autoBeamOff
      \displayColoredMusic #musColor
      $music2Voice2
    }
    #})
    % Additional voices
    #(if (not (eq? (getNumOfElems music3) 0)) #{
    \new Voice {
      \change Staff = $upperStaffName
      \voiceOne
      \displayColoredMusic #musColor
      $music3
    }
    #})
    #(if (not (eq? (getNumOfElems music4) 0)) #{
    \new Voice {
      \change Staff = $lowerStaffName
      \voiceOne
      \displayColoredMusic #musColor
      $music4
    }
    #})
    #(if (not (eq? (getNumOfElems music4) 0)) #{
    \new NullVoice ="hidden" {
      \change Staff = $upperStaffName
      \transfMusIntoOneSkip $music4
    }
    #})
    #(if (not (eq? (getNumOfElems music3) 0)) #{
    \new NullVoice ="hidden" {
      \change Staff = $lowerStaffName
      \transfMusIntoOneSkip $music3
    }
    #})
    #(if (not (eq? (getNumOfElems music5) 0)) #{
    \new Voice {
      \change Staff = $upperStaffName
      \voiceOne
      \displayColoredMusic #musColor
      $music5
    }
    #})
    #(if (not (eq? (getNumOfElems music6) 0)) #{
    \new Voice {
      \change Staff = $lowerStaffName
      \voiceOne
      \displayColoredMusic #musColor
      $music6
    }
    #})
    #(if (not (eq? (getNumOfElems music6) 0)) #{
    \new NullVoice ="hidden" {
      \change Staff = $upperStaffName
      \transfMusIntoOneSkip $music6
    }
    #})
    #(if (not (eq? (getNumOfElems music5) 0)) #{
    \new NullVoice ="hidden" {
      \change Staff = $lowerStaffName
      \transfMusIntoOneSkip $music5
    }
    #})
    #(if (not (eq? (getNumOfElems music7) 0)) #{
    \new Voice {
      \change Staff = $upperStaffName
      \voiceOne
      \displayColoredMusic #musColor
      $music7
    }
    #})
    #(if (not (eq? (getNumOfElems music8) 0)) #{
    \new Voice {
      \change Staff = $lowerStaffName
      \voiceOne
      \displayColoredMusic #musColor
      $music8
    }
    #})
    #(if (not (eq? (getNumOfElems music8) 0)) #{
    \new NullVoice ="hidden" {
      \change Staff = $upperStaffName
      \transfMusIntoOneSkip $music8
    }
    #})
    #(if (not (eq? (getNumOfElems music7) 0)) #{
    \new NullVoice ="hidden" {
      \change Staff = $lowerStaffName
      \transfMusIntoOneSkip $music7
    }
    #})
    #(if (not (eq? (getNumOfElems music9) 0)) #{
    \new Voice {
      \change Staff = $upperStaffName
      \voiceOne
      \displayColoredMusic #musColor
      $music9
    }
    #})
    #(if (not (eq? (getNumOfElems music10) 0)) #{
    \new Voice {
      \change Staff = $lowerStaffName
      \voiceOne
      \displayColoredMusic #musColor
      $music10
    }
    #})
    #(if (not (eq? (getNumOfElems music10) 0)) #{
    \new NullVoice ="hidden" {
      \change Staff = $upperStaffName
      \transfMusIntoOneSkip $music10
    }
    #})
    #(if (not (eq? (getNumOfElems music9) 0)) #{
    \new NullVoice ="hidden" {
      \change Staff = $lowerStaffName
      \transfMusIntoOneSkip $music9
    }
    #})
  >>
  \tag #'midi
  $(if (eq? midiMusic '() ) #{
  <<
    $music1
    \\
    $music2
    \\
    $music3
    \\
    $music4
    \\
    $music5
    \\
    $music6
    \\
    $music7
    \\
    $music8
    \\
    $music9
    \\
    $music10
  >>
  #}
  ;else
  #{ $midiMusic #})

#}))

%BAD NAME, will be deprecated
crossStaffTableVoice = #(define-music-function (parser location musColor staff ctx mus)
            ((boolean-or-color? #f) string? (string? "") ly:music?)
#{
  \layeredVoice $musColor $staff $ctx $mus
#})

layeredVoice = #(define-music-function (parser location musColor staff ctx mus)
                ((boolean-or-color? #f) string? (string? "") ly:music?)
#{
  <<
    \tag #'display
    <<
    \new Voice {
      \change Staff = $staff
      \voiceOne
      #(if (not(string=? ctx "")) #{
      \context Voice = $ctx { \displayColoredMusic #musColor $mus } #}
      #{ \displayColoredMusic #musColor $mus #})
    }
    \new NullVoice ="hidden" {
      \change Staff = $staff
      \transfMusIntoOneSkip $mus
    }
    >>
    \\
    \tag #'midi
    $mus
  >>
#})

vOneTemp = #(define-music-function (parser location mus) (ly:music?)
#{
  \voiceOne $mus \oneVoice
#})

vTwoTemp = #(define-music-function (parser location mus) (ly:music?)
#{
  \voiceTwo $mus \oneVoice
#})

vThreeTemp = #(define-music-function (parser location mus) (ly:music?)
#{
  \voiceThree $mus \oneVoice
#})

vFourTemp = #(define-music-function (parser location mus) (ly:music?)
#{
  \voiceFour $mus \oneVoice
#})
