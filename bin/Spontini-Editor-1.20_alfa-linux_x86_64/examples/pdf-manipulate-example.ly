%
% Created (10/12/2021) by Paolo-Prete.
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
% HOW TO:
% (This example requires that Inkscape is installed on your OS)
% Engrave this example in PDF MODE. A python script called
% pdf-manipulate-example-postengraving.py, inside the example's directory, will be executed
% and it will add a string + a vector image + a raster image on the generated PDF page.
%
% NOTE: don't engrave this example in SVG MODE, otherwise the python script will fail. 
%
% In general, given a FILENAME.ly file, You can associate to it two scripts that will be executed
% before and after the creation of the PDF: their filename must be in the form FILENAME-beforepdf.suffix
% and FILENAME-postengraving.suffix.
%

\version "2.19.84"

\paper {
  ragged-last  = ##f
  ragged-last-bottom = ##f
  indent = 0
  top-margin = 10\cm
}

{
  c'4 e' g' e' \noBreak d' f' a' f' \noBreak e' g' b' g'
}