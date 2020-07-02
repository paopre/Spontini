%
% Created (09/01/2020) by Paolo-Prete.
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
% along with Spontini.  If not, see <http://www.gnu.org/licenses/>.
%

\version "2.19.84"

leaveOnlyNotesRestsAndBeamsII = {

%% MEMO
%\override Beam.stencil = ##t  
%\override NoteHead.stencil = ##t
%\override Rest.stencil = ##t
%\override Stem.stencil = ##t
%\override Dots.stencil = ##t

% \override Accidental.stencil = ##f
% \override AccidentalCautionary.stencil = ##f
% \override AccidentalPlacement.stencil = ##f
\override AccidentalSuggestion.stencil = ##f
\override Ambitus.stencil = ##f
\override AmbitusAccidental.stencil = ##f
\override AmbitusLine.stencil = ##f
\override AmbitusNoteHead.stencil = ##f
\override Arpeggio.stencil = ##f
\override BalloonTextItem.stencil = ##f
\override BarLine.stencil = ##f
\override BarNumber.stencil = ##f
\override BassFigure.stencil = ##f
\override BassFigureAlignment.stencil = ##f
\override BassFigureAlignmentPositioning.stencil = ##f
\override BassFigureBracket.stencil = ##f
\override BassFigureContinuation.stencil = ##f
\override BassFigureLine.stencil = ##f
\override BendAfter.stencil = ##f
\override BreakAlignGroup.stencil = ##f
\override BreakAlignment.stencil = ##f
\override BreathingSign.stencil = ##f
\override ChordName.stencil = ##f
\override Clef.stencil = ##f
\override ClefModifier.stencil = ##f
\override ClusterSpanner.stencil = ##f
\override ClusterSpannerBeacon.stencil = ##f
\override CombineTextScript.stencil = ##f
\override CueClef.stencil = ##f
\override CueEndClef.stencil = ##f
\override Custos.stencil = ##f
\override DotColumn.stencil = ##f
\override DoublePercentRepeat.stencil = ##f
\override DoublePercentRepeatCounter.stencil = ##f
\override DoubleRepeatSlash.stencil = ##f
\override DynamicLineSpanner.stencil = ##f
\override DynamicText.stencil = ##f
\override DynamicTextSpanner.stencil = ##f
\override Episema.stencil = ##f
\override Fingering.stencil = ##f
\override FingeringColumn.stencil = ##f
\override Flag.stencil = ##f
\override FootnoteItem.stencil = ##f
\override FootnoteSpanner.stencil = ##f
\override FretBoard.stencil = ##f
\override Glissando.stencil = ##f
\override GraceSpacing.stencil = ##f
\override GridLine.stencil = ##f
\override GridPoint.stencil = ##f
\override Hairpin.stencil = ##f
\override HorizontalBracket.stencil = ##f
\override InstrumentName.stencil = ##f
\override InstrumentSwitch.stencil = ##f
\override KeyCancellation.stencil = ##f
\override KeySignature.stencil = ##f
\override KievanLigature.stencil = ##f
\override LaissezVibrerTie.stencil = ##f
\override LaissezVibrerTieColumn.stencil = ##f
\override LedgerLineSpanner.stencil = ##f
\override LeftEdge.stencil = ##f
\override LigatureBracket.stencil = ##f
\override LyricExtender.stencil = ##f
\override LyricHyphen.stencil = ##f
\override LyricSpace.stencil = ##f
\override LyricText.stencil = ##f
\override MeasureCounter.stencil = ##f
\override MeasureGrouping.stencil = ##f
\override MelodyItem.stencil = ##f
\override MensuralLigature.stencil = ##f
\override MetronomeMark.stencil = ##f
\override MultiMeasureRest.stencil = ##f
\override MultiMeasureRestNumber.stencil = ##f
\override MultiMeasureRestText.stencil = ##f
\override NonMusicalPaperColumn.stencil = ##f
\override NoteCollision.stencil = ##f
\override NoteColumn.stencil = ##f
\override NoteName.stencil = ##f
\override NoteSpacing.stencil = ##f
%\override OttavaBracket.stencil = ##f
\override PaperColumn.stencil = ##f
\override ParenthesesItem.stencil = ##f
\override PercentRepeat.stencil = ##f
\override PercentRepeatCounter.stencil = ##f
%%REMOVED EVENT PhrasingSlur
\override PianoPedalBracket.stencil = ##f
\override RehearsalMark.stencil = ##f
\override RepeatSlash.stencil = ##f
\override RepeatTie.stencil = ##f
\override RepeatTieColumn.stencil = ##f
\override RestCollision.stencil = ##f
\override Script.stencil = ##f
\override ScriptColumn.stencil = ##f
\override ScriptRow.stencil = ##f
%%REMOVED EVENT Slur
\override SostenutoPedal.stencil = ##f
\override SostenutoPedalLineSpanner.stencil = ##f
\override SpacingSpanner.stencil = ##f
\override SpanBar.stencil = ##f
\override SpanBarStub.stencil = ##f
\override StaffGrouper.stencil = ##f
\override StaffSpacing.stencil = ##f
\override StaffSymbol.stencil = ##f
\override StanzaNumber.stencil = ##f
\override StemStub.stencil = ##f
\override StemTremolo.stencil = ##f
\override StringNumber.stencil = ##f
\override StrokeFinger.stencil = ##f
\override System.stencil = ##f
\override SystemStartBar.stencil = ##f
\override SystemStartBrace.stencil = ##f
\override SystemStartBracket.stencil = ##f
\override SystemStartSquare.stencil = ##f
\override TabNoteHead.stencil = ##f
\override TextScript.stencil = ##f
\override TextSpanner.stencil = ##f
%%REMOVED EVENT Tie
\override TieColumn.stencil = ##f
\override TimeSignature.stencil = ##f
\override TrillPitchAccidental.stencil = ##f
\override TrillPitchGroup.stencil = ##f
\override TrillPitchHead.stencil = ##f
\override TrillSpanner.stencil = ##f
\override TupletBracket.stencil = ##f
\override TupletNumber.stencil = ##f
\override UnaCordaPedal.stencil = ##f
\override UnaCordaPedalLineSpanner.stencil = ##f
\override VaticanaLigature.stencil = ##f
\override VerticalAlignment.stencil = ##f
\override VerticalAxisGroup.stencil = ##f
\override VoiceFollower.stencil = ##f
\override VoltaBracket.stencil = ##f
\override VoltaBracketSpanner.stencil = ##f
}

staffUp = \change Staff = "upper"
staffDown = \change Staff = "lower"
CS = {}

tupletUp = #(define-music-function (parser location frac mus) (pair? ly:music?)
#{ \once \override TupletBracket.direction = #UP 
   \once \override TupletBracket.bracket-visibility = ##t 
   \tuplet $frac $mus 
#})

tupletDown = #(define-music-function (parser location frac mus) (pair? ly:music?)
#{ \once \override TupletBracket.direction = #DOWN
   \once \override TupletBracket.bracket-visibility = ##t 
   \tuplet $frac $mus 
#})

hiddenTuplet = #(define-music-function (parser location frac mus) (pair? ly:music?)
#{ 
   \once \override TupletBracket.stencil = ##f
   \once \override TupletNumber.stencil = ##f
   \tuplet $frac $mus 
#})

getDuration = #(define-scheme-function (parser location chord) (ly:music?) 
(let ((ret '()))
(begin

  (map-some-music (lambda (y) 
    (let ((name (ly:music-property y 'name))) 
      (cond 
        ((eq? name 'NoteEvent)
          (set! ret (ly:music-property y 'duration))
        y)
        (else #f))))
  chord)  
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
\override TupletBracket  #'stencil =
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

putBeamsAndStemsDirectionsOnMusicAsProperty = #(define-scheme-function (parser location mus beamPositions staffNum) (ly:music? list? number?)
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
          (set! evt #{ \once \hide Rest \once \hide Dots $fakeRest #} )
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
        
  (map-some-music (lambda (evt) 
    (let ((name (ly:music-property evt 'name)))
      (cond 
        ((and (eq? name 'TimeScaledMusic))
         (display (ly:music-property evt 'denominator))      
          evt) 
        (else #f))
      )) 
  mus)
)

removeCenteredCSMusicAndPreserveArts = #(define-scheme-function (parser location mus dir) (ly:music? number?)

  (map-some-music (lambda (x)                             
    (let ((name (ly:music-property x 'name))
          (beamPos (ly:music-property x 'beamPosition))
          (skip '()))
      (cond 
        ((and (eq? beamPos 'C)(or (eq? name 'NoteEvent)(eq? name 'RestEvent)(eq? name 'SkipEvent)(eq? name 'EventChord)))
        
        (if (eq? name 'RestEvent)
          (begin
          (set! skip (make-music 'SkipEvent))            
          (ly:music-set-property! skip 'duration (ly:music-property x 'duration))
          (ly:music-set-property! skip 'articulations (ly:music-property x 'articulations))
        ))
        
        (if (eq? name 'SkipEvent)
          (begin
          (set! skip (make-music 'RestEvent))            
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
          \once \hide Rest
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
          $skip  #})

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

easyCrossStaff = #(define-music-function (parser location music1 music2 beamPositions) 
            (ly:music? ly:music? list?)
#{ \easyCrossStaffAll #music1 #music2 #beamPositions {} {} {} {} {} {} {} {} #'() #})

easyCrossStaffII = #(define-music-function (parser location music1 music2 beamPositions music3 music4) 
            (ly:music? ly:music? list? ly:music? ly:music?)
#{ \easyCrossStaffAll #music1 #music2 #beamPositions #music3 #music4 {} {} {} {} {} {} #'() #})

easyCrossStaffB = #(define-music-function (parser location music1 music2 beamPositions music3 music5 music7 music9 music4 music6 music8 music10) 
            (ly:music? ly:music? list? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music?)
#{ \easyCrossStaffAll #music1 #music2 #beamPositions #music3 #music4 #music5 #music6 #music7 #music8 #music9 #music10 #'() #})

easyCrossStaffIII = #(define-music-function (parser location music1 music2 beamPositions midiMusic) 
            (ly:music? ly:music? list? ly:music?)
#{ \easyCrossStaffAll #music1 #music2 #beamPositions {} {} {} {} {} {} {} {} #midiMusic #})

easyCrossStaffIV = #(define-music-function (parser location music1 music2 beamPositions music3 music4 midiMusic) 
            (ly:music? ly:music? list? ly:music? ly:music? ly:music?)
#{ \easyCrossStaffAll #music1 #music2 #beamPositions #music3 #music4 {} {} {} {} {} {} #midiMusic  #})

easyCrossStaffPolyI = #(define-music-function (parser location musicUpV1 musicUpCS musicDownCS musicDownV1 beamPositions) 
            (ly:music? ly:music? ly:music? ly:music? list?)
#{ \easyCrossStaffAll #musicUpCS #musicDownCS #beamPositions 
                      #musicUpV1 #musicDownV1 {} {} {} {} {} {} #'() #})
easyCrossStaffPolyII = #(define-music-function (parser location musicUpV1 musicUpV2 musicUpCS musicDownCS musicDownV1 musicDownV2 beamPositions) 
            (ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? list?)
#{ \easyCrossStaffAll #musicUpCS #musicDownCS #beamPositions 
                      #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 {} {} {} {} #'() #})
            
easyCrossStaffPolyIII = #(define-music-function (parser location musicUpV1 musicUpV2 musicUpV3 musicUpCS 
                                                 musicDownCS musicDownV1 musicDownV2 musicDownV3 beamPositions) 
            (ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? list?)
#{ \easyCrossStaffAll #musicUpCS #musicDownCS #beamPositions 
                      #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 #musicUpV3 #musicDownV3 {} {} #'() #})

easyCrossStaffPolyIV = #(define-music-function (parser location musicUpV1 musicUpV2 musicUpV3 musicUpV4 musicUpCS 
                                                 musicDownCS musicDownV1 musicDownV2 musicDownV3 musicDownV4 beamPositions) 
            (ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? list?)
#{ \easyCrossStaffAll #musicUpCS #musicDownCS #beamPositions 
                      #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 #musicUpV3 #musicDownV3 #musicUpV4 #musicDownV4 #'() #})

tabularTwoStavesPolyI = #(define-music-function (parser location musicUpV1 musicDownV1) 
            (ly:music? ly:music?)
#{ \easyCrossStaffAll {} {} #'( - ) #musicUpV1 #musicDownV1 {} {} {} {} {} {} #'() #})

tabularTwoStavesPolyII = #(define-music-function (parser location musicUpV1 musicUpV2 musicDownV1 musicDownV2) 
            (ly:music? ly:music? ly:music? ly:music?)
#{ \easyCrossStaffAll {} {} #'( - ) #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 {} {} {} {} #'() #})
            
tabularTwoStavesPolyIII = #(define-music-function (parser location musicUpV1 musicUpV2 musicUpV3 musicDownV1 musicDownV2 musicDownV3) 
            (ly:music? ly:music? ly:music? ly:music? ly:music? ly:music?)
#{ \easyCrossStaffAll {} {} #'( - ) #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 #musicUpV3 #musicDownV3 {} {} #'() #})

tabularTwoStavesPolyIV = #(define-music-function (parser location musicUpV1 musicUpV2 musicUpV3 musicUpV4 musicDownV1 musicDownV2 musicDownV3 musicDownV4) 
            (ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? )
#{ \easyCrossStaffAll {} {} #'( - ) #musicUpV1 #musicDownV1 #musicUpV2 #musicDownV2 #musicUpV3 #musicDownV3 #musicUpV4 #musicDownV4 #'() #})

shiftVoice =  #(define-music-function (parser location num) (number?)
#{ \override Voice.NoteColumn.force-hshift = #num #})

easyCrossStaffAll = #(define-music-function (parser location music1 music2 beamPositions music3 music4 music5 music6 music7 music8 music9 music10 midiMusic) 
            (ly:music? ly:music? list? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? ly:music? scheme?)            
(let
  ((counter 0) 
   (music1Voice1 '())
   (music1Voice2 '())
   (music2Voice1 '())
   (music2Voice2 '()))
  (begin 

  (putBeamsAndStemsDirectionsOnMusicAsProperty music1 beamPositions 1)
  (putBeamsAndStemsDirectionsOnMusicAsProperty music2 beamPositions 2)  
  
;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;; VOICE 1  
;;;;;;;;;;;;;;;;;;;;
  
  (set! music1Voice1 (ly:music-deep-copy music1))
  (set! music2Voice1 (ly:music-deep-copy music2))
    
  (removeMidiGraces music1Voice1)
  (removeMidiGraces music2Voice1)
  
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
      \change Staff = "upper"
      \autoBeamOff
      % Articolazioni, dinamiche e note senza staff change
      $music1Voice1
    }   
    \new Voice { 
      \change Staff = "lower"  
      \autoBeamOff
      % Articolazioni, dinamiche e note senza staff change    
      $music2Voice1
    }  
    \new Voice {  
      \change Staff = "upper"
      \override NoteColumn.ignore-collision = ##t
      \leaveOnlyNotesRestsAndBeamsII
      \autoBeamOff 
      $music1Voice2
    } 
    \new Voice { 
      \change Staff = "lower" 
      \override NoteColumn.ignore-collision = ##t    
      \leaveOnlyNotesRestsAndBeamsII
      \autoBeamOff 
      $music2Voice2
    }   
    
    % Additional voices
    \new Voice {  
      \change Staff = "upper"
      \voiceOne
      $music3
    } 
    \new Voice { 
      \change Staff = "lower" 
      \voiceOne
      $music4
    }    
    \new NullVoice ="hidden" {  
      \change Staff = "upper"
      $music4
    } 
    \new NullVoice ="hidden" {  
      \change Staff = "lower" 
      $music3
    }    
    
    \new Voice {  
      \change Staff = "upper"
      \voiceOne
      $music5
    } 
    \new Voice { 
      \change Staff = "lower" 
      \voiceOne
      $music6
    }
    \new NullVoice ="hidden" {  
      \change Staff = "upper"
      $music6
    } 
    \new NullVoice ="hidden" {  
      \change Staff = "lower" 
      $music5
    }      
    
    
    \new Voice {  
      \change Staff = "upper"
      \voiceOne
      $music7
    } 
    \new Voice { 
      \change Staff = "lower"
      \voiceOne
      $music8
    }
    \new NullVoice ="hidden" {  
      \change Staff = "upper"
      $music8
    } 
    \new NullVoice ="hidden" {  
      \change Staff = "lower" 
      $music7
    }      
    
    \new Voice {  
      \change Staff = "upper"
      \voiceOne
      $music9
    } 
    \new Voice { 
      \change Staff = "lower" 
      \voiceOne
      $music10
    }
    \new NullVoice ="hidden" {  
      \change Staff = "upper"
      $music10
    } 
    \new NullVoice ="hidden" {  
      \change Staff = "lower" 
      $music9
    }      
    
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
