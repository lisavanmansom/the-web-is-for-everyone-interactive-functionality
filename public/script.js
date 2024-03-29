let hamburger = document.querySelector('.hamburger')
let navMenu = document.querySelector('.desktop')

hamburger.addEventListener("click", () => { 
 navMenu.classList.toggle('nav-active');
 navMenu.classList.toggle('desktop');
 hamburger.classList.toggle('active-bar');

});

console.log("test")

