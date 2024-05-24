import {Controller} from "@hotwired/stimulus"


export default class extends Controller {
    connect() {

        window.addEventListener("scroll", function () {
            const header = document.querySelector('header');
            header.classList.toggle('scroll', window.scrollY > 40);
        });
    }

}
