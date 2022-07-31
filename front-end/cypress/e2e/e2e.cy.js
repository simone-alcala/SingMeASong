const url = 'http://localhost:3000/';

describe('e2e tests suit', () => {
 
  it('should add new music ', () => {
    cy.visit(url);

    cy.get("input").eq(0).type("nova música");
    cy.get("input").eq(1).type("https://www.youtube.com/watch?v=a");

    cy.get("svg").eq(5).click();    

    cy.get("video").should('be.visible');

  });

  it('should up score a music ', () => {
    
    const random = (Math.random()).toString();
    
    cy.visit(url);

    cy.get("input").eq(0).type(random);
    cy.get("input").eq(1).type(`https://www.youtube.com/watch?v=${random}`);
      
    cy.get("svg").eq(5).click();    
    cy.get("svg").eq(6).click();    

    cy.get( cy.get("article div").eq(2) ).eq(2).should(1);

  });

})