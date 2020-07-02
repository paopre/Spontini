%
% Created (24/06/2020) by Paolo-Prete.
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
% along with Spontini. If not, see <http://www.gnu.org/licenses/>.
%

\include "../lib/jssvg.ly"
\include "../lib/easy-cross-staff.ly"
\include "italiano.ly"
\version "2.19.84"

\paper {
  indent = 0\cm
  system-system-spacing.basic-distance = #30
}

upper = {

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%% LAYOUT %%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(set! showEditorStuff "true")

\override Staff.VerticalAxisGroup #'staff-staff-spacing = 
#'((basic-distance . 9)
(minimum-distance . 12)
(maximum-distance . 9)
(padding . -9) 
(stretchability . 0))
$(set! cpDiameter 0.4)
\set Score.proportionalNotationDuration = #(ly:make-moment 1/8)
\override Score.Script.padding = 0.4
\override Score.Stem #'thickness = #1
\override Score.StaffSymbol #'thickness = #0.35        
\override Score.StaffSymbol.staff-space = #0.85
\override Score.Script.font-size = #-2
\override Score.DynamicText.font-size = #-1
\override Score.Accidental.font-size = #-2
\override Score.NoteHead.font-size = #-1.8
\override Score.Rest.font-size = #-1
\override Score.Clef.font-size = #-1.3
\override Score.Dots.font-size = #-1.3
\override Score.TimeSignature.font-size = #-1.3
\override Score.TextScript.font-size = #2

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%% SCORE WITHOUT JSTWEAKS %%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\time 3/4

\easyCrossStaffB %TMODE
  { \key sib \major \clef treble <re' fa'>4^.^\( \CS <mib' sol'>^. \CS <fa' la'>^.\)  \CS }
  { fa4                                          \CS sol           \CS la             \CS }
#'( U                                            \CS -             \CS -              \CS )
  %% UPPER STAFF %%
  { \shiftVoice 1.4 \stemDown sib4_\( si8. do'16 dod'4\) }
  {}{}{}
  %% LOWER STAFF %%
  { \stemDown \key sib \major \clef bass < sib, sib,,>4_._\(\p <la, la,,>_. <fa, fa,,>_.\) } 
  {}{}{}

\easyCrossStaffB %TMODE
  { <re' fa'>4^.^\( \CS <mib' sol'>^. \CS <fa' la'>^.\) \CS re'^.    \CS re'^.    \CS mib'^.   \CS mi'4      \CS fa'8      \CS <re' fa' sib' re''> \CS <la re' fa' la'> \CS s                 \CS s             \CS s                \CS s \CS s   \CS s \CS s \CS s     \CS }
  { fa4             \CS sol           \CS la            \CS <fa sol> \CS <fa sol> \CS <fa sol> \CS <fa sol>4 \CS <fa sib>8 \CS s[_._\(             \CS s_.              \CS <fa la re' fa'>_. \CS <re la re'>_. \CS <sol sib re'>]_. \CS s \CS s\> \CS s \CS s \CS s\!\) \CS }
#'( U               \CS -             \CS -             \CS -        \CS -        \CS -        \CS -         \CS -         \CS D                   \CS -                \CS -                 \CS -             \CS -                \CS - \CS -   \CS - \CS - \CS -     \CS )
  %% UPPER STAFF %%
  { 
    \shiftVoice 1.4 \stemDown sib4_\( si8. do'16 dod'8. fa'16 
    \shiftVoice -0.4 \stemUp sol'8.^-\)^\(\p\< la'16^.\)\! sol'8.^-^\(\p\< la'16^.\)\! sol'8.^-^\(\p\< la'16^.\) \break 
    \time 4/4 sol'8.^-^\( sib'16\! \CS r8\)\pp \shiftVoice 0 <fa'' sib'' fa'''>[^.^\( <re'' la'' re'''>^. <la' re'' la''>^. <fa' la' re'' fa''>^. <sol' sib' re'' sol''>]^. 
    \time 3/4 <mi' sol' do'' mi''>[-. \CS <re' fa' la' re''>-. <re' fa' sib' re''>-. <do' mi' sol' do''>]-. <fa' la' do'' fa''>4--\) \bar "||"
  }
  {}{}{}
  %% LOWER STAFF %%  
  { 
    \stemDown <sib, sib,,>4_._\( <la, la,,>_. <fa, fa,,>_.\) 
    <sib, sib,,>4_._\( <si, si,,> <do do,>_.\) 
    <dod dod,>_._\( <re re,>2_.\) s4 
    <do sol do'>8[_. <re la>_. <sib, fa sib>_. <do sol>]_. <fa, do fa>4_-
  } 
  {}{}{}

\easyCrossStaffB %TMODE
  { s4 \CS si8.[ \CS do'16] \CS }
  { s4 \CS si,8. \CS do16   \CS }
#'( -  \CS U     \CS -      \CS )
  %% UPPER STAFF %%
  { r8 <fa' sib' re'' fa''>4^\(^. <sol' si' mib'' sol''>^. <la' dod'' fa'' la''>8^.\) }
  { sib4 }
  {}{}
  %% LOWER STAFF %%
  { r8 <fa sib re'>4 <sol si mib'> <la dod' fa'>8 }
  { \stemDown <sib, sib,,>4_._\(\p <la, la,,>_. <fa, fa,,>_.\) }   
  {}{}
  
\break

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%% SCORE WITH JSTWEAKS %%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\easyCrossStaffB %TMODE
  { \key sib \major \clef treble <re' fa'>4^.^\( \CS <mib' sol'>^. \CS <fa' la'>^.\) \CS }
  { fa4                                          \CS sol           \CS la            \CS }
#'( U                                            \CS -             \CS -             \CS )
  %% UPPER STAFF %%
  { \shiftVoice 1.4 \stemDown sib4_\(^"Same score with jsTweaks " \jsTweak "1" "extra-offset" #'(0.992 . -0.73) Accidental si8. do'16 \jsTweak "2" "extra-offset" #'(0.994 . -0.738) Accidental dod'4\) }
  {}{}{}
  %% LOWER STAFF %%
  { \stemDown \key sib \major \clef bass < sib, sib,,>4_._\(\p \CS <la, la,,>_. <fa, fa,,>_.\) } 
  {}{}{}

\easyCrossStaffB %TMODE
  { <re' fa'>4^.^\( \CS <mib' sol'>^. \CS <fa' la'>^.\) \CS re'^.    \CS re'^.    \CS mib'^.   \CS mi'4      \CS fa'8      \CS <re' fa' sib' re''>                                                                                                            \CS <la re' fa' la'> \CS s                 \CS s             \CS s                \CS s \CS s   \CS s \CS s \CS s     \CS }
  { fa4             \CS sol           \CS la            \CS <fa sol> \CS <fa sol> \CS <fa sol> \CS <fa sol>4 \CS <fa sib>8 \CS s\jsOnceOffset "6" "positions" #'(0 . -1.754) [_.\jsShape "7" "cpts" #'((0 . 0) (0 . 0) (-13.54 . -0.458) (0.261 . 1.771)) _\( \CS s_.              \CS <fa la re' fa'>_. \CS <re la re'>_. \CS <sol sib re'>]_. \CS s \CS s\> \CS s \CS s \CS s\!\) \CS } 
#'( U               \CS -             \CS -             \CS -        \CS -        \CS -        \CS -         \CS -         \CS D                                                                                                                              \CS -                \CS -                 \CS -             \CS -                \CS - \CS -   \CS - \CS - \CS -     \CS )
  %% UPPER STAFF %%
  { 
    \shiftVoice 1.4 \stemDown sib4\jsShape "5" "cpts" #'((0.255 . -0.348) (0 . 0) (-0.532 . -1.33) (-0.677 . 0.561)) _\( \jsTweak "3" "extra-offset" #'(0.809 . -0.553) Accidental si8. do'16 \jsTweak "4" "extra-offset" #'(1.034 . -0.885) Accidental dod'8. fa'16 
    \shiftVoice -0.4 \stemUp \jsTweak "11" "extra-offset" #'(0.7 . 0) Dots sol'8.^-\)^\(\p\< la'16^.\)\! \jsTweak "12" "extra-offset" #'(0.7 . 0) Dots sol'8.^-^\(\jsTweak "9" "Y-offset" #'(-4.5) DynamicLineSpanner \< \p la'16^.\)\! \once \override DynamicLineSpanner.Y-offset = -4.3 \jsTweak "13" "extra-offset" #'(0.7 . 0) Dots sol'8.^-^\( \<\p la'16^.\) \break 
    \time 4/4 \jsTweak "14" "extra-offset" #'(0.7 . 0) Dots sol'8.^-\jsShape "15" "cpts" #'((0 . 0) (0.968 . -0.19) (0.369 . -0.894) (-0.121 . -3.299)) ^\( sib'16\! r8\)\jsTweak "8" "extra-offset" #'(2.877 . 1.098) \pp \shiftVoice 0 <fa'' sib'' fa'''>[^.^\( <re'' la'' re'''>^. \CS <la' re'' la''>^. <fa' la' re'' fa''>^. <sol' sib' re'' sol''>]^. 
    \time 3/4 <mi' sol' do'' mi''>[-. <re' fa' la' re''>-. <re' fa' sib' re''>-. <do' mi' sol' do''>]-. <fa' la' do'' fa''>4--\) \bar "||" 
  }
  {}{}{}
  %% LOWER STAFF %%  
  { 
    \stemDown <sib, sib,,>4_._\( <la, la,,>_. <fa, fa,,>_.\) 
    <sib, sib,,>4_._\( <si, si,,> <do do,>_.\) 
    <dod dod,>_._\( <re re,>2_.\) s4 
    <do sol do'>8\jsOnceOffset "16" "positions" #'(0 . -0.877) [_. <re la>_. <sib, fa sib>_. <do sol>]_. <fa, do fa>4_- 
  }
  {}{}{}

\easyCrossStaffB %TMODE
  { s4 \CS si8.\jsOnceOffset "10" "positions" #'(2.598 . 3.1) [ \CS do'16] \CS s \CS }
  { s4 \CS \jsTweak "17" "extra-offset" #'(-1.044 . 0.103) Dots si,8.         \CS do16   \CS s \CS } 
#'( -  \CS U                                                    \CS -      \CS - \CS )
  %% UPPER STAFF %%
  { r8 <fa' sib' re'' fa''>4^\(^. <sol' si' mib'' sol''>^. <la' dod'' fa'' la''>8^.\) }  
  { sib4 }
  {}{}
  %% LOWER STAFF %%
  { r8 <fa sib re'>4 <sol si mib'> <la dod' fa'>8 }
  { \stemDown <sib, sib,,>4_._\(\p \CS <la, la,,>_. <fa, fa,,>_.\) } 
  {}{}

} %end upper                                                                                                                                                                                                                                                                            
lower = { }

\include "../lib/piano-template.ly"