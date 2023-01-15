/*
 * Created (28/06/2020) by Paolo-Prete.
 * This file is part of Spontini-Editor project.
 *
 * Spontini-Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Spontini-Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Spontini-Editor. If not, see <http://www.gnu.org/licenses/>.
 */

var jsShapePlusSlurStart = '\\\\jsShape DQUOTES__NEXTID__DQUOTES DQUOTEScptsDQUOTES #\\\'() ('
var jsShapePlusPhSlurStart = '\\\\jsShape DQUOTES__NEXTID__DQUOTES DQUOTEScptsDQUOTES #\\\'() \\\\('

var symbolserts = [

  {
   category: 'commons',
   elements: [
              // Tooltip, expression, shorthand, after or before note (or mixed or none), image
              ['Accent',              '\\\\accent',                         '>',  'a',   'accent.jpeg'],
              ['Staccato',            '\\\\staccato',                       '.',  'a',   'staccato.jpeg'],
              ['Staccatissimo',       '\\\\staccatissimo',                  '!',  'a',   'staccatissimo.jpeg'],
              ['Marcato',             '\\\\marcato',                        '^',  'a',   'marcato.jpeg'],
              ['Portato',             '\\\\portato',                        '_',  'a',   'portato.jpeg'],
              ['Tenuto',              '\\\\tenuto',                         '-',  'a',   'tenuto.jpeg'],
              ['Stopped',             '\\\\stopped',                        '+',  'a',   'stopped.jpeg'],
              ['Espressivo',          '\\\\espressivo',                     '',   'a',   'espressivo.jpeg'],
              ['Hairpin crescendo',   '\\\\<',                              '',   'a',   'hairpin_cresc.jpeg'],
              ['Hairpin diminuendo',  '\\\\>',                              '',   'a',   'hairpin_dim.jpeg'],
              ['Trill',               '\\\\trill',                          '',   'a',   'trill.jpeg'],
              ['Prall',               '\\\\prall',                          '',   'a',   'prall.jpeg'],
              ['Prall prall',         '\\\\prallprall',                     '',   'a',   'prallprall.jpeg'],
              ['Fermata',             '\\\\fermata',                        '',   'a',   'fermata.jpeg'],
              ['',                    '',                                   '',   'a',   ''],
              ['',                    '',                                   '',   'a',   ''],
              ['',                    '\\\\ppp',                            '',   'a',   'ppp.jpeg'],
              ['',                    '\\\\pp',                             '',   'a',   'pp.jpeg'],
              ['',                    '\\\\p',                              '',   'a',   'p.jpeg'],
              ['',                    '\\\\mp',                             '',   'a',   'mp.jpeg'],
              ['',                    '\\\\mf',                             '',   'a',   'mf.jpeg'],
              ['',                    '\\\\f',                              '',   'a',   'f.jpeg'],
              ['',                    '\\\\ff',                             '',   'a',   'ff.jpeg'],
              ['',                    '\\\\fff',                            '',   'a',   'fff.jpeg'],
              ['',                    '\\\\fp',                             '',   'a',   'fp.jpeg'],
              ['',                    '\\\\sfz',                            '',   'a',   'sfz.jpeg'],
              ['',                    '\\\\rfz',                            '',   'a',   'rfz.jpeg'],
              ['',                    '\\\\sf',                             '',   'a',   'sf.jpeg'],
              ['',                    '',                                   '',   'a',   ''],
              ['',                    '',                                   '',   'a',   ''],
              ['Clef treble',         '\\\\clef DQUOTEStrebleDQUOTES ',     '',   'n',   'clef_treble.jpeg'],
              ['Clef treble 8',       '\\\\clef DQUOTEStreble_(8)DQUOTES ', '',   'n',   'clef_treble_8.jpeg'],
              ['Clef alto',           '\\\\clef DQUOTESaltoDQUOTES ',       '',   'n',   'clef_alto.jpeg'],
              ['Clef tenor',          '\\\\clef DQUOTEStenorDQUOTES ',      '',   'n',   'clef_tenor.jpeg'],
              ['Clef bass',           '\\\\clef DQUOTESbassDQUOTES ',       '',   'n',   'clef_bass.jpeg'],
              ['',                    '',                                   '',   'a',   ''],
              ['',                    '',                                   '',   'a',   '']
             ]
  },

  {
   category: 'barlines',
   elements: [
              ['Repeat both (old)',      '\\\\bar DQUOTES:|.:DQUOTES ',      '',   'n',   'bar_cswc.jpeg'],
              ['Repeat both (classic)',  '\\\\bar DQUOTES:|.|:DQUOTES ',     '',   'n',   'bar_cswsc.jpeg'],
              ['Dashed',                 '\\\\bar DQUOTES!DQUOTES ',         '',   'n',   'bar_dashed.jpeg'],
              ['Dotted',                 '\\\\bar DQUOTES;DQUOTES ',         '',   'n',   'bar_dotted.jpeg'],
              ['Double',                 '\\\\bar DQUOTES||DQUOTES ',        '',   'n',   'bar_double.jpeg'],
              ['Ending',                 '\\\\bar DQUOTES|.DQUOTES ',        '',   'n',   'bar_end.jpeg'],
              ['Invisible',              '\\\\bar DQUOTESDQUOTES ',          '',   'n',   'bar_invisible.jpeg'],
              ['Kievan',                 '\\\\bar DQUOTESkDQUOTES ',         '',   'n',   'bar_kievan.jpeg'],
              ['Angled repeat both',     '\\\\bar DQUOTES:|][|:DQUOTES ',    '',   'n',   'bar_repeat_angled_double.jpeg'],
              ['Angled repeat end',      '\\\\bar DQUOTES:|]DQUOTES ',       '',   'n',   'bar_repeat_angled_end.jpeg'],
              ['Angled repeat start',    '\\\\bar DQUOTES[|:DQUOTES ',       '',   'n',   'bar_repeat_angled_start.jpeg'],
              ['Repeat both',            '\\\\bar DQUOTES:..:DQUOTES ',      '',   'n',   'bar_repeat_double.jpeg'],
              ['Repeat end',             '\\\\bar DQUOTES:|.DQUOTES ',       '',   'n',   'bar_repeat_end.jpeg'],
              ['Repeat start',           '\\\\bar DQUOTES.|:DQUOTES ',       '',   'n',   'bar_repeat_start.jpeg'],
              ['Dal segno',              '\\\\bar DQUOTESSDQUOTES ',         '',   'n',   'bar_segno.jpeg'],
              ['Single',                 '\\\\bar DQUOTES|DQUOTES ',         '',   'n',   'bar_single.jpeg'],
              ['Small-wide-small',       '\\\\bar DQUOTES|.|DQUOTES ',       '',   'n',   'bar_sws.jpeg'],
              ['Tick',                   '\\\\bar DQUOTESSQUOTEDQUOTES ',    '',   'n',   'bar_tick.jpeg'],
              ['Wide',                   '\\\\bar DQUOTES.DQUOTES ',         '',   'n',   'bar_w.jpeg'],
              ['Wide-small',             '\\\\bar DQUOTES.|DQUOTES ',        '',   'n',   'bar_ws.jpeg'],
              ['Wide-wide',              '\\\\bar DQUOTES..DQUOTES ',        '',   'n',   'bar_ww.jpeg']
             ]
  },

  {
   category: 'other',
   elements: [
              ['Grace',                         '\\\\grace ',           '',   'b',   'grace_grace.jpeg'],
              ['Acciaccatura',                  '\\\\acciaccatura ',    '',   'b',   'grace_accia.jpeg'],
              ['Appoggiatura',                  '\\\\appoggiatura ',    '',   'b',   'grace_appog.jpeg'],
              ['After grace',                   '\\\\afterGrace ',      '',   'm',   'grace_after.jpeg'],
              ['',                              '',                     '',   'a',   ''],
              ['',                              '',                     '',   'a',   ''],
              ['Segno',                         '\\\\segno',            '',   'a',   'segno.jpeg'],
              ['Turn',                          '\\\\turn',             '',   'a',   'turn.jpeg'],
              ['Coda',                          '\\\\coda',             '',   'a',   'coda.jpeg'],
              ['Varcoda',                       '\\\\varcoda',          '',   'a',   'varcoda.jpeg'],
              ['',                              '',                     '',   'a',   ''],
              ['',                              '',                     '',   'a',   ''],
              ['jsShape + slur start',          jsShapePlusSlurStart,   '',   'a',   'js_slur_start.jpeg'],
              ['jsShape + phrasing slur start', jsShapePlusPhSlurStart, '',   'a',   'js_ph_slur_start.jpeg'],
              ['Slur start',                    '(',                    '',   'a',   'slur_start.jpeg'],
              ['Phrasing Slur start',           '(',                    '',   'a',   'ph_slur_start.jpeg'],
              ['Slur end',                      ')',                    '',   'a',   'slur_end.jpeg'],
              ['Phrasing Slur end',             ')',                    '',   'a',   'ph_slur_end.jpeg']
             ]
  }

]

