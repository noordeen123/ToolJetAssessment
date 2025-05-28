// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

//Login to ToolJet with predefined credentials
Cypress.Commands.add('loginToolJet', () => {
    cy.visit('https://v3-lts-cetestsystem.tooljet.com/cy-qa')
    cy.get('#email').type('email@example.com') // Replace with your actual email
    cy.get('#password').type('password', { force: true }) // Replace with your actual password
    cy.get('[type="submit"]').click({ force: true })
})