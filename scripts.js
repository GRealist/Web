document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".volunteer-form");
  
    form.addEventListener("submit", function (e) {
      e.preventDefault(); 
      
      const name = document.querySelector('[name="firstName"]').value.trim();
      
      alert(`Ευχαριστούμε, ${name}! Θα επικοινωνήσουμε μαζί σας σύντομα.`);
      form.reset();
    });
  });
