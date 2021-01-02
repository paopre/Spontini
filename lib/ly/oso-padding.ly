%
% Created (25/01/2020) by Paolo-Prete.
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

\version "2.19.83"

#(define PADDER_RECT_DEF_W (cons -3 3))
#(define OSPadderThickness 0.1)
#(define posIdxUp 0)
#(define posListUp '())
#(define posIdxDown 0)
#(define posListDown '())
#(define OSBox #{ \markup "   " #})

%Thanks to Aaron Hill and Thomas "Harm" Morley
#(define (box-stencil stencil thickness padding color expand?)
   "Add a box around @var{stencil}, producing a new stencil."
   (define (css-style-padding padding)
     ;; padding => (top right bottom left)
     (cond
       ((or (null? padding) (eqv? #f padding)) '(0 0 0 0))
       ((number? padding) (make-list 4 padding))
       ((number-pair? padding)
         (list (car padding) (cdr padding)
               (car padding) (cdr padding)))
       ((and (number-list? padding) (<= (length padding) 4))
         (case (length padding)
           ((1) (make-list 4 (first padding)))
           ((2) (list (first padding) (second padding)
                      (first padding) (second padding)))
           ((3) (list (first padding) (second padding)
                      (third padding) (second padding)))
           (else padding)))
       (else
         (begin (ly:warning "Ignoring invalid padding: ~a" padding)
                '(0 0 0 0)))))
          (let* ((padding (css-style-padding padding))
                 (padding-top (first padding))
                 (padding-right (second padding))
                 (padding-bottom (third padding))
                 (padding-left (fourth padding))

          (x-ext-orig (ly:stencil-extent stencil X))
          (y-ext-orig (ly:stencil-extent stencil Y))
          (x-ext-inner
            (cons (- (interval-start x-ext-orig) padding-left)
                  (+ (interval-end x-ext-orig) padding-right)))
          (y-ext-inner
            (cons (- (interval-start y-ext-orig) padding-bottom)
                  (+ (interval-end y-ext-orig) padding-top)))
          (x-ext-outer (interval-widen x-ext-inner thickness))
          (y-ext-outer (interval-widen y-ext-inner thickness))
          (x-ext-new (if expand? x-ext-outer x-ext-orig))
          (y-ext-new (if expand? y-ext-outer y-ext-orig))

          (x-rule (make-filled-box-stencil (cons 0 thickness) y-ext-inner))
          (y-rule (make-filled-box-stencil x-ext-outer (cons 0 thickness)))
          (box (stencil-with-color
            (ly:stencil-add
              (ly:stencil-translate-axis y-rule (interval-end y-ext-inner) Y)
              (ly:stencil-translate-axis x-rule (interval-end x-ext-inner) X)
              (ly:stencil-translate-axis y-rule (interval-start y-ext-outer) Y)
              (ly:stencil-translate-axis x-rule (interval-start x-ext-outer) X))
            color)))
     (ly:make-stencil
       (ly:stencil-expr (ly:stencil-add box stencil))
       x-ext-new y-ext-new)))

#(define* (make-stencil-boxer thickness padding
            #:optional (color grey) (callback #f) (expand? #t))
   "Return function that adds a box around the grob passed as argument."
   (if (procedure? callback)
     (lambda (grob)
      (if (ly:grob-property grob 'stencil)
       (box-stencil (callback grob) thickness padding color expand?)))
     (grob-transformer 'stencil (lambda (grob orig)
       (if orig
         (box-stencil orig thickness padding color expand?))))))

#(define (next-not-in-list n list)
  (let ((s (+ 1 n)))
    (if (memv s list)
      (next-not-in-list s list) s)))

resetOSPositions = #(define-scheme-function () ()
  (set! posIdxUp 0)
  (set! posListUp '())
  (set! posIdxDown 0)
  (set! posListDown '()))

incrPositions = #(define-scheme-function (dir num) (number? number?)
(let lp ((i 0))
  (if (< i num)
    (begin
      (if (eq? dir UP)
        (begin
          (set! posIdxUp (next-not-in-list posIdxUp posListUp))
          (set! posListUp (cons posIdxUp posListUp))
          (set! posListUp (sort! posListUp <)))
        (begin
          (set! posIdxDown (next-not-in-list posIdxDown posListDown))
          (set! posListDown (cons posIdxDown posListDown))
          (set! posListDown (sort! posListDown <))))
      (lp (+ 1 i))))))

#(define (symbol-list-or-music? x) (or (symbol-list? x) (ly:music? x)))

OSOObj = #(define-music-function (arg) (ly:music?)
  (let ((posIdx 0)
        (name (ly:music-property arg 'name)))
  (if (eq? (ly:music-property arg 'direction) UP)
    (begin
      (set! posIdxUp (next-not-in-list posIdxUp posListUp))
      (set! posListUp (cons posIdxUp posListUp))
      (set! posListUp (sort! posListUp <))
      (set! posIdx posIdxUp))
    (begin
      (set! posIdxDown (next-not-in-list posIdxDown posListDown))
      (set! posListDown (cons posIdxDown posListDown))
      (set! posListDown (sort! posListDown <))
      (set! posIdx posIdxDown)))
    (cond
      ((eq? name 'AbsoluteDynamicEvent)
        #{ -\tweak DynamicLineSpanner.outside-staff-priority #(* 100 posIdx) #arg #})
      ((eq? name 'SustainEvent)
        #{ -\tweak SustainPedalLineSpanner.outside-staff-priority #(* 100 posIdx) #arg #})
      ((eq? name 'SostenutoEvent)
        #{ -\tweak SostenutoPedalLineSpanner.outside-staff-priority #(* 100 posIdx) #arg #})
      ((eq? name 'UnaCordaEvent)
        #{ -\tweak UnaCordaPedalLineSpanner.outside-staff-priority #(* 100 posIdx) #arg #})
      (else
        #{ -\tweak outside-staff-priority #(* 100 posIdx) #arg #}))))

#(define lastPos 0)

OSPadder = #(define-music-function (col thickness automaticOrder editable id padding arg)
                                    ((color? white) (number? OSPadderThickness) boolean? (string? "false") (number? 0) scheme? symbol-list-or-music?)
  (let ((posIdx 0)
        (obj '())
        (ctx '())
        (editableclass "")
        (name (if (ly:music? arg) (ly:music-property arg 'name) "")))

    (cond
      ((and (ly:music? arg) (eq? (ly:music-property arg 'direction) UP))
        (if automaticOrder
          (set! posIdxUp (next-not-in-list posIdxUp posListUp))
          (set! posIdxUp lastPos))
        (set! posListUp (cons posIdxUp posListUp))
        (set! posListUp (sort! posListUp <))
        (set! posIdx posIdxUp)
      )

      ((and (ly:music? arg) (eq? (ly:music-property arg 'direction) DOWN))
        (if automaticOrder
          (set! posIdxDown (next-not-in-list posIdxDown posListDown))
          (set! posIdxDown lastPos))
        (set! posListDown (cons posIdxDown posListDown))
        (set! posListDown (sort! posListDown <))
        (set! posIdx posIdxDown)
      ))

    (if automaticOrder
      (set! editableclass "OSOPadder")
      (set! editableclass "Padder"))

    (if (ly:music? arg)
      (cond
        ((eq? name 'AbsoluteDynamicEvent) #{
          -\tweak DynamicLineSpanner.padding 0
          -\tweak DynamicLineSpanner.staff-padding 0
          -\tweak DynamicLineSpanner.outside-staff-padding 0
          -\tweak layer #-1
          -\tweak DynamicText.stencil #(make-stencil-boxer thickness padding col)
          -\tweak output-attributes.pads-propid #id
          -\tweak output-attributes.spontinieditable #editable
          -\tweak output-attributes.editableclass #editableclass
          -\tweak output-attributes.thickness #thickness
          -\tweak output-attributes.y-direction #(ly:music-property arg 'direction)
          -\tweak DynamicLineSpanner.outside-staff-priority #(* 100 posIdx) #arg #})
        ((eq? name 'SustainEvent) #{
          -\tweak SustainPedalLineSpanner.padding 0
          -\tweak SustainPedalLineSpanner.staff-padding 0
          -\tweak SustainPedalLineSpanner.outside-staff-padding 0
          -\tweak SustainPedalLineSpanner.outside-staff-priority #(* 100 posIdx)
          -\tweak SustainPedal.output-attributes.pads-propid #id
          -\tweak SustainPedal.output-attributes.spontinieditable #editable
          -\tweak SustainPedal.output-attributes.editableclass #editableclass
          -\tweak SustainPedal.output-attributes.thickness #thickness
          -\tweak SustainPedal.output-attributes.y-direction #(ly:music-property arg 'direction)
          -\tweak SustainPedal.layer #-1
          -\tweak SustainPedal.stencil #(make-stencil-boxer thickness padding col) #arg #})
        ((eq? name 'SostenutoEvent) #{
          -\tweak SostenutoPedalLineSpanner.padding 0
          -\tweak SostenutoPedalLineSpanner.staff-padding 0
          -\tweak SostenutoPedalLineSpanner.outside-staff-padding 0
          -\tweak SostenutoPedalLineSpanner.outside-staff-priority #(* 100 posIdx)
          -\tweak SostenutoPedal.output-attributes.pads-propid #id
          -\tweak SostenutoPedal.output-attributes.spontinieditable #editable
          -\tweak SostenutoPedal.output-attributes.editableclass #editableclass
          -\tweak SostenutoPedal.output-attributes.thickness #thickness
          -\tweak SostenutoPedal.output-attributes.y-direction #(ly:music-property arg 'direction)
          -\tweak SostenutoPedal.layer #-1
          -\tweak SostenutoPedal.stencil #(make-stencil-boxer thickness padding col) #arg #})
        ((eq? name 'UnaCordaEvent) #{
          -\tweak UnaCordaPedalLineSpanner.padding 0
          -\tweak UnaCordaPedalLineSpanner.staff-padding 0
          -\tweak UnaCordaPedalLineSpanner.outside-staff-padding 0
          -\tweak UnaCordaPedalLineSpanner.outside-staff-priority #(* 100 posIdx)
          -\tweak UnaCordaPedal.output-attributes.pads-propid #id
          -\tweak UnaCordaPedal.output-attributes.spontinieditable #editable
          -\tweak UnaCordaPedal.output-attributes.editableclass #editableclass
          -\tweak UnaCordaPedal.output-attributes.thickness #thickness
          -\tweak UnaCordaPedal.output-attributes.y-direction #(ly:music-property arg 'direction)
          -\tweak UnaCordaPedal.layer #-1
          -\tweak UnaCordaPedal.stencil #(make-stencil-boxer thickness padding col) #arg #})
        (else #{
          -\tweak padding 0
          -\tweak staff-padding 0
          -\tweak outside-staff-padding 0
          -\tweak output-attributes.pads-propid #id
          -\tweak output-attributes.y-direction #(ly:music-property arg 'direction)
          -\tweak output-attributes.spontinieditable #editable
          -\tweak output-attributes.editableclass #editableclass
          -\tweak output-attributes.thickness #thickness
          -\tweak layer #-1
          -\tweak stencil #(make-stencil-boxer thickness padding col)
          -\tweak outside-staff-priority #(* 100 posIdx) #arg #}))
      ;else (symbols)
      #{
          \once \override #arg . padding = 0
          \once \override #arg . staff-padding = 0
          \once \override #arg . outside-staff-padding = 0
          \once \override #arg . after-line-breaking =
          #(lambda (grob)
            (let ((outprops (ly:grob-property grob 'output-attributes)))
              (set! outprops (cons (cons "y-direction" (ly:grob-property grob 'direction)) outprops))
              (set! outprops (cons (cons "spontinieditable" editable) outprops))
              (set! outprops (cons (cons "editableclass" editableclass) outprops))
              (set! outprops (cons (cons "thickness" thickness) outprops))
              (set! outprops (cons (cons "pads-propid" id) outprops))
              (ly:grob-set-property! grob 'output-attributes outprops)))
          \once \override #arg . layer = #-1
          \once \override #arg . stencil =
          #(make-stencil-boxer thickness padding col)
      #}
      )))

setOSPosition = #(define-music-function (direction pos arg) (number? number? symbol-list?)
  (if (eq? direction UP)
    (begin
      (set! posListUp (cons pos posListUp))
      (set! posListUp (sort! posListUp <)))
    (begin
      (set! posListDown (cons pos posListDown))
      (set! posListDown (sort! posListDown <))))
    #{ \once \override #arg .outside-staff-priority = #(* 100 pos) #})

tweakOSPosition = #(define-scheme-function (pos) (number?)
(set! lastPos pos))
