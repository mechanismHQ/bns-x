const template = document.createElement('template');

template.innerHTML = `
<style>
* {
  background-color: rgb(23, 23, 23);
  font-family: system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  container: bns-card / inline-size;
  justify-content: space-evenly;
}

.icon-container {
  max-width: 50%;
  max-height: 50%;
  flex-grow: 1;
  aspect-ratio: 1;
  overflow: hidden;
  box-sizing: border-box;
  background: url(./bns-icon.webp) no-repeat center center;
  background-size: 160%;
}

#name {
  color: white;
  font-size: 10cqw;
  max-width: 80%;
  text-align: center;
  overflow-wrap: anywhere;
}
</style>

<div class="container">
  <div class="icon-container"></div>
  <span id="name"></span>
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
    const nameEl = this.shadowRoot.getElementById('name');
    const container = this.shadowRoot.querySelector('.container');
    nameEl.innerText = name;
    const cw = container.clientWidth;
    let baseSize = 10;
    while (nameEl.clientWidth / cw > 0.7 && baseSize > 4) {
      baseSize -= 0.1;
      nameEl.style.fontSize = `${baseSize}cqw`;
    }
  }
}

customElements.define('bns-card', BnsCard);
