%
% Created (25/01/2020) by Paolo-Prete.
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
\include "articulate.ly"

%%%%%%%%%% VISIBLE SCORE (NO MIDI) %%%%%%%%%%
#(define staffSpace 0.85)


\score {
  \keepWithTag #'display 
  \new PianoStaff <<
    \set PianoStaff.instrumentName = #"Piano  "
    \new Staff = "upper" \with {
        % Distance between upper and lower staff
        \override VerticalAxisGroup #'staff-staff-spacing = #'((basic-distance . 9)
                                                               (minimum-distance . 9)
                                                               (maximum-distance . 9)
                                                               (padding . -9) 
                                                               (stretchability . 0))
    }
    \upper
    \new Staff = "lower"
    \lower
  >>
  \layout {
    \context {
      \Score    
      pedalSustainStrings = #'("Ped" "P-" "-")
      pedalSustainStyle = #'mixed     
      \override SustainPedal #'font-family = #'typewriter   
      \override SustainPedal #'font-series = #'bold
      \override SustainPedal #'stencil = #(lambda (grob) (grob-interpret-markup grob (markup "Ped")))  
      
      pedalSostenutoStrings = #'("S Ped" "P-" "-")
      pedalSostenutoStyle = #'mixed     
      \override SostenutoPedal #'font-family = #'typewriter   
      \override SostenutoPedal #'font-series = #'bold
      \override SostenutoPedal #'stencil = #(lambda (grob) (grob-interpret-markup grob (markup "S Ped")))  
    }
    \context {
      \PianoStaff
      \consists #Span_stem_engraver 
    }    
  }
}

%%%%%%%%%% HIDDEN SCORE (MIDI) %%%%%%%%%%

#(define (dynamicsMap dynamic-name)
  (assoc-get dynamic-name
   '(
      ("ff" . 1.0) ;; was 0.80
      ("f" . 0.8)
      ("mf" . 0.7)
      ("mp" . 0.6)
      ("p" . 0.5)
      ("pp" . 0.4) ;; was 0.49
      ("ppp" . 0.2)
    )))

midiParams = {
\set Staff.midiMinimumVolume = #0.00
\set Staff.midiMaximumVolume = #1.0
\set Staff.midiReverbLevel   = #0.7 
\set Staff.midiExpression    = #1
}

\score {     
    \unfoldRepeats
    \keepWithTag #'midi 
    \articulate
    \new PianoStaff
    <<            
      %\set PianoStaff.connectArpeggios = ##t       
      \set Score.dynamicAbsoluteVolumeFunction = #dynamicsMap
      \new Staff = "upper"   \with {midiInstrument = #"acoustic grand"} \new Voice = "ups" << \midiParams \upper >>
      \new Staff = "lower" \with {midiInstrument = #"acoustic grand"} \new Voice = "ups" << \midiParams \lower >>
    >>
    \midi {
        \context {
          \Score
          \consists "Dynamic_performer"
          %midiChannelMapping = #'voice                
        }  
        \context { 
          \Staff 
          \consists Piano_pedal_performer 
        }
        \context { 
            \Voice 
            \remove Piano_pedal_performer 
        }        
    } 
}

\paper {
  system-system-spacing.basic-distance = #45
}

