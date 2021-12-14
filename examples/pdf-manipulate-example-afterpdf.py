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
from spontini_server_core import addMaskToPdf
from spontini_server_core import wsDirPath
import os

# Create a temporary mask in the workspace of pdf-manipulate-example
# Note: wsDirPath is the directory of the (current) workspace
mask = canvas.Canvas(os.path.join(wsDirPath, "mask.pdf"))
mask.setPageSize((210 * mm, 297 * mm))

# Import a SVG image (vector)
# (from https://commons.wikimedia.org/wiki/File:Ouroboros-simple.svg)
drawing = svg2rlg(os.path.join(wsDirPath, "ouroboros.svg"))
# scale the SVG image
drawing.scale(3, 3)
# Add the SVG image to the mask at X,Y position
renderPDF.draw(drawing, mask, 10 * mm, 50 * mm)

# Add a raster image to the mask at X,Y position with 105x105px size
mask.drawImage(os.path.join(wsDirPath, "ouroboros.jpeg"), 10 * mm, 100 * mm, 105, 105)

# Add a string to the mask
mask.drawString(10 * mm, 145 * mm, 'Raster image scaled (intentionally blurry)')

# Save the mask
mask.save()

# Merge the mask on the generated pdf-manipulate-example.pdf
addMaskToPdf(os.path.join(wsDirPath, "mask.pdf"), os.path.join(wsDirPath, "pdf-manipulate-example.pdf"))

# Remove the mask
os.remove(os.path.join(wsDirPath, "mask.pdf"))
