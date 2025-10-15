import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module";

import en from "./localize/en.js";
import de from "./localize/de.js";
import es from "./localize/es.js";
import fr from "./localize/fr.js";


const languages = { en, de, es, fr };
function localize(key, lang) {
    return languages[lang]?.[key] || languages["en"][key] || key;
}


class PriceTimelineCard extends LitElement {
    
    constructor() {
        super();
        this._dayOffset = 0; // 0 = today, 1 = tomorrow, 2 = both
        this._animating = false; 
    }
    
    static get properties() {
        return {
            config: {},
            theme: { type: String },
            selectedIndex: { type: Number },
        };
    }
    

    set hass(hass) {
        this._hass = hass;
        this._lang = hass?.locale?.language || hass?.language || "en";
        this.requestUpdate();
    }
    
    firstUpdated() {
  
    }
    
    static get styles() {
        return css`
            :host {
              --color-bg-light:#fff;
              --color-text-light:#000;
              --color-subtle-light:#666;
              --color-dot-light:#656c72;
              --color-orange-light:#ff832d;
              --color-turquoise-light:#1dbfac;
              --color-bg-dark:#1e1e1e;
              --color-text-dark:#f5f5f5;
              --color-subtle-dark:#aaa;
              --color-dot-dark:#999;
              --color-orange-dark:#ff832d;
              --color-turquoise-dark:#1dbfac;
              --card-bg:var(--color-bg-light);
              --card-text:var(--color-text-light);
              --card-subtle:var(--color-subtle-light);
              --card-dot:var(--color-dot-light);
              --orange:var(--color-orange-light);
              --turquoise:var(--color-turquoise-light);
            }
            ha-card {
              background:var(--card-bg);
              padding:16px;
              color:var(--card-text);
              text-align:center;
            }
            .header {
              display:flex;
              justify-content:space-between;
              align-items:flex-start;
            }
            .header-left {
              display:flex;
              flex-direction:column;
              align-items:flex-start;
              gap:0
            }
            .time {
              font-size:14px;
              color:var(--card-subtle);
              line-height:1.1;
              margin:0
            }
            .price {
              font-size:24px;
              font-weight:bold;
              color:var(--card-text);
              line-height:1.1;
              margin-top:3px;
              display:flex;
              align-items:baseline;
              justify-content:center;
            }
            .price .value {
              font-size:28px;
              font-weight:800;
            }
            .price .unit {
              font-size:14px;
              font-weight:normal;
              margin-left:6px;
              color:var(--card-text);
            }
            .label {
              font-size:14px;
              color:var(--card-subtle);
              text-align: right;
            }
            .timeline {
              display:flex;
              margin:8px 0;
              height:6px;
              border-radius:5px;
              overflow:visible;
              position:relative;
              z-index: 0;
            }
            .slot {
              flex:1;
              opacity:1;
              position:relative;
            }
            .slot.marker::after {
              content:"";
              position:absolute;
              top:50%;
              left:calc(var(--progress,0)*100%);
              transform:translate(-50%,-50%);
              width:3px;
              height:14px;
              background:inherit;
              border:2px solid var(--card-bg);
              border-radius:10px;
              box-shadow:0 0 4px rgba(0,0,0,0.3);
              z-index:1;
            }
            .faded {
              opacity:0.3;
            }
            .scale {
              display:grid;
              grid-template-columns:repeat(25,1fr);
              font-size:12px;
              color:var(--card-subtle);
              margin-top:6px;
              width:calc(100% + (100% / 24));
              margin-left:calc(-0.5 * (100% / 24));
              margin-right:calc(-0.5 * (100% / 24));
            }
            .scale .tick {
              display:flex;
              flex-direction:column;
              align-items:center;
            }
            .scale .dot {
              width:4px;
              height:4px;
              border-radius:50%;
              background:var(--card-dot);
              margin-bottom:4px;
            }
            .scale .dot.faded {
              opacity:0.4;
            }
            .scale .hour {
              font-variant-numeric:tabular-nums;
              text-align:center;
            }
            /* Kreis */
             .circle-container {
              position:relative;
              width:150px;
              height:150px;
              margin:0 auto;
            }
            .circle-container svg {
              transform:rotate(-90deg);
            }
            .circle-text {
              position:absolute;
              top:50%;
              left:50%;
              transform:translate(-50%,-50%);
              text-align:center;
            }
            .circle-text .value {
              font-size:28px;
              font-weight:bold;
              color:var(--card-text);
            }
            .circle-text .unit {
              font-size:16px;
              margin-left:4px;
              color:var(--card-text);
            }
            .circle-text .time {
              font-size:14px;
              color:var(--card-subtle);
              margin-top:4px;
            }
            .slider-container {
              margin-top:16px;
            }
            input[type="range"] {
              width:100%;
              height:6px;
              border-radius:5px;
              background:var(--primary-color);
              outline:none;
              opacity:0.9;
              transition:background 0.3s;
            }
            input[type="range"]::-webkit-slider-thumb {
              width:18px;
              height:18px;
              border-radius:50%;
              background:var(--slider-color,var(--accent-color));
              cursor:pointer;
            }
            input[type="range"]::-moz-range-thumb {
              width:18px;
              height:18px;
              border-radius:50%;
              background:var(--slider-color,var(--accent-color));
              cursor:pointer;
            }
            /* --- No Data Ticker  --- */
            .ticker-container {
              width: 240px;
              height: 60px;
              overflow: hidden;
              text-align: center;
              margin: 0 auto;
            }
            
            .ticker-svg {
              width: 480px;
              height: 60px;
              animation: scroll 4s linear infinite;
            }
            
            .ticker-svg polyline {
              fill: none;
              stroke: var(--no-data-line, var(--primary-color)); 
              stroke-width: 2;
              stroke-linejoin: round;
            }
            
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-240px); }
            }
            
            .no-data-text {
              font-size: 14px;
              color: var(--no-data-text, var(--secondary-text-color));
              text-align: center;
            }
            
            .day-toggle {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-top: 12px;
            }
            

            .toggle-button {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: space-between;
              background-color: rgba(189, 189, 189, 0.5); /* grau */
              border-radius: 9999px;
              width: 100%;
              height: 35px;
              cursor: pointer;
              overflow: hidden;
              transition: background-color 0.3s;
            }
            

            .toggle-button span {
              flex: 1;
              text-align: center;
              color: white;
              font-size: 14px;
              font-weight: 600;
              z-index: 2;
              pointer-events: none;
            }
            

            .toggle-indicator {
              position: absolute;
              top: 4px;
              left: 4px;
              width: calc(50% - 4px);
              height: calc(100% - 8px);
              background-color: white;
              border-radius: 9999px;
              transition: left 0.25s ease;
              z-index: 1;
            }
            
            .active-today .toggle-indicator {
              left: 4px;
            }
            .active-tomorrow .toggle-indicator {
              left: calc(50% + 0px);
            }
            
            .active-today span.today,
            .active-tomorrow span.tomorrow {
              color: #333;
            }
        `;
    }
    
    setConfig(config) {
        if (!config.price) throw new Error(localize("missing_price", "en"));
        this.config = config;
        this.theme = config.theme || "light";
        this.selectedIndex = undefined;
        switch (config.start_view) {
            case "tomorrow":
              this._dayOffset = 1;
              break;
            default:
              this._dayOffset = 0; 
          }
    }

    _onSliderChange(ev) {
        this.selectedIndex = parseInt(ev.target.value, 10);
    }
    
    
    _applyTheme() {
        switch (this.theme) {
            case "dark":
                this.style.setProperty("--card-bg", "var(--color-bg-dark)");
                this.style.setProperty("--card-text", "var(--color-text-dark)");
                this.style.setProperty("--card-subtle", "var(--color-subtle-dark)");
                this.style.setProperty("--card-dot", "var(--color-dot-dark)");
                this.style.setProperty("--orange", "var(--color-orange-dark)");
                this.style.setProperty("--turquoise", "var(--color-turquoise-dark)");
                this.style.setProperty("--no-data-line", "var(--orange)");
                this.style.setProperty("--no-data-text", "var(--color-subtle-dark)");
                break;
            case "theme":
                this.style.setProperty("--card-bg", "var(--ha-card-background, var(--card-background-color))");
                this.style.setProperty("--card-text", "var(--primary-text-color)");
                this.style.setProperty("--card-subtle", "var(--secondary-text-color)");
                this.style.setProperty("--card-dot", "var(--divider-color)");
                this.style.setProperty("--orange", "var(--accent-color)");
                this.style.setProperty("--turquoise", "var(--state-icon-color)");
                this.style.setProperty("--no-data-line", "var(--accent-color)");
                this.style.setProperty("--no-data-text", "var(--secondary-text-color)");
                break;
            default:
                this.style.setProperty("--card-bg", "var(--color-bg-light)");
                this.style.setProperty("--card-text", "var(--color-text-light)");
                this.style.setProperty("--card-subtle", "var(--color-subtle-light)");
                this.style.setProperty("--card-dot", "var(--color-dot-light)");
                this.style.setProperty("--orange", "var(--color-orange-light)");
                this.style.setProperty("--turquoise", "var(--color-turquoise-light)");
                this.style.setProperty("--no-data-line", "var(--orange)");
                this.style.setProperty("--no-data-text", "var(--color-subtle-light)");
        }
    }
    
     _getDataTimeLabel(data, index) {
          const startTime = new Date(data[index]?.start_time);
          const endTime =
            index + 1 < data.length
              ? new Date(data[index + 1].start_time)
              : new Date(startTime.getTime() + 15 * 60000);
        
          const format = (date) =>
            date.toTimeString().slice(0, 5); // "HH:MM"
        
          return `${format(startTime)}-${format(endTime)}`;
    }

    _getCurrentDataIndex(data, now) {
        let bestIndex = 0;
        let bestDiff = Number.POSITIVE_INFINITY;
        for (let i = 0; i < data.length; i++) {
            const start = new Date(data[i].start_time);
            const diff = now - start;
            if (diff >= 0 && diff < bestDiff) {
                bestDiff = diff;
                bestIndex = i;
            }
        }
        return bestIndex;
    }
    
    _getDataForOffset(entity, offset = 0) {
        const allData = entity?.attributes?.data || [];
        if (offset === 2){
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const filtered = allData.filter(item => {
            const date = new Date(item.start_time);
              return (
                this._isSameDay(date, yesterday) ||
                this._isSameDay(date, now) ||
                this._isSameDay(date, tomorrow)
              );
            });
            return filtered;
        }else if (offset ===1 || offset ===0){
            const date = new Date();
            date.setDate(date.getDate() + offset);
            return allData.filter(item => {
                const start = new Date(item.start_time);
                return start.getFullYear() === date.getFullYear() &&
                       start.getMonth() === date.getMonth() &&
                       start.getDate() === date.getDate();
            });
        }
    }
    
    _isSameDay(d1, d2) {
          return d1.getFullYear() === d2.getFullYear() &&
                 d1.getMonth() === d2.getMonth() &&
                 d1.getDate() === d2.getDate();
    }

    _hasPriceData(data) {
        return data.every(obj => obj.hasOwnProperty('price_per_kwh'));
    }

    _renderNoData(lang) {
        return html`
            <div class="ticker-container">
                <svg class="ticker-svg" viewBox="0 0 480 60">
                    <polyline points="0,30 40,30 60,10 80,50 100,30 140,30 160,20 180,40 200,30 240,30 260,10 280,50 300,30 340,30 360,20 380,40 400,30 440,30 460,15 480,45"/>
                </svg>
            </div>
            <div class="no-data-text">${localize("no_data", lang)}</div>
            ${this.config.day_switch?this._renderToggler(lang):""}
        `;
    }

    _renderNoPrices(lang) {
        return html`<div>${localize("no_data_prices", lang)}</div>`;
    }
    
    _renderNoAttributes(lang) {
        return html`<div>${localize("no_data_attributes", lang)}</div>`;
    }

   _calculateAveragePrice(data) {
      if (!data || data.length === 0) return 0;

       const centsRounded = data.map(item => {
          const centValue = item.price_per_kwh * 100;
          return Math.round(centValue * 10) / 10; 
       }); 

       const sum = centsRounded.reduce((acc, val) => acc + val, 0);
       const average = sum / centsRounded.length;

        const rounded = Math.round(average);

        return rounded / 100;
    }

   _roundCent(price_per_kwh){
       return (Math.round(Math.round(price_per_kwh * 100 * 10) / 10) / 100);
   }
  
    _getPriceRange(data) {
      if (!data || data.length === 0) {
        return { min: undefined, max: undefined };
      }
    
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
    
      for (const item of data) {
        const price = parseFloat(item.price_per_kwh);
        if (isNaN(price)) continue;
        if (price < min) min = price;
        if (price > max) max = price;
      }
    
      return { min, max };
    }
    
    _getCurrency(lang = this.hass?.language || "en") {
    //default =cent
      const defaultCurrency = {
        name: localize("unit_cent", lang), 
        symbol: "¢",
      };
    
     const cur = this.config.currency;
     if (cur && (cur.name?.trim() || cur.symbol?.trim())) {
            return {
                name: cur.name?.trim() || defaultCurrency.name,
                symbol: cur.symbol?.trim() || defaultCurrency.symbol,
            };
      }
      return defaultCurrency;
    }


    //CIRCLE
    _renderCircle(data, currentIndex, avg, lang) {
        const currentData = data[currentIndex];
        let currentPrice = currentData.price_per_kwh;
        const formattedPrice = (currentPrice * 100).toFixed(0);
        currentPrice = this._roundCent(currentPrice);
        const radius = 65;
        const minPrice = Math.min(...data.map(d => d.price_per_kwh));
        const maxPrice = Math.max(...data.map(d => d.price_per_kwh));
        const rawRatio = (currentPrice - minPrice) / (maxPrice - minPrice || 1);
        const ratio = 0.05 + rawRatio * 0.9;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - ratio);
        const circleColor = currentPrice > avg ? "var(--orange)" : "var(--turquoise)";
        const timeLabel = this._getDataTimeLabel(data, currentIndex);

        return html`
            <div class="circle-container">
                <svg width="150" height="150">
                    <circle cx="75" cy="75" r="${radius}" stroke="var(--card-dot)" stroke-width="10" fill="none" opacity="0.2"></circle>
                    <circle cx="75" cy="75" r="${radius}" stroke="${circleColor}" stroke-width="10" fill="none"
                        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"></circle>
                </svg>
                <div class="circle-text">
                    <div class="price">
                        <span class="value">${formattedPrice}</span>
                        <span class="unit">${this._getCurrency(lang).name}</span>
                    </div>
                    <div class="time">${timeLabel}</div>
                </div>
            </div>
            
            ${this.config.day_switch? this._renderToggler(lang) : ""}
            ${this.config.slider ? this._renderSlider(data, currentIndex) : ""}
        `;
    }
    
    _renderToggler(lang){
       const activeClass = this._dayOffset === 0 ? "active-today" : "active-tomorrow";

        return html `
      <div class="day-toggle">
        <div class="toggle-button ${activeClass}" @click=${this._toggleDayView}>
          <div class="toggle-indicator"></div>
          <span class="today">${localize("editor_start_today", lang)}</span>
          <span class="tomorrow">${localize("editor_start_tomorrow", lang)}</span>
        </div>
      </div>
        `
    }
    
    
    _toggleDayView(){
        this._dayOffset = this._dayOffset===0?1:0;
        this.requestUpdate();
    }
    
    _renderSlider(data, currentIndex){
       return html ` 
        <div class="slider-container">
           <input type="range" min="0" max="${data.length - 1}" .value="${currentIndex}" @input="${this._onSliderChange}" />
        </div>
       `
    }


     //TIMELINE
    _renderTimeline(data, currentIndex, avg, lang) {
        const now = new Date();
        const slotMinutes = data.length > 1 ? Math.round((new Date(data[1].start_time) - new Date(data[0].start_time)) / 60000) : 60;
        const minutes = now.getMinutes();
        const progress = slotMinutes === 60 ? (minutes / slotMinutes) : ((minutes % slotMinutes) / 15);

          const currentPrice = data[currentIndex].price_per_kwh;
          const formattedPriceTL = ((currentPrice * 100).toFixed(1))
            .replace('.', ',')
            .replace(/,0$/, '');

          const { min, max } = this._getPriceRange(data);
          const format = (value) =>
            ((value * 100).toFixed(1))
              .replace('.', ',')
              .replace(/,0$/, '');
        
        let timeLabel = this._getDataTimeLabel(data, currentIndex);


        return html`
            <div class="header">
                <div class="header-left">
                    <div class="time">${timeLabel}</div>
                    <div class="price">
                        <span class="value">${formattedPriceTL}</span>
                        <span class="unit">${this._getCurrency(lang).name}</span>
                    </div>
                </div style="display: grid">
                <div>
                <div class="label">${this._dayOffset === 0 ? localize("label_today_price", lang) : localize("label_tomorrow_price", lang)}</div>
                <div style="text-align: right; font-weight: bold;">${format(min)} - ${format(max)}</div>
                </div>
            </div>
            <div class="timeline">
                ${data.map((d, i) => {
                    const color = this._roundCent(d.price_per_kwh) > avg ? "var(--orange)" : "var(--turquoise)";
                    const faded = i < currentIndex ? "faded" : "";
                    const marker = (i === currentIndex && (currentIndex != 0 || this._dayOffset === 0) ) ? "marker" : "";
                    const prevColor = i > 0 ? (this._roundCent(data[i - 1].price_per_kwh) > avg ? "var(--orange)" : "var(--turquoise)") : null;
                    const nextColor = i < data.length - 1 ? (this._roundCent(data[i + 1].price_per_kwh) > avg ? "var(--orange)" : "var(--turquoise)") : null;
                    let borderRadius = "";
                    if (prevColor !== color) borderRadius += "border-top-left-radius:10px; border-bottom-left-radius:10px;";
                    if (nextColor !== color) borderRadius += "border-top-right-radius:10px; border-bottom-right-radius:10px;";
                    return html`<div class="slot ${faded} ${marker}" style="background:${color};${borderRadius};--progress:${i === currentIndex ? progress : 0}"></div>`;
                })}
            </div>
            <div class="scale">
                ${Array.from({ length: 25 }).map((_, i) => {
                    const showHour = i % 6 === 0 || i === 24;
                    return html`
                        <div class="tick">
                            <div class="dot ${showHour ? "" : "faded"}"></div>
                            ${showHour ? html`<div class="hour">${String(i % 24).padStart(2, "0")}</div>` : ""}
                        </div>`;
                })}
            </div>
            ${this.config.day_switch? this._renderToggler(lang) : ""}
            ${this.config.slider ? this._renderSlider(data, currentIndex) : ""}
        `;
    }

    _generateChart(data, currentIndex, average, lang){
        const rawData = data;
        const parsed = rawData.map(d => ({
        time: new Date(d.start_time),
        cent: d.price_per_kwh * 100
      }));
      parsed.sort((a,b)=>a.time-b.time);
    
      const start = parsed[0].time;
      const end = parsed[parsed.length-1].time;
      const now = new Date();
      const hasTomorrow = rawData.some(d => new Date(d.start_time).getDate() !== start.getDate());
          const width = 500;
          const height = 300;
          const margin = {left:42,right:20,top:40,bottom:30};
          const innerW = width - margin.left - margin.right;
          const innerH = height - margin.top - margin.bottom;
        
          const min = Math.min(...parsed.map(p=>p.cent))*0.95;
          const max = Math.max(...parsed.map(p=>p.cent))*1.05;
        
          const xFor = t => margin.left + ((t - start)/(end-start))*innerW;
          const yFor = v => margin.top + innerH - ((v-min)/(max-min))*innerH;
        
          const svgNS = "http://www.w3.org/2000/svg";
          const svg = document.createElementNS(svgNS,"svg");
          svg.setAttribute("viewBox",`0 0 ${width} ${height}`);
        
          // --- Y- ---
          const style = getComputedStyle(this);
          function hexToRgb(hex) {
            if (!hex) return "255,255,255"; 
            hex = hex.trim();
          
            if (/^#([a-f\d])([a-f\d])([a-f\d])$/i.test(hex)) {
              hex = hex.replace(/^#([a-f\d])([a-f\d])([a-f\d])$/i, "#$1$1$2$2$3$3");
            }
          
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
              ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
              : hex; 
          }
          const color = hexToRgb(style.getPropertyValue("--card-subtle").trim() || "255,255,255");
          const step = Math.round((max-min)/5);
          for(let v=Math.round(min); v<=Math.round(max); v+=step){
            const y = yFor(v);
            const line = document.createElementNS(svgNS,"line");
            line.setAttribute("x1",margin.left);
            line.setAttribute("x2",width-margin.right);
            line.setAttribute("y1",y);
            line.setAttribute("y2",y);
            line.setAttribute("stroke", `rgba(${color}, 0.06)`);
            svg.appendChild(line);
        
            const txt = document.createElementNS(svgNS,"text");
            txt.setAttribute("x",8);
            txt.setAttribute("fill","var(--card-text)");
            txt.setAttribute("y",y+4);
            txt.setAttribute("class","axis-label");
            txt.textContent=Math.round(v);
            svg.appendChild(txt);
          }
        
          // --- X- ---
          const totalHours = Math.ceil((end-start)/3600000);
          for(let h=0; h<=totalHours; h+=(hasTomorrow?4:2)){
            const t = new Date(start.getTime()+h*3600000);
            const x = xFor(t);
            const txt = document.createElementNS(svgNS,"text");
            txt.setAttribute("x",x);
            txt.setAttribute("y",height-6);
            txt.setAttribute("text-anchor","middle");
            txt.setAttribute("class","time-label");
            txt.setAttribute("fill","var(--card-text)");
            txt.textContent=String(t.getHours()).padStart(2,"0");
            svg.appendChild(txt);
          }
        
          // --- Plot  ---
          const pts = parsed.map(p=>({x:xFor(p.time),y:yFor(p.cent),v:p.cent,time:p.time}));
          let d = `M${pts[0].x},${pts[0].y}`;
          for(let i=1;i<pts.length;i++){
            const curr = pts[i];
            d += ` H${curr.x} V${curr.y}`;
          }
        
          // Past faded
          const grad = document.createElementNS(svgNS,"linearGradient");
          grad.setAttribute("id","lineGradient");
          grad.setAttribute("gradientUnits","userSpaceOnUse");
          grad.setAttribute("x1",margin.left);
          grad.setAttribute("x2",width-margin.right);
        
          grad.innerHTML = pts.map(p=>{
            const offset = ((p.x-margin.left)/innerW)*100;
            const color = p.v > average ? "var(--orange)" : "var(--turquoise)";
            const past = p.time < now ? 0.25 : 1;
            return `<stop offset="${offset}%" stop-color="${color}" stop-opacity="${past}" />`;
          }).join("");
          svg.prepend(grad);
        
          const path = document.createElementNS(svgNS,"path");
          path.setAttribute("d",d);
          path.setAttribute("fill","none");
          path.setAttribute("stroke","url(#lineGradient)");
          path.setAttribute("stroke-width","2.6");
          svg.appendChild(path);
        
          // average line
          const yAvg = yFor(average);
          const avgLine = document.createElementNS(svgNS,"line");
          avgLine.setAttribute("x1",margin.left);
          avgLine.setAttribute("x2",width-margin.right);
          avgLine.setAttribute("y1",yAvg);
          avgLine.setAttribute("y2",yAvg);
          avgLine.setAttribute("stroke",`rgba(${color}, 0.25)`);
          avgLine.setAttribute("stroke-dasharray","4 3");
          svg.appendChild(avgLine);
        
          
        // Midnight
        let midnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()+1);
        const xMid = xFor(midnight);
        const vLine = document.createElementNS(svgNS,"line");
        vLine.setAttribute("x1",xMid);
        vLine.setAttribute("x2",xMid);
        vLine.setAttribute("y1",margin.top);
        vLine.setAttribute("y2",height-margin.bottom);
        vLine.setAttribute("stroke",`rgba(${color}, 0.2)`);
        vLine.setAttribute("stroke-width","1.2");
        svg.appendChild(vLine);
        
       // now line
        const xNowTime = xFor(new Date(data[currentIndex].start_time));
        const vLine2 = document.createElementNS(svgNS,"line");
        vLine2.setAttribute("x1",xNowTime);
        vLine2.setAttribute("x2",xNowTime);
        vLine2.setAttribute("y1",margin.top);
        vLine2.setAttribute("y2",height-margin.bottom);
        vLine2.setAttribute("stroke",`rgba(${color}, 0.2)`);
        vLine2.setAttribute("stroke-width","1.2");
        vLine2.setAttribute("stroke-dasharray","3 3"); 
        svg.appendChild(vLine2);
        
        // labels today, tomorrow , yesterday
        const yLabel = margin.top - 6;
        if(hasTomorrow){
          const leftLabel = document.createElementNS(svgNS,"text");
          leftLabel.setAttribute("x", xMid - innerW/4);
          leftLabel.setAttribute("y", yLabel);
          leftLabel.setAttribute("fill","var(--card-text)");
          leftLabel.setAttribute("font-size","12px");
          leftLabel.setAttribute("font-weight","600");
          leftLabel.setAttribute("text-anchor","middle");
          leftLabel.textContent= (now >= new Date(data[data.length/2].start_time))?localize("editor_start_yesterday", lang):localize("editor_start_today", lang);
          svg.appendChild(leftLabel);
        
          const rightLabel = document.createElementNS(svgNS,"text");
          rightLabel.setAttribute("x", xMid + innerW/4);
          rightLabel.setAttribute("y", yLabel);
          rightLabel.setAttribute("fill","var(--card-text)");
          rightLabel.setAttribute("font-size","12px");
          rightLabel.setAttribute("font-weight","600");
          rightLabel.setAttribute("text-anchor","middle");
          rightLabel.textContent=(now >= new Date(data[data.length/2].start_time))?localize("editor_start_today", lang):localize("editor_start_tomorrow", lang);
          svg.appendChild(rightLabel);
        } else {
          const todayLabel = document.createElementNS(svgNS,"text");
          todayLabel.setAttribute("x", margin.left + innerW/2);
          todayLabel.setAttribute("y", yLabel);
          todayLabel.setAttribute("fill","var(--card-text)");
          todayLabel.setAttribute("font-size","12px");
          todayLabel.setAttribute("font-weight","600");
          todayLabel.setAttribute("text-anchor","middle");
          todayLabel.textContent= (start.getDate() === now.getDate()-1)?localize("editor_start_yesterday",lang):localize("editor_start_today", lang);
          svg.appendChild(todayLabel);
        }
         if (now >= start && now <= end) {

            const cx = xFor(new Date(data[currentIndex].start_time))
            const cy = yFor(data[currentIndex].price_per_kwh*100)
  
            const color = (data[currentIndex].price_per_kwh*100) > average ? "--orange" : "--turquoise";
            const circle = document.createElementNS(svgNS,"circle");
            circle.setAttribute("cx",cx);
            circle.setAttribute("cy",cy);
            circle.setAttribute("r",8);
            circle.setAttribute("fill",`rgba(${hexToRgb(style.getPropertyValue(color).trim() || "255,255,255")}, 0.4`);
            svg.appendChild(circle);
            
             const circle2 = document.createElementNS(svgNS,"circle");
            circle2.setAttribute("cx",cx);
            circle2.setAttribute("cy",cy);
            circle2.setAttribute("r",4);
            circle2.setAttribute("fill","#ffffff");
            svg.appendChild(circle2);
            
            const circle3 = document.createElementNS(svgNS,"circle");
            circle3.setAttribute("cx",cx);
            circle3.setAttribute("cy",cy);
            circle3.setAttribute("r",2);
            circle3.setAttribute("fill", `var(${color})`);
            svg.appendChild(circle3);
            
          }
           
         function markMinMax(svg, points, dayStart, dayEnd) {
            const dayPoints = points.filter(p => p.time >= dayStart && p.time < dayEnd);
            if(dayPoints.length === 0) return;
        
            const minP = dayPoints.reduce((a,b)=>a.v<b.v?a:b);
            const maxP = dayPoints.reduce((a,b)=>a.v>b.v?a:b);
        
            [minP, maxP].forEach(p=>{
              const color = p.v > average ? "var(--orange)" : "var(--turquoise)";
        
              const circle = document.createElementNS(svgNS,"circle");
              circle.setAttribute("cx", p.x);
              circle.setAttribute("cy", p.y);
              circle.setAttribute("r", 5);
              circle.setAttribute("fill", color);
              circle.setAttribute("opacity","0.85");
              svg.appendChild(circle);
        
              const text = document.createElementNS(svgNS,"text");
              text.setAttribute("x", p.x);
              text.setAttribute("y", p.y - 10);
              text.setAttribute("text-anchor","middle");
              text.setAttribute("fill","var(--card-text)");
              text.setAttribute("font-size","13px");
              text.setAttribute("font-weight","600");
              text.textContent = p.v.toFixed(1);
              svg.appendChild(text);
            });
          }

            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);
            
            const tomorrowStart = new Date(todayEnd);
            const tomorrowEnd = new Date(tomorrowStart);
            tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
        
            markMinMax(svg, pts, todayStart, todayEnd);
            markMinMax(svg, pts, tomorrowStart, tomorrowEnd);

          return svg;
        
    }
    
    //CHART
    _renderChart(data, currentIndex, avg, lang){
        const circleColor = data[currentIndex].price_per_kwh > avg ? "var(--orange)" : "var(--turquoise)";
         return html`
                <div>
                    <h3 style="margin: 0px">${localize("label_average_price", lang)}: <span id="avgText">${avg*100} ${this._getCurrency(lang).name}</span></h3>
                    <h5 style="margin: 0px; color:${circleColor}">${localize("label_price", lang)}: <span>${(data[currentIndex].price_per_kwh*100).toFixed(1)} ${this._getCurrency(lang).name} (${this._getDataTimeLabel(data, currentIndex)})</span></h5>
                </div>
                ${this._generateChart(data, currentIndex, avg*100, lang)}
                ${this.config.slider ? this._renderSlider(data, currentIndex) : ""}
          `
        ;
    }

     // ---------------------
     // RENDER
     // ---------------------
    render() {
        if (!this._hass) return html``;
        const lang = this._lang;
        this._applyTheme();

        const entity = this._hass.states[this.config.price];

        //read average parameter
        let avg = undefined;
        const avgTemp = this.config.average;
        if (avgTemp && this._hass.states[avgTemp]) {
          avg = parseFloat(this._hass.states[avgTemp].state);
        } else if (!isNaN(parseFloat(avgTemp))) {
          avg = parseFloat(avgTemp);
        }

        // no data attribute
        if (!entity || !entity.attributes?.data) {
            return html`<ha-card>${this._renderNoAttributes(lang)}</ha-card>`;
        }

        let offset = (this.config.view === "graph")?2:this._dayOffset;
        const data = this._getDataForOffset(entity, offset);
        //calculate average
        if (avg === undefined) {
          avg = this._calculateAveragePrice(data);
        }
        
        // no data
        if (!data.length) {
            return html`<ha-card>${this._renderNoData(lang)}</ha-card>`;
        }
        // no price per kwh attribute or wrong format
        if (!this._hasPriceData(data)) {
            return html`<ha-card>${this._renderNoPrices(lang)}</ha-card>`;
        }
        
        const currentIndex = this.config.slider
            ? (typeof this.selectedIndex === "number" ? this.selectedIndex : this._getCurrentDataIndex(data, new Date()))
            : this._getCurrentDataIndex(data, new Date());

        let cardContent;
        switch (this.config.view){
            case "timeline":
                cardContent = this._renderTimeline(data, currentIndex, avg, lang);
                break;
            case "circle":
                cardContent= this._renderCircle(data, currentIndex, avg, lang);
                break;
            case "graph":
                cardContent = this._renderChart(data, currentIndex, avg, lang);
                break;
            default:
                cardContent = this._renderTimeline(data, currentIndex, avg, lang);
        }

        return html`
            <ha-card>
                <div>
                    ${cardContent}
                </div>
            </ha-card>
         `;
    }

    static getConfigElement() {
        return document.createElement("price-timeline-card-editor");
    }
}

customElements.define("price-timeline-card", PriceTimelineCard);

// ---------------------
// EDITOR
// ---------------------
class PriceTimelineEditor extends LitElement {
    static get properties() {
        return {
            _config: { type: Object },
            hass: { type: Object },
        };
    }

    setConfig(config) {
        this._config = {
            price: "",
            view: "timeline",
            theme: "light",
            slider: false,
            day_switch: true,
            ...config,
        };
    }
    set hass(hass) {
        this._hass = hass;
    }

    
    _valueChanged(ev) {
       if (!this._config || !this._hass) return;
       const newData = ev.detail.value;
       const newConfig = { ...this._config, ...newData };
       newConfig.view = newData.view_mode;
       delete newConfig.view_mode; 

       this._config = newConfig;

       this.dispatchEvent(
         new CustomEvent("config-changed", {
           detail: { config: this._config },
           bubbles: true,
           composed: true,
         })
       );
    }
    
    
    render() {
      if (!this._config) return html``;
      const lang = this._hass?.language || "en";
    
      let mode = this._config.view;
    
     const schema = [
        { name: "price", selector: { entity: { domain: "sensor" } } },
        { name: "average", selector: { number: { min: 0, max: 2, step: 0.001, mode: "box" } } },
        {
          name: "view_mode",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "timeline", label: "Timeline" },
                { value: "circle", label: "Circle" },
                { value: "graph", label: "Graph" },
              ],
            },
          },
        },
        { name: "slider", selector: { boolean: {} } },
      ];
    
      if(mode === "circle" || mode ==="timeline"){
          schema.push(
           { name: "day_switch", selector: { boolean: {} } },
           {
              name: "start_view",
              selector: {
                select: {
                  options: [
                    { value: "today", label: localize("editor_start_today", lang) },
                    { value: "tomorrow", label: localize("editor_start_tomorrow", lang) },
                  ],
                },
              },
         },
                
         );
      }
    
      schema.push(
        {
          name: "theme",
          selector: {
            select: {
              options: [
                { value: "light", label: localize("editor_theme_light", lang) },
                { value: "dark", label: localize("editor_theme_dark", lang) },
                { value: "theme", label: localize("editor_theme_system", lang) },
              ],
            },
          },
        },
        {
          name: "currency",
          selector: {
            object: {
              properties: {
                name: { selector: { text: {} } },
                symbol: { selector: { text: {} } },
              },
            },
          },
        }
      );
    
      const data = {
        ...this._config,
        view_mode: mode, 
        currency: {
            name: this._config?.currency?.name || "",
            symbol: this._config?.currency?.symbol || "",
         },
      };
    
      return html`
        <ha-form
          .hass=${this._hass}
          .data=${data}
          .schema=${schema}
          .computeLabel=${this._computeLabel.bind(this)}
          .computeHelper=${this._computeHelper.bind(this)}
          @value-changed=${this._valueChanged}
        ></ha-form>
      `;
    }


    _computeLabel(schemaEntry) {
      const lang = this._hass?.language || "en";
      const key = schemaEntry.name;
      const text = localize(`editor_${key}_label`, lang);
    
      if (!text || text.startsWith("editor_")) {
        return key.charAt(0).toUpperCase() + key.slice(1);
      }
      return text;
    }

    _computeHelper(schemaEntry) {
      const lang = this._hass?.language || "en";
      const key = schemaEntry.name;
      const text = localize(`editor_${key}_desc`, lang);
    
      if (!text || text.startsWith("editor_")) return "";
      return text;
    }

}

customElements.define("price-timeline-card-editor", PriceTimelineEditor);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "price-timeline-card",
    name: "HA Price Timeline Card",
    preview: false,
    description: "Card that visualizes hourly or quarter-hourly energy prices on a timeline, circle or graph",
});