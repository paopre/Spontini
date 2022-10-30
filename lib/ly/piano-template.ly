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

\version "2.19.84"
\include "articulate.ly"

%%%%%%%%%% VISIBLE SCORE (NO MIDI) %%%%%%%%%%

defaultShowMultiRests = {
 \set Staff.keepAliveInterfaces = #'(
    rhythmic-grob-interface
    multi-measure-rest-interface
    lyric-interface
    stanza-number-interface
    percent-repeat-interface)
}

\score {
  \keepWithTag #'display
  \new PianoStaff <<
    \new Staff = "upper" \with {
      % Distance between upper and lower staff
      \override VerticalAxisGroup.staff-staff-spacing = #'((basic-distance . 9)
                                                           (minimum-distance . 9)
                                                           (maximum-distance . 9)
                                                           (padding . -9)
                                                           (stretchability . 0))
    } { \defaultShowMultiRests \upper }
    #(if (defined? 'pianoStaves)
       (if (> pianoStaves 2) #{
       \new Staff = "middleI" { \defaultShowMultiRests \middleI }
       #}))
    #(if (defined? 'pianoStaves)
       (if (> pianoStaves 3) #{
       \new Staff = "middleII" { \defaultShowMultiRests \middleII }
       #}))
    \new Staff = "lower" { \defaultShowMultiRests \lower }
  >>
  \layout {
    \context {
      \Staff
      \RemoveEmptyStaves
    }
    \context {
      \PianoStaff
      \consists #Span_stem_engraver
      \remove "Keep_alive_together_engraver"
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
    \new Staff = "upper"    \with {midiInstrument = #"acoustic grand"} \new Voice = "ups" \upper
    #(if (defined? 'pianoStaves)
       (if (> pianoStaves 2) #{
       \new Staff = "middleI"  \with {midiInstrument = #"acoustic grand"} \new Voice = "ups" \upper
       #}))
    #(if (defined? 'pianoStaves)
       (if (> pianoStaves 3) #{
       \new Staff = "middleII" \with {midiInstrument = #"acoustic grand"} \new Voice = "ups" \upper
       #}))
    \new Staff = "lower"    \with {midiInstrument = #"acoustic grand"} \new Voice = "ups" \lower
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
