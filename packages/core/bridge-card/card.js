const template = document.createElement('template');

template.innerHTML = `
<style>
* {
  background-color: rgb(23, 23, 23);
  font-family: system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
}

.container {
  // aspect-ratio: 1;
  display: flex;
  // height: 100%;
  flex-direction: column;
  align-items: center;
  /* padding: 10vh 0; */
  /* max-height: 100vh; */
  /* max-height: 300px; */
  box-sizing: border-box;
  /* border: 1px solid white; */
  container: bns-card / inline-size;
}

.icon-container {
  width: 724px; 
  /* height: 724px;  */
  max-width: 70%;
  aspect-ratio: 1;
  height: auto;
  overflow: hidden; 
  position: relative;
}


.icon {
  position: absolute;
  ttop: -238px; /* Move the image up by 200px to show the center */
  lleft: -238px; /* Move the image left by 200px to show the center */
  width: 724px; 
  height: 724px;
  object-fit: cover;
}

#name {
  color: white;
  font-size: 64px;
  max-width: 80%;
  text-align: center;
  overflow-wrap: anywhere;
}

.grow {
  flex-grow: 1;
}

@container bns-card (width < 700px) {
  #name {
    font-size: 48px;
  }
}

@container bns-card (width < 400px) {
  #name {
    font-size: 32px;
  }
}

@container bns-card (width < 250px) {
  #name {
    font-size: 16px;
  }
}

@container bns-card (width < 200px) {
  #name {
    font-size: 12px;
  }
}
</style>

<div class="container">
  /**<div class="icon-container">*/
    <img src="./bns-icon.webp" alt="BNS Icon" class="icon">
  </div>
  <span id="name"></span>
  <div class="grow"></div>
</div>
`;

class BnsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    const name = this.getAttribute('n');
    this.shadowRoot.getElementById('name').innerText = name;
  }
}

customElements.define('bns-card', BnsCard);
