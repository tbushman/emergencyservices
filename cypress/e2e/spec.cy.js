before(() => {
    cy.login();
});
beforeEach(() => {
    cy.setCookie('escookie', appCookie);
});
context('login', () => {
  it('passes', () => {
    cy.visit('http://localhost:8010');
    cy.get('#menu > li > a').click();
    cy.get('#addfeature').click();
  })
})