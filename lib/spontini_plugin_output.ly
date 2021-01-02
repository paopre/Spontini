\version "2.19.84"
% automatically converted by musicxml2ly from Z:\SPONTINI\Spontini-master\lib\spontini_plugin_input
\pointAndClickOff

\header {
    }

\layout {
    \context { \Score
        autoBeaming = ##f
        }
    }
PartPOneVoiceOne =  \relative c' {
    \clef "treble" \key c \major \numericTimeSignature\time 4/4 | % 1
    c1 }

% The score definition
\score {
    <<

        \new Staff
        <<
            \set Staff.instrumentName = "Music"

            \context Staff <<
                \mergeDifferentlyDottedOn\mergeDifferentlyHeadedOn
                \context Voice = "PartPOneVoiceOne" {  \PartPOneVoiceOne }
                >>
            >>

        >>
    \layout {}
    % To create MIDI output, uncomment the following line:
    %  \midi {\tempo 4 = 100 }
    }

