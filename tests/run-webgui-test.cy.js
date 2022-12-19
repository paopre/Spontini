/*
 * Created (14/11/2022) by Paolo-Prete.
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

it('passes', () => {

  cy.window()
    .its('console')
    .then((console) => {
      cy.stub(console, 'error').throws('Console error')
    })

  let testurl = 'http://localhost:8000/spontini-editor?test=' + Cypress.env('testnum')
  if (Cypress.env('removelilyinstall'))
    testurl += "&removelilyinstall=" + Cypress.env('removelilyinstall')

  cy.visit(testurl, {
      onBeforeLoad(win) {
        cy.stub(win.console, 'log').as('consoleLog')
      }
  })

  cy.get('@consoleLog', { timeout: Cypress.env('timeout') }).should('be.calledWith', 'SUCCESS')

})

