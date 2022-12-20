#
# Created (10/12/2021) by Paolo-Prete.
# This file is part of Spontini-Editor project.
#
# Spontini-Editor is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# Spontini-Editor is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Spontini-Editor. If not, see <http://www.gnu.org/licenses/>.
#

from reportlab.graphics import renderPDF
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from svglib.svglib import svg2rlg
from PyPDF2 import PdfFileWriter, PdfFileReader
import os
import sys

def addMaskToPdf(mask, pdf):
  maskPdf = PdfFileReader(open(mask, "rb"))
  generatedPdf = PdfFileReader(open(pdf, "rb"))
  output = PdfFileWriter()
  page = generatedPdf.getPage(0)
  page.mergePage(maskPdf.getPage(0))
  output.addPage(page)
  outputStream = open(pdf+"BAK", "wb")
  output.write(outputStream)
  outputStream.close()
  maskPdf.stream.close()
  generatedPdf.stream.close()
  os.remove(pdf)
  os.rename(pdf+"BAK", pdf)

def getExamplesDir():
  if getattr(sys, 'frozen', False):
    return os.path.join(os.path.dirname(sys.executable), 'examples')
  else:
    return os.path.dirname(__file__)

# Create a temporary mask in the workspace of pdf-manipulate-example
# Note: wsDirPath is the directory of the (current) workspace
mask = canvas.Canvas(os.path.join(getExamplesDir(), "mask.pdf"))
mask.setPageSize((210 * mm, 297 * mm))

# Import a SVG image (vector)
# (from https://commons.wikimedia.org/wiki/File:Ouroboros-simple.svg)
drawing = svg2rlg(os.path.join(getExamplesDir(), "ouroboros.svg"))
# scale the SVG image
drawing.scale(3, 3)
# Add the SVG image to the mask at X,Y position
renderPDF.draw(drawing, mask, 10 * mm, 50 * mm)

# Add a raster image to the mask at X,Y position with 105x105px size
mask.drawImage(os.path.join(getExamplesDir(), "ouroboros.jpeg"), 10 * mm, 100 * mm, 105, 105)

# Add a string to the mask
mask.drawString(10 * mm, 145 * mm, 'Raster image scaled (intentionally blurry)')

# Save the mask
mask.save()

# Merge the mask on the generated pdf-manipulate-example.pdf
addMaskToPdf(os.path.join(getExamplesDir(), "mask.pdf"), os.path.join(getExamplesDir(), "pdf-manipulate-example.pdf"))

# Remove the mask
os.remove(os.path.join(getExamplesDir(), "mask.pdf"))
