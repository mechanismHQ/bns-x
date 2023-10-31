const template = document.createElement('template');

template.innerHTML = `
<style>
* {
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
  background: rgb(241, 158, 0);
  background: linear-gradient(180deg, rgba(241, 158, 0, 1) 0%, rgba(221, 80, 0, 1) 100%);
}

.icon-container {
  max-width: 50%;
  max-height: 50%;
  flex-grow: 1;
  aspect-ratio: 1891 / 1260;
  overflow: hidden;
  box-sizing: border-box;
}

.icon-container svg {
  max-width: 100%;
  max-height: 100%;
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
  <div class="icon-container">
  <svg fill=none height=1260 viewBox="0 0 1891 1260"width=1891 xmlns=http://www.w3.org/2000/svg><mask height=1212 id=mask0_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=365 x=503 y=24><path d="M503.667 24.6666H867.422V1235.33H503.667V24.6666Z"fill=white /></mask><g mask=url(#mask0_205_73)><mask height=1210 id=mask1_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=363 x=504 y=25><path d="M762.338 1127.56C697.25 1062.47 646.411 986.802 611.317 903.776C574.963 817.781 556.13 725.193 556.13 629.693C556.13 534.188 574.963 441.625 611.317 355.635C646.411 272.609 697.25 196.932 762.338 131.849C794.583 99.6042 829.406 70.8698 866.448 45.7917C847.073 37.9635 827.213 31.0677 806.937 25.1562C778.593 46.4531 751.479 69.8802 725.927 95.4323C581.984 239.375 504.63 431.219 504.63 629.693C504.63 828.161 581.984 1020.01 725.927 1163.95C751.479 1189.5 778.593 1212.93 806.937 1234.22C827.213 1228.31 847.073 1221.42 866.448 1213.59C829.406 1188.51 794.552 1159.78 762.338 1127.53"fill=white /></mask><g mask=url(#mask1_205_73)><path d="M-14.063 -14.9167H1904.81V1274.33H-14.063V-14.9167Z"fill=white /></g></g><mask height=1260 id=mask2_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=337 x=378 y=0><path d="M378.333 0.078125H714.334V1259.33H378.333V0.078125Z"fill=white /></mask><g mask=url(#mask2_205_73)><mask height=1260 id=mask3_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=336 x=378 y=0><path d="M673.287 1216.61C596.74 1140.07 536.813 1051.02 495.302 952.786C452.287 851.078 430.183 742.078 430.183 629.719C430.183 517.365 452.287 408.365 495.302 306.651C536.813 208.422 596.74 119.401 673.287 42.8229L713.177 5.48438C690.235 2.48438 666.865 0.713542 643.203 0.234375L636.87 6.41146C471.964 171.318 378.683 393.938 378.683 629.719C378.683 865.505 471.933 1088.09 636.87 1253.03L643.203 1259.21C666.865 1258.73 690.203 1256.99 713.177 1253.96L673.287 1216.61Z"fill=white /></mask><g mask=url(#mask3_205_73)><path d="M-14.062 -14.9167H1904.81V1274.33H-14.062V-14.9167Z"fill=white /></g></g><mask height=1246 id=mask4_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=283 x=252 y=7><path d="M252.781 7.33331H534.615V1252.67H252.781V7.33331Z"fill=white /></mask><g mask=url(#mask4_205_73)><mask height=1246 id=mask5_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=283 x=252 y=7><path d="M379.313 1001.8C329.672 884.37 304.266 758.995 304.266 629.719C304.266 500.448 329.641 375.068 379.313 257.641C417.854 166.521 469.953 82.5364 534.594 7.36975C507.24 11.5729 480.453 17.5416 454.359 25.1302C325.922 196.036 252.797 406.234 252.797 629.719C252.797 853.208 325.922 1063.44 454.359 1234.31C480.453 1241.9 507.208 1247.87 534.594 1252.07C469.953 1176.93 417.854 1092.92 379.313 1001.8Z"fill=white /></mask><g mask=url(#mask5_205_73)><path d="M-14.0625 -14.9167H1904.81V1274.33H-14.0625V-14.9167Z"fill=white /></g></g><mask height=1110 id=mask6_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=205 x=126 y=75><path d="M126.854 75.3333H330.734V1184.39H126.854V75.3333Z"fill=white /></mask><g mask=url(#mask6_205_73)><mask height=1108 id=mask7_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=205 x=126 y=76><path d="M263.297 1050.81C206.994 917.667 178.354 775.88 178.354 629.719C178.354 483.557 206.994 341.776 263.323 208.63C282.729 162.74 305.198 118.531 330.51 76.0573C298.51 93.4531 268.182 113.552 239.838 136.016C167.192 285.927 126.88 453.562 126.88 629.719C126.88 805.875 167.192 973.516 239.838 1123.42C268.182 1145.89 298.51 1165.98 330.51 1183.38C305.198 1140.91 282.729 1096.7 263.323 1050.81"fill=white /></mask><g mask=url(#mask7_205_73)><path d="M-14.063 -14.9167H1904.81V1274.33H-14.063V-14.9167Z"fill=white /></g></g><mask height=685 id=mask8_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=103 x=0 y=287><path d="M0.932129 287.906H102.333V971.333H0.932129V287.906Z"fill=white /></mask><g mask=url(#mask8_205_73)><mask height=683 id=mask9_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=102 x=0 y=288><path d="M52.4063 629.719C52.4063 512.953 68.875 398.734 101.266 288.599C40.5313 382.63 4.14583 493.875 1.11458 613.432L0.9375 629.719C0.9375 635.177 1.08854 640.578 1.14583 646.005C4.17708 765.563 40.5573 876.813 101.297 970.844C68.875 860.703 52.4375 746.49 52.4375 629.719"fill=white /></mask><g mask=url(#mask9_205_73)><path d="M-14.0625 -14.9167H1904.81V1274.33H-14.0625V-14.9167Z"fill=white /></g></g><mask height=1260 id=mask10_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=1261 x=630 y=0><path d="M630.557 0.078125H1890.33V1259.33H630.557V0.078125Z"fill=white /></mask><g mask=url(#mask10_205_73)><mask height=1260 id=mask11_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=1260 x=630 y=0><path d="M1260.18 0.083313C912.458 0.083313 630.573 281.969 630.573 629.719C630.573 977.474 912.458 1259.33 1260.18 1259.33C1607.9 1259.33 1889.82 977.443 1889.82 629.693C1889.82 281.937 1607.93 0.083313 1260.18 0.083313ZM1260.18 51.5521C1414.62 51.5521 1559.79 111.693 1669 220.901C1778.21 330.109 1838.35 475.281 1838.35 629.719C1838.35 784.161 1778.21 929.333 1669 1038.54C1559.79 1147.75 1414.62 1207.89 1260.18 1207.89C1105.74 1207.89 960.568 1147.75 851.359 1038.54C742.151 929.333 682.015 784.161 682.015 629.719C682.015 475.281 742.151 330.109 851.359 220.901C960.568 111.693 1105.74 51.5521 1260.18 51.5521Z"fill=white /></mask><g mask=url(#mask11_205_73)><path d="M-14.0625 -14.9167H1904.81V1274.33H-14.0625V-14.9167Z"fill=white /></g></g><mask height=746 id=mask12_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=518 x=1001 y=256><path d="M1001 256.667H1518.33V1002H1001V256.667Z"fill=white /></mask><g mask=url(#mask12_205_73)><mask height=745 id=mask13_205_73 maskUnits=userSpaceOnUse style=mask-type:luminance width=518 x=1001 y=257><path d="M1322.54 810.917C1309.34 815.536 1295.28 817.875 1280.7 817.875H1182.49V651.135H1280.7C1295.24 651.135 1309.34 653.474 1322.54 658.094C1360.51 671.354 1385.05 701.349 1385.05 734.49C1385.05 767.635 1360.51 797.63 1322.54 810.885M1182.49 438.359H1259.43C1283.22 438.359 1306.07 445.318 1323.83 457.974C1344.58 472.76 1356.52 494.089 1356.52 516.432C1356.52 538.776 1344.61 560.104 1323.83 574.891C1306.1 587.547 1283.22 594.505 1259.43 594.505H1182.49V438.359ZM1487.57 659.385C1470.41 638.839 1446.9 621.979 1419.6 610.672L1410.57 606.927L1418.88 601.734C1458.2 577.198 1480.76 540.276 1480.76 500.448C1480.76 481.401 1475.66 463.042 1465.61 445.948C1439.34 401.167 1382.53 372.219 1320.92 372.219H1315.88V257.854H1249.74V372.25H1182.49V257.854H1116.36V372.25H1001.99V438.385H1041.55C1061.77 438.385 1078.21 454.823 1078.21 475.042V781.219C1078.21 801.437 1061.77 817.875 1041.55 817.875H1001.99V887.187H1116.33V1001.56H1182.46V887.187H1249.68V1001.56H1315.79V887.187H1336.36C1403.43 887.187 1464.89 857.615 1496.71 810.047C1510.84 788.927 1518.31 765.026 1518.31 740.88C1518.31 711.724 1507.66 683.557 1487.51 659.443"fill=white /></mask><g mask=url(#mask13_205_73)><path d="M-14.0625 -14.9167H1904.81V1274.33H-14.0625V-14.9167Z"fill=white /></g></g></svg>
  </div>
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
