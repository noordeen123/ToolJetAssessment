describe('Validating CRUD Operations on App', () => {
    const appName = Math.random().toString(36).substring(2, 10);
    const newAppName = `${appName}-updated`;
    let appId;

    before(() => {
        cy.viewport('macbook-15');
    });

    beforeEach(() => {
        cy.loginToolJet();
    });

    it('should create a new app and validate the creation', () => {
        cy.intercept('POST', '**/api/apps').as('createApp');

        cy.get('[data-cy="create-new-app-button"]').click();
        cy.get('[data-cy="app-name-input"]').type(appName);
        cy.get('[data-cy="+-create-app"]').click();

        // Wait for the app creation request to complete and validate the response
        cy.wait('@createApp').then(({ response }) => {
            expect(response.statusCode).to.eq(201);
            expect(response.body).to.have.property('name', appName);
            appId = response.body.id;
        });

        // Validate the app creation in the UI
        cy.contains('App created successfully!').should('be.visible');
        cy.go('back');
        cy.get(`[data-cy="${appName}-card"]`).should('be.visible');
    });

    it('should update the app name and validate the update', () => {
        cy.intercept('PUT', `**/api/apps/${appId}`).as('updateApp');

        cy.get(`[data-cy="${appName}-card"]`)
            .find('[data-cy="app-card-menu-icon"]')
            .click({ force: true });

        cy.intercept('GET', '**/api/apps?page=1&folder=&searchKey=&type=front-end').as('getApp');

        cy.get('[data-cy="rename-app-card-option"]').click();
        cy.get('[data-cy="app-name-input"]').clear().type(newAppName);
        cy.get('[data-cy="rename-app"]').click();

        // Wait for the app update request to complete and validate the response
        cy.wait('@updateApp').its('response.statusCode').should('eq', 200);

        cy.wait('@getApp').then(({ response }) => {
            expect(response.statusCode).to.eq(200);
            const updatedApp = response.body?.apps?.find(app => app.id === appId);
            expect(updatedApp?.name).to.eq(newAppName);
        });

        // Validate the app update in the UI
        cy.contains('App name has been updated!').should('be.visible');
        cy.get(`[data-cy="${newAppName}-card"]`).should('be.visible');
    });

    it('should delete the app and validate the deletion', () => {
        cy.intercept('DELETE', `**/api/apps/${appId}`).as('deleteApp');

        cy.get(`[data-cy="${newAppName}-card"]`)
            .find('[data-cy="app-card-menu-icon"]')
            .click({ force: true });

        cy.get('[data-cy="delete-app-card-option"]').click();
        cy.get('[data-cy="yes-button"]').click();

        // Wait for the app deletion request to complete and validate the response
        cy.wait('@deleteApp').its('response.statusCode').should('eq', 200);

        // Validate the app deletion in the UI
        cy.contains('App deleted successfully.').should('be.visible');
        cy.get(`[data-cy="${appName}-card"]`).should('not.exist');
    });

    it('should able to create app via uploading template', () => {
        cy.intercept('POST', '**/api/v2/resources/import').as('importApp');

        cy.get('[data-cy="import-dropdown-menu"]').click();
        cy.get('[data-cy="import-option-input"]').selectFile("cypress/downloads/template.json", { force: true });
        cy.get('[data-cy="app-name-input"]').clear().type(appName);
        cy.get('[data-cy="import-app"]').click();

        //Validate success message
        cy.contains('App imported successfully.').should('be.visible');

        // Wait for the app import request to complete and validate the response
        cy.wait('@importApp').then(({ response }) => {
            expect(response.statusCode).to.eq(201);
            expect(response.body.imports.app[0]).to.have.property('name', appName);
            appId = response.body.imports.app[0].id;
        });

        cy.intercept('GET', '**/api/apps?page=1&folder=&searchKey=&type=front-end').as('getApp');
        cy.go('back');

        // Wait for the apps to load and validate the response
        cy.wait('@getApp').then(({ response }) => {
            expect(response.statusCode).to.eq(200);
            const importedApp = response.body?.apps?.find?.(app => app.id === appId);
            expect(importedApp?.name).to.eq(appName);
        });

        // Validate the app creation in the UI
        cy.get(`[data-cy="${appName}-card"]`).should('be.visible');
    })
});
