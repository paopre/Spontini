%
% Created (28/12/2019) by Paolo-Prete.
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

%%%%%%%TODO All this must be re-formatted and shortened!

\version "2.19.83"

#(define reservedColor1 (rgb-color 0.123 0.456 0.789))
#(define reservedColor2 (rgb-color 0.912 0.934 0.956))
#(define showEditorStuff "true")
#(define line-thickness 0.2)
#(define cpDiameter 0.6)
#(define lilyVersion (string-join (map number->string (ly:version)) "."))
#(define majorNum (string->number (list-ref (string-tokenize lilyVersion (char-set-complement (->char-set "."))) 1)))
#(define minorNum (string->number (list-ref (string-tokenize lilyVersion (char-set-complement (->char-set "."))) 2)))
#(define cpColorStr (if (or (and (>= majorNum 21)(>= minorNum 2)) (>= majorNum 22)) "#fc560390" (rgb-color 0.811 0.466 0.439)))

\layout {
  \context {
    \Staff
      \override StaffSymbol.output-attributes.isstaff = "true"
      \override StaffSymbol.before-line-breaking = #(lambda (grob)(beforeLineBreakingSVGGrob grob))
      \override StaffSymbol.output-attributes.lilypondversion = #lilyVersion
  }
}

#(define (beforeLineBreakingSVGGrob grob)
  (let* ((outprops (ly:grob-property grob 'output-attributes)))
    (set! outprops (cons `(staffspace . ,(ly:staff-symbol-staff-space grob)) outprops))
    (ly:grob-set-property! grob 'output-attributes outprops))
)

%Thanks to Aroon Hill for the below functions!
controlPoints = #(grob-transformer 'stencil (lambda (grob orig)
  (define (draw-control-point pt)
#{ \markup \translate $pt \with-color #cpColorStr \draw-circle #cpDiameter #0 ##t #})
  (define (draw-control-segment pt1 pt2)
(let ((delta (cons (- (car pt2) (car pt1)) (- (cdr pt2) (cdr pt1))))) #{ \markup \translate $pt1 \with-color #'(1 .5 0) \draw-line $delta #}))
  (let* ((pts (ly:grob-property grob 'control-points))
         (dots (map (lambda (pt)
            (grob-interpret-markup grob (draw-control-point pt)))
            pts))
         (lines (map (lambda (pt1 pt2)
            (grob-interpret-markup grob (draw-control-segment pt1 pt2)))
            pts (cdr pts))))
    (ly:stencil-add
      (apply ly:stencil-add lines)
      (apply ly:stencil-add dots)
      orig))))

#(define (staffPaddingMarkup xex yex grob orig)
(let ((outprops (ly:grob-property grob 'output-attributes))
      (dir (ly:grob-property grob 'direction))
      (staffPadding (ly:grob-property grob 'staff-padding)))
(begin
  (append! outprops `((y-direction . ,dir)))
  (if (string=? showEditorStuff "true")
    (grob-interpret-markup grob #{
       \markup \overlay {
         \stencil #orig
         \with-dimensions-from \null
         \translate #(cons (interval-index xex 0) (interval-index yex (- dir)))
         \overlay {
           \with-color #reservedColor1
           \scale #(cons 1 dir)
           \translate #(cons 0 (- staffPadding))
           \draw-line #'(-1 . 0)

           \with-color #reservedColor1
           \scale #(cons 1 dir)
           \translate #(cons -0.5 (- staffPadding))
           \draw-line #(cons 0 staffPadding)

           \with-color #reservedColor1
           \scale #(cons 1 (- dir))
           \draw-line #'(-1 . 0)
         }
       } #}  )

    (grob-interpret-markup grob #{
       \markup \overlay {
         \stencil #orig
         \with-dimensions-from \null
         \translate #(cons (interval-index xex 0) (interval-index yex (- dir)))
         \overlay { } } #})))))

#(define (paddingMarkup xex yex grob orig)
(let ((outprops (ly:grob-property grob 'output-attributes))
      (dir (ly:grob-property grob 'direction))
      (padding (ly:grob-property grob 'padding)))
(begin
  (append! outprops `((y-direction . ,dir)))
  (if (string=? showEditorStuff "true")
    (grob-interpret-markup grob #{
       \markup \overlay {
         \stencil #orig
         \with-dimensions-from \null
         \translate #(cons (interval-index xex 0) (interval-index yex (- dir)))
         \overlay {
           \with-color #reservedColor1
           \scale #(cons 1 dir)
           \translate #(cons 0 (- padding))
           \draw-line #'(-1 . 0)

           \with-color #reservedColor1
           \scale #(cons 1 dir)
           \translate #(cons -0.5 (- padding))
           \draw-line #(cons 0 padding)

           \with-color #reservedColor1
           \scale #(cons 1 (- dir))
           \draw-line #'(-1 . 0)
         }
       } #}  )

    (grob-interpret-markup grob #{
       \markup \overlay {
         \stencil #orig
         \with-dimensions-from \null
         \translate #(cons (interval-index xex 0) (interval-index yex (- dir)))
         \overlay { } } #})))))

#(define (osPaddingMarkup xex yex grob orig)
(let ((outprops (ly:grob-property grob 'output-attributes))
      (dir (ly:grob-property grob 'direction))
      (osPadding (ly:grob-property grob 'outside-staff-padding 0.46)))
(begin
  (append! outprops `((y-direction . ,dir)))
  (if (string=? showEditorStuff "true")
    (grob-interpret-markup grob #{
      \markup \overlay {
        \stencil #orig
        \with-dimensions-from \null
        \translate #(cons (interval-index xex 0) (interval-index yex (- dir)))
        \overlay {
          \with-color #reservedColor1
          \scale #(cons 1 dir)
          \translate #(cons 0 (- osPadding))
          \draw-line #'(-1 . 0)

          \with-color #reservedColor1
          \scale #(cons 1 dir)
          \translate #(cons -0.5 (- osPadding))
          \draw-line #(cons 0 osPadding)

          \with-color #reservedColor1
          \scale #(cons 1 (- dir))
          \draw-line #'(-1 . 0)
        }
        \with-dimensions-from \null
        \translate #(cons (interval-index xex 0) (interval-index yex dir))
        \overlay {
          \with-color #reservedColor1
          \scale #(cons 1 dir)
          \draw-line #'(-1 . 0)

          \with-color #reservedColor1
          \scale #(cons 1 dir)
          \translate #(cons -0.5 0)
          \draw-line #(cons 0 osPadding)

          \with-color #reservedColor1
          \scale #(cons 1 (- dir))
          \translate #(cons 0 (- osPadding))
          \draw-line #'(-1 . 0)
        }
    } #} )

    ; else (no editor stuff)
    (grob-interpret-markup grob #{
      \markup \overlay {
        \stencil #orig
        \with-dimensions-from \null
        \translate #(cons (interval-index xex 0) (interval-index yex (- dir)))
        \overlay {  }
        \with-dimensions-from \null
        \translate #(cons (interval-index xex 0) (interval-index yex dir))
        \overlay { }
    } #} )))))

#(define (afterLineBreakingSVGGrob grob editableClass xex yex id)
  (let* ((outprops (ly:grob-property grob 'output-attributes))
          (y-parent (ly:grob-parent grob Y))
          (x-parent (ly:grob-parent grob X))
          (origsten '())
          (dir '())
          (y '())
          (outprops-y-parent (ly:grob-property y-parent 'output-attributes))
          (orig-sten-y-parent '())
          (outprops-x-parent (ly:grob-property x-parent 'output-attributes))
          (orig-sten-x-parent '()))

      (for-each
        (lambda (x)
          (if (string-prefix? "x-offset" (symbol->string (car x)))
            (begin
              (if (string=? showEditorStuff "true")
                (begin
                  ;(set! orig-sten-x-parent (ly:make-stencil '()))
                  (ly:grob-set-property! x-parent 'stencil
                    (grob-interpret-markup x-parent #{
                        \markup \draw-line #'(0 . 1)
                      #}))

                  (if (not (member (cons "spontinimarker" "true") outprops-x-parent))
                    (set! outprops-x-parent (cons (cons "spontinimarker" "true") outprops-x-parent )))

                  (if (not (member (cons (string-append "x-ref-of-" (cdr x)) "true") outprops-x-parent))
                    (set! outprops-x-parent (cons (cons (string-append "x-ref-of-" (cdr x)) "true") outprops-x-parent)))

                  (ly:grob-set-property! x-parent 'output-attributes outprops-x-parent)))))

          (if (string-prefix? "y-offset" (symbol->string (car x)))
              (if (string=? showEditorStuff "true")
                (begin
                  (set! (ly:grob-property y-parent 'stencil) (ly:make-stencil '()))
                  (ly:grob-set-property! y-parent 'stencil
                    (grob-interpret-markup y-parent #{
                        \markup \draw-line #'(1 . 0)
                      #}))

                  (if (not (member (cons "spontinimarker" "true") outprops-y-parent))
                    (set! outprops-y-parent (cons (cons "spontinimarker" "true") outprops-y-parent )))

                  (if (not (member (cons (string-append "y-ref-of-" (cdr x)) "true") outprops-y-parent))
                    (set! outprops-y-parent (cons (cons (string-append "y-ref-of-" (cdr x)) "true") outprops-y-parent)))

                  (ly:grob-set-property! y-parent 'output-attributes outprops-y-parent))))
          ;; Thanks to Haaron Hill for the *great* support!
          (if (or (string-prefix? "outside-staff-padding" (symbol->string (car x)))
                       (string-prefix? "staff-padding" (symbol->string (car x)))
                       (string-prefix? "padding" (symbol->string (car x))))
              (if (string=? showEditorStuff "true")
                (begin
                  (set! origsten (ly:grob-property grob 'stencil))
                  (set! xex (ly:stencil-extent origsten X))
                  (set! yex (ly:stencil-extent origsten Y))
                  (ly:grob-set-property! grob 'layer 1000)

                  (cond
                    ((string-prefix? "outside-staff-padding" (symbol->string (car x)))
                      (ly:grob-set-property! grob 'stencil (osPaddingMarkup xex yex grob origsten)))

                    ((string-prefix? "staff-padding" (symbol->string (car x)))
                      (ly:grob-set-property! grob 'stencil (staffPaddingMarkup xex yex grob origsten)))

                    ((string-prefix? "padding" (symbol->string (car x)))
                      (ly:grob-set-property! grob 'stencil (paddingMarkup xex yex grob origsten)))))))

          ) outprops)

      (ly:grob-set-property! grob 'output-attributes outprops))

)

%Thanks to Stefano Troncaro and Kieren McMillian for support!
createJSSVGEditableObj = #(define-music-function (editableClass idStr prop method vals mus) (symbol-list? string? string? string? scheme? ly:music?)
  (let ((mexpr '())
        (endTkn '())
        (context '())
        (isAvoidCollisionProp (or (string=? "outside-staff-padding" prop)
                                  (string=? "staff-padding" prop)
                                  (string=? "padding" prop)
                                  (string=? "X-offset" prop)
                                  (string=? "Y-offset" prop)))
        (editablepropid (string-downcase (string-append prop "-propid")))
        (valsToSet vals))
    (begin

      (if (not (eq? editableClass '()))
        (begin

          (if (eq? (cdr editableClass) '())
            (begin
              (set! editableClass (symbol->string (car editableClass)))
            )
            (begin
              (set! context (symbol->string (car editableClass)))
              (set! editableClass (symbol->string (car (cdr editableClass))))
            )
          ))
        )

      (cond

        (isAvoidCollisionProp
          (if (null? vals)
              (set! valsToSet 0)
              (set! valsToSet (car vals))))

        ((or (string=? prop "extra-offset")(string=? prop "shorten-pair"))
          (if (null? vals)
              (set! valsToSet (cons 0 0))))

        ((string=? prop "extra-offset-y")
          (set! prop "extra-offset")
          (if (null? vals)
              (set! valsToSet '(0))
              (set! valsToSet (cons 0 (car vals)))))

        ((string=? prop "cpts")
          (if (null? vals)
            (set! valsToSet '((0 . 0)(0 . 0)(0 . 0)(0 . 0)))))

       )

      (cond

        ((string=? method "Tweak")
          (if (eq? editableClass '())
            (set! mexpr #{
              \tweak $prop $valsToSet $mus
            #})
            (set! mexpr #{
              \tweak $editableClass . $prop $valsToSet $mus
            #})))

        ((string=? method "OnceOffset")
          (if (eq? editableClass '())
            (set! mexpr #{
              \once \offset positions $valsToSet $mus
            #})
            (set! mexpr #{
              \once \offset $editableClass . positions $valsToSet $mus
            #})))

        ((and (not (null? valsToSet))
              (string=? method "OnceOverride"))
          (if (eq? context '())
            (set! mexpr #{
              \once \override $editableClass . $prop = $valsToSet $mus #})
            (set! mexpr #{
              \once \override $context . $editableClass . $prop = $valsToSet $mus #})))

        ((string=? method "Shape")
          (if (string=? showEditorStuff "true")
            (set! mexpr #{
              \tweak stencil #controlPoints
              \shape $valsToSet $mus
            #})
            (set! mexpr #{
              \shape $valsToSet $mus
            #})))
      )

      (cond

        ((and (or (string=? method "Tweak")(string=? method "Shape")(string=? method "OnceOffset"))
              (eq? editableClass '()))
          (set! mexpr #{
            \tweak output-attributes.spontinieditable $showEditorStuff
            \tweak output-attributes.editableclass "Dummy"
            \tweak output-attributes.editcommand #method
            \tweak before-line-breaking #(lambda (grob) (beforeLineBreakingSVGGrob grob))
            \tweak output-attributes.$editablepropid #`,idStr $mexpr #})
          (if isAvoidCollisionProp
            (set! mexpr #{
              \tweak after-line-breaking
              #(lambda (grob) (afterLineBreakingSVGGrob grob editableClass '() '() idStr)) #mexpr #})))

        ((and (or (string=? method "Tweak")(string=? method "Shape")(string=? method "OnceOffset"))
              (not (eq? editableClass '())))
          (set! mexpr #{
            \tweak $editableClass . output-attributes.spontinieditable $showEditorStuff
            \tweak $editableClass . output-attributes.editableclass $editableClass
            \tweak $editableClass . output-attributes.editcommand #method
            \tweak $editableClass . before-line-breaking #(lambda (grob) (beforeLineBreakingSVGGrob grob))
            \tweak $editableClass . output-attributes.$editablepropid #`,idStr  $mexpr #})
          (if isAvoidCollisionProp
            (set! mexpr #{
              \tweak $editableClass . after-line-breaking
              #(lambda (grob) (afterLineBreakingSVGGrob grob editableClass '() '() idStr)) #mexpr #})))

        ((and (eq? context '())(string=? method "OnceOverride"))
          (set! mexpr #{
            #(if isAvoidCollisionProp #{
              \once \override $editableClass .after-line-breaking =
                #(lambda (grob)(afterLineBreakingSVGGrob grob editableClass '() '() idStr))
            #})
            \once \override $editableClass . output-attributes.spontinieditable = $showEditorStuff
            \once \override $editableClass . output-attributes.editableclass = #editableClass
            \once \override $editableClass . output-attributes.editcommand = #method
            \once \override $editableClass . before-line-breaking = #(lambda (grob) (beforeLineBreakingSVGGrob grob))
            \once \override $editableClass . output-attributes.$editablepropid = #`,idStr #mexpr
          #}))

        ((and (not (eq? context '()))(string=? method "OnceOverride"))
          (set! mexpr #{
            #(if isAvoidCollisionProp #{
              \once \override $context . $editableClass .after-line-breaking =
                #(lambda (grob)(afterLineBreakingSVGGrob grob editableClass '() '() idStr))
            #})
            \once \override $context . $editableClass . output-attributes.spontinieditable = $showEditorStuff
            \once \override $context . $editableClass . output-attributes.editableclass = #editableClass
            \once \override $context . $editableClass . output-attributes.editcommand = #method
            \once \override $context . $editableClass . before-line-breaking = #(lambda (grob) (beforeLineBreakingSVGGrob grob))
            \once \override $context . $editableClass . output-attributes.$editablepropid = #`,idStr #mexpr
          #}))

      )

#{
  $mexpr
#})))

jsTweak = #(define-music-function (idStr prop vals className mus) (string? string? scheme? (symbol-list? '()) ly:music?) #{
  #(cond

    ((and (not (eq? className '()))
          (memv 'DynamicLineSpanner className)) #{
      \tweak $className .stencil #(lambda (grob) (grob-interpret-markup grob
      #{ #(if (string=? showEditorStuff "true")
          #{ \markup { \override #'(thickness . 3) \draw-line #'(4 . 0) } #}
          #{ \markup { } #} )
        #}))
      \createJSSVGEditableObj $className $idStr $prop "Tweak" $vals $mus
    #})

    ((and (not (eq? className '()))
          (or (memv 'SustainPedalLineSpanner className)
              (memv 'SostenutoPedalLineSpanner className)
              (memv 'UnaCordaPedalLineSpanner className))) #{
      \tweak $className .stencil #(lambda (grob) (grob-interpret-markup grob
      #{ #(if (string=? showEditorStuff "true")
          #{ \markup { \override #'(thickness . 3) \draw-line #'(6 . 0) } #}
          #{ \markup { } #} )
        #}))
      \createJSSVGEditableObj $className $idStr $prop "Tweak" $vals $mus
    #})

    (else #{
      \createJSSVGEditableObj $className $idStr $prop "Tweak" $vals $mus
    #})

  )
#})

jsOnceOverride = #(define-music-function (idStr prop vals className mus) (string? string? scheme? symbol-list? ly:music?) #{
  #(cond

    ((and (not (eq? className '()))
          (memv 'NoteColumn className)) #{
        \once \override $className .stencil = #(lambda (grob) (grob-interpret-markup grob
      #{ #(if (string=? showEditorStuff "true")
          #{ \markup { \override #'(thickness . 3) \draw-line #'(0 . 4) } #}
          #{ \markup { } #})
        #}))
    #}))

    \createJSSVGEditableObj $className $idStr $prop "OnceOverride" $vals $mus

#})

jsOnceOffset = #(define-music-function (idStr prop vals className mus) (string? string? scheme? (symbol-list? '()) ly:music?) #{
  \createJSSVGEditableObj $className $idStr $prop "OnceOffset" $vals $mus
#})

jsShape = #(define-music-function (idStr prop vals className mus) (string? string? scheme? (symbol-list? '()) ly:music?) #{
  \createJSSVGEditableObj $className $idStr $prop "Shape" $vals $mus
#})

jsOSOPadder = #(define-music-function (idStr prop vals arg) (string? string? scheme? symbol-list-or-music?)
(if (string=? showEditorStuff "true") #{
  \OSPadder #reservedColor2 #0.2 ##t "true" #(string->number idStr) #vals #arg
#}
#{
  \OSPadder #white #0.2 ##t "true" #(string->number idStr) #vals #arg
#}))

jsPadder = #(define-music-function (idStr prop vals arg) (string? string? scheme? symbol-list-or-music?)
(if (string=? showEditorStuff "true") #{
  \OSPadder #reservedColor2 #0.2 ##f "true" #(string->number idStr) #vals #arg
#}
#{
  \OSPadder #white #0.2 ##f "true" #(string->number idStr) #vals #arg
#}))
