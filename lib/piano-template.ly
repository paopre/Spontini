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

\score {
  \keepWithTag #'display 
  \new PianoStaff <<
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
      \PianoStaff
      \consists #Span_stem_engraver 
    }    
  }
}

%%%%%%%%%% HIDDEN SCORE (MIDI) %%%%%%%%%%

\score {     
    \unfoldRepeats
    \keepWithTag #'midi 
    \articulate
    \new PianoStaff
    <<            
      %\set PianoStaff.connectArpeggios = ##t       
      \new Staff = "upper"   \with {midiInstrument = #"acoustic grand"} \new Voice = "ups" << \upper >>
      \new Staff = "lower" \with {midiInstrument = #"acoustic grand"} \new Voice = "ups" << \lower >>
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
