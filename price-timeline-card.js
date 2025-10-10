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
        this._dayOffset = 0; // 0 = today, 1 = tomorrow
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
        this.addEventListener('dblclick', () => {
            this._dayOffset = this._dayOffset === 0 ? 1 : 0;
            this.requestUpdate();
        });
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
        if (offset === -1){
            return allData;
        }
        const date = new Date();
        date.setDate(date.getDate() + offset);
        return allData.filter(item => {
            const start = new Date(item.start_time);
            return start.getFullYear() === date.getFullYear() &&
                   start.getMonth() === date.getMonth() &&
                   start.getDate() === date.getDate();
        });
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
          return Math.round(centValue * 10) / 10; // auf 1 Nachkommastelle
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
            ${this.config.slider ? html`
                <div class="slider-container">
                    <input type="range" min="0" max="${data.length - 1}" .value="${currentIndex}" @input="${this._onSliderChange}" />
                </div>` : ""}
        `;
    }


     //TIMELINE
    _renderTimeline(data, currentIndex, avg, lang) {
        const now = new Date();
        const slotMinutes = data.length > 1 ? Math.round((new Date(data[1].start_time) - new Date(data[0].start_time)) / 60000) : 60;
        const minutes = now.getMinutes();
        const progress = slotMinutes === 60 ? (minutes / slotMinutes) : ((minutes % slotMinutes) / 15);
        let formattedPriceTL;
        if (this._dayOffset === 0) {
          const currentPrice = data[currentIndex].price_per_kwh;
          formattedPriceTL = ((currentPrice * 100).toFixed(1))
            .replace('.', ',')
            .replace(/,0$/, '');
        } else {
          const { min, max } = this._getPriceRange(data);
          const format = (value) =>
            ((value * 100).toFixed(1))
              .replace('.', ',')
              .replace(/,0$/, '');
          formattedPriceTL = `${format(min)} - ${format(max)}`;
        }

        let timeLabel = this._getDataTimeLabel(data, currentIndex);
        if (this._dayOffset !== 0) {
          timeLabel = localize("label_time_nextDay", this._hass.language);
        }

        return html`
            <div class="header">
                <div class="header-left">
                    <div class="time">${timeLabel}</div>
                    <div class="price">
                        <span class="value">${formattedPriceTL}</span>
                        <span class="unit">${this._getCurrency(lang).name}</span>
                    </div>
                </div>
                <div class="label">${this._dayOffset === 0 ? localize("label_today_price", lang) : localize("label_tomorrow_price", lang)}</div>
            </div>
            <div class="timeline">
                ${data.map((d, i) => {
                    const color = this._roundCent(d.price_per_kwh) > avg ? "var(--orange)" : "var(--turquoise)";
                    const faded = i < currentIndex ? "faded" : "";
                    //for next day (dayOffset!=0), disable marker
                    const marker = (i === currentIndex && this._dayOffset === 0) ? "marker" : "";
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
        `;
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
        let offset = (this._dayOffset===2)?-1:this._dayOffset;
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

        const cardContent = this.config.timeline === false
        ? this._renderCircle(data, currentIndex, avg, lang)
        : this._renderTimeline(data, currentIndex, avg, lang);
        
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
            timeline: true,
            theme: "light",
            slider: false,
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
     
       switch (newData.view_mode) {
         case "timeline":
           newConfig.timeline = true;
           newConfig.slider = false;
           break;
         case "circle":
           newConfig.timeline = false;
           newConfig.slider = false;
           break;
         case "circle_slider":
           newConfig.timeline = false;
           newConfig.slider = true;
           break;
       }
     
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
    
      let mode = "timeline";
      if (this._config.timeline === false && this._config.slider) mode = "circle_slider";
      else if (this._config.timeline === false) mode = "circle";
    
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
                { value: "circle_slider", label: "Circle + Slider" },
              ],
            },
          },
        },
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
                }
              }
            }
      },
      ];
    
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
    description: "Card that visualizes hourly or quarter-hourly energy prices on a timeline or circle",
});