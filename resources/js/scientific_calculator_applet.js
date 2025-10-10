import { jQuery } from "./jquery_setup.js";

import "jquery-ui/themes/base/core.css";
import "jquery-ui/themes/base/theme.css";
import "jquery-ui/themes/base/button.css";
import "jquery-ui/themes/base/dialog.css";
import "jquery-ui/themes/base/draggable.css";
import "jquery-ui/ui/data";
import "jquery-ui/ui/version";
import "jquery-ui/ui/keycode";
import "jquery-ui/ui/scroll-parent";
import "jquery-ui/ui/focusable";
import "jquery-ui/ui/tabbable";
import "jquery-ui/ui/plugin";
import "jquery-ui/ui/unique-id";
import "jquery-ui/ui/disable-selection";
import "jquery-ui/ui/widget";
import "jquery-ui/ui/widgets/mouse";
import "jquery-ui/ui/widgets/draggable";
import "jquery-ui/ui/widgets/resizable";
import "jquery-ui/ui/widgets/button";
import "jquery-ui/ui/widgets/dialog";

// Cargar Math.js desde CDN
const loadMathJS = () => {
  return new Promise((resolve, reject) => {
    if (window.math) {
      resolve(window.math);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.11.0/math.min.js';
    script.onload = () => resolve(window.math);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default () => ({
  open: false,
  currentMode: 'calculator',
  display: '0',
  memory: 0,
  lastResult: 0,
  converterFrom: 'length',
  converterFromUnit: 'meter',
  converterToUnit: 'kilometer',
  converterValue: '',
  mathLib: null,

  conversionCategories: {
    length: {
      name: 'Longitud',
      units: {
        meter: { name: 'Metros', factor: 1 },
        kilometer: { name: 'Kilómetros', factor: 0.001 },
        centimeter: { name: 'Centímetros', factor: 100 },
        millimeter: { name: 'Milímetros', factor: 1000 },
        mile: { name: 'Millas', factor: 0.000621371 },
        yard: { name: 'Yardas', factor: 1.09361 },
        foot: { name: 'Pies', factor: 3.28084 },
        inch: { name: 'Pulgadas', factor: 39.3701 }
      }
    },
    weight: {
      name: 'Peso',
      units: {
        kilogram: { name: 'Kilogramos', factor: 1 },
        gram: { name: 'Gramos', factor: 1000 },
        milligram: { name: 'Miligramos', factor: 1000000 },
        ton: { name: 'Toneladas', factor: 0.001 },
        pound: { name: 'Libras', factor: 2.20462 },
        ounce: { name: 'Onzas', factor: 35.274 }
      }
    },
    temperature: {
      name: 'Temperatura',
      units: {
        celsius: { name: 'Celsius', factor: null },
        fahrenheit: { name: 'Fahrenheit', factor: null },
        kelvin: { name: 'Kelvin', factor: null }
      }
    },
    area: {
      name: 'Área',
      units: {
        squareMeter: { name: 'Metros²', factor: 1 },
        squareKilometer: { name: 'Kilómetros²', factor: 0.000001 },
        squareCentimeter: { name: 'Centímetros²', factor: 10000 },
        hectare: { name: 'Hectáreas', factor: 0.0001 },
        acre: { name: 'Acres', factor: 0.000247105 },
        squareFoot: { name: 'Pies²', factor: 10.7639 }
      }
    },
    volume: {
      name: 'Volumen',
      units: {
        liter: { name: 'Litros', factor: 1 },
        milliliter: { name: 'Mililitros', factor: 1000 },
        cubicMeter: { name: 'Metros³', factor: 0.001 },
        gallon: { name: 'Galones (US)', factor: 0.264172 },
        quart: { name: 'Cuartos', factor: 1.05669 },
        pint: { name: 'Pintas', factor: 2.11338 },
        cup: { name: 'Tazas', factor: 4.22675 },
        fluidOunce: { name: 'Onzas fluidas', factor: 33.814 }
      }
    },
    time: {
      name: 'Tiempo',
      units: {
        second: { name: 'Segundos', factor: 1 },
        minute: { name: 'Minutos', factor: 0.0166667 },
        hour: { name: 'Horas', factor: 0.000277778 },
        day: { name: 'Días', factor: 0.0000115741 },
        week: { name: 'Semanas', factor: 0.00000165344 },
        month: { name: 'Meses', factor: 3.80517e-7 },
        year: { name: 'Años', factor: 3.17098e-8 }
      }
    },
    speed: {
      name: 'Velocidad',
      units: {
        meterPerSecond: { name: 'm/s', factor: 1 },
        kilometerPerHour: { name: 'km/h', factor: 3.6 },
        milePerHour: { name: 'mph', factor: 2.23694 },
        knot: { name: 'Nudos', factor: 1.94384 },
        footPerSecond: { name: 'ft/s', factor: 3.28084 }
      }
    },
    pressure: {
      name: 'Presión',
      units: {
        pascal: { name: 'Pascales', factor: 1 },
        kilopascal: { name: 'Kilopascales', factor: 0.001 },
        bar: { name: 'Bares', factor: 0.00001 },
        psi: { name: 'PSI', factor: 0.000145038 },
        atmosphere: { name: 'Atmósferas', factor: 0.00000986923 }
      }
    },
    energy: {
      name: 'Energía',
      units: {
        joule: { name: 'Julios', factor: 1 },
        kilojoule: { name: 'Kilojulios', factor: 0.001 },
        calorie: { name: 'Calorías', factor: 0.239006 },
        kilocalorie: { name: 'Kilocalorías', factor: 0.000239006 },
        wattHour: { name: 'Vatios-hora', factor: 0.000277778 },
        kilowattHour: { name: 'Kilovatios-hora', factor: 2.77778e-7 }
      }
    },
    power: {
      name: 'Potencia',
      units: {
        watt: { name: 'Vatios', factor: 1 },
        kilowatt: { name: 'Kilovatios', factor: 0.001 },
        horsepower: { name: 'Caballos de fuerza', factor: 0.00134102 }
      }
    }
  },

  async initComponent(dialog_elem) {
    this.dialog_elem = dialog_elem;

    // Cargar Math.js
    try {
      this.mathLib = await loadMathJS();
      console.log('Math.js cargado correctamente');
    } catch (error) {
      console.error('Error cargando Math.js:', error);
      alert('Error al cargar la biblioteca matemática');
      return;
    }

    // Inicializar diálogo
    $(dialog_elem).dialog({
      width: 350,
      height: 620,
      minHeight: 480,
      minWidth: 320,
      maxHeight: 650,
      maxWidth: 400,
      autoOpen: false,
      resizable: false,
      draggable: true,
      position: { my: "center", at: "center", of: window },
      title: "Calculadora Científica"
    });

    this.renderCalculator();

    const boundCheckWindowSize = this.checkWindowSize.bind(this);
    window.addEventListener("resize", boundCheckWindowSize);

    // Guardar la referencia para poder removerla después
    this._resizeHandler = boundCheckWindowSize;
  },

  renderCalculator() {
    const content = `
      <div class="calc-container" style="font-family: 'Segoe UI', Tahoma, sans-serif; background: #f0f0f0; padding: 10px; height: 100%; box-sizing: border-box; overflow: hidden;">
        <!-- Mode Tabs -->
        <div class="mode-tabs" style="display: flex; margin-bottom: 10px; border-bottom: 2px solid #ccc;">
          <button class="calc-tab-btn" data-mode="calculator" style="flex: 1; padding: 8px; background: ${this.currentMode === 'calculator' ? '#fff' : '#e0e0e0'}; border: none; cursor: pointer; font-weight: ${this.currentMode === 'calculator' ? 'bold' : 'normal'}; transition: all 0.3s;">
            Calculadora
          </button>
          <button class="calc-tab-btn" data-mode="converter" style="flex: 1; padding: 8px; background: ${this.currentMode === 'converter' ? '#fff' : '#e0e0e0'}; border: none; cursor: pointer; font-weight: ${this.currentMode === 'converter' ? 'bold' : 'normal'}; transition: all 0.3s;">
            Convertidor
          </button>
        </div>

        <!-- Calculator Mode -->
        <div id="calculator-mode" style="display: ${this.currentMode === 'calculator' ? 'block' : 'none'};">
          <div class="calc-display" style="background: #fff; padding: 15px; margin-bottom: 10px; text-align: right; font-size: 24px; border: 1px solid #ccc; min-height: 40px; word-wrap: break-word; overflow-wrap: break-word; max-height: 60px; overflow-y: auto;">
            ${this.display}
          </div>
          
          <div class="calc-buttons" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
            <!-- Memory buttons -->
            <button class="calc-btn mem-btn" data-action="mc" style="padding: 10px; font-size: 11px; background: #e8e8e8; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">MC</button>
            <button class="calc-btn mem-btn" data-action="mr" style="padding: 10px; font-size: 11px; background: #e8e8e8; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">MR</button>
            <button class="calc-btn mem-btn" data-action="m+" style="padding: 10px; font-size: 11px; background: #e8e8e8; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">M+</button>
            <button class="calc-btn mem-btn" data-action="m-" style="padding: 10px; font-size: 11px; background: #e8e8e8; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">M-</button>
            
            <!-- Scientific functions row 1 -->
            <button class="calc-btn func-btn" data-func="sin" style="padding: 10px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">sin</button>
            <button class="calc-btn func-btn" data-func="cos" style="padding: 10px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">cos</button>
            <button class="calc-btn func-btn" data-func="tan" style="padding: 10px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">tan</button>
            <button class="calc-btn func-btn" data-func="sqrt" style="padding: 10px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">√</button>
            
            <!-- Scientific functions row 2 -->
            <button class="calc-btn func-btn" data-func="log" style="padding: 10px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">log</button>
            <button class="calc-btn func-btn" data-func="ln" style="padding: 10px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">ln</button>
            <button class="calc-btn func-btn" data-func="^" style="padding: 10px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">x²</button>
            <button class="calc-btn func-btn" data-func="pi" style="padding: 10px; font-size: 11px; background: #f5f5f5; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">π</button>
            
            <!-- Clear buttons -->
            <button class="calc-btn" data-action="clear" style="padding: 12px; font-size: 14px; background: #ff6b6b; color: white; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">C</button>
            <button class="calc-btn" data-action="backspace" style="padding: 12px; font-size: 14px; background: #ffa500; color: white; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">⌫</button>
            <button class="calc-btn" data-num="(" style="padding: 12px; font-size: 14px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">(</button>
            <button class="calc-btn" data-num=")" style="padding: 12px; font-size: 14px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">)</button>
            
            <!-- Number pad -->
            <button class="calc-btn" data-num="7" style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">7</button>
            <button class="calc-btn" data-num="8" style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">8</button>
            <button class="calc-btn" data-num="9" style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">9</button>
            <button class="calc-btn op-btn" data-op="/" style="padding: 14px; font-size: 16px; background: #e0e0e0; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">÷</button>
            
            <button class="calc-btn" data-num="4" style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">4</button>
            <button class="calc-btn" data-num="5" style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">5</button>
            <button class="calc-btn" data-num="6" style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">6</button>
            <button class="calc-btn op-btn" data-op="*" style="padding: 14px; font-size: 16px; background: #e0e0e0; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">×</button>
            
            <button class="calc-btn" data-num="1" style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">1</button>
            <button class="calc-btn" data-num="2" style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">2</button>
            <button class="calc-btn" data-num="3" style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">3</button>
            <button class="calc-btn op-btn" data-op="-" style="padding: 14px; font-size: 16px; background: #e0e0e0; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">−</button>
            
            <button class="calc-btn" data-num="0" style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">0</button>
            <button class="calc-btn" data-num="." style="padding: 14px; font-size: 16px; background: #fff; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">.</button>
            <button class="calc-btn" data-action="equals" style="padding: 14px; font-size: 16px; background: #4CAF50; color: white; border: 1px solid #000000ff; cursor: pointer; transition: background 0.2s;">=</button>
            <button class="calc-btn op-btn" data-op="+" style="padding: 14px; font-size: 16px; background: #e0e0e0; border: 1px solid #ccc; cursor: pointer; transition: background 0.2s;">+</button>
          </div>
        </div>

        <!-- Converter Mode -->
        <div id="converter-mode" style="display: ${this.currentMode === 'converter' ? 'block' : 'none'}; max-height: 450px; overflow-y: auto;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px;">Categoría:</label>
            <select class="conv-category" style="width: 100%; padding: 8px; font-size: 14px; border: 1px solid #ccc; border-radius: 4px;">
              ${Object.keys(this.conversionCategories).map(key =>
      `<option value="${key}" ${this.converterFrom === key ? 'selected' : ''}>${this.conversionCategories[key].name}</option>`
    ).join('')}
            </select>
          </div>

          <div style="background: #fff; padding: 15px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">De:</label>
            <select class="conv-from-unit" style="width: 100%; padding: 6px; font-size: 13px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px;">
              ${this.getUnitOptions()}
            </select>
            <input class="conv-from-value" type="number" value="${this.converterValue}" placeholder="0" style="width: 100%; padding: 10px; font-size: 18px; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;">
          </div>

          <div style="background: #fff; padding: 15px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">A:</label>
            <select class="conv-to-unit" style="width: 100%; padding: 6px; font-size: 13px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px;">
              ${this.getUnitOptions()}
            </select>
            <div class="conv-result" style="width: 100%; padding: 10px; font-size: 18px; background: #f9f9f9; border: 1px solid #ccc; min-height: 20px; border-radius: 4px; font-weight: bold; color: #2c3e50;">
              ${this.calculateConversion()}
            </div>
          </div>
        </div>
      </div>
    `;

    $(this.dialog_elem).html(content);
    this.attachEventListeners();
  },

  getUnitOptions() {
    const category = this.conversionCategories[this.converterFrom];
    return Object.keys(category.units).map(key =>
      `<option value="${key}">${category.units[key].name}</option>`
    ).join('');
  },

  calculateConversion() {
    if (!this.converterValue || this.converterValue === '') return '0';

    const value = parseFloat(this.converterValue);
    if (isNaN(value)) return '0';

    const category = this.conversionCategories[this.converterFrom];
    const fromUnit = $(this.dialog_elem).find('.conv-from-unit').val() || this.converterFromUnit;
    const toUnit = $(this.dialog_elem).find('.conv-to-unit').val() || this.converterToUnit;

    if (this.converterFrom === 'temperature') {
      return this.convertTemperature(value, fromUnit, toUnit);
    }

    const baseValue = value / category.units[fromUnit].factor;
    const result = baseValue * category.units[toUnit].factor;

    return this.formatNumber(result);
  },

  convertTemperature(value, from, to) {
    let celsius;

    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * 5 / 9;
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
    }

    let result;
    switch (to) {
      case 'celsius':
        result = celsius;
        break;
      case 'fahrenheit':
        result = celsius * 9 / 5 + 32;
        break;
      case 'kelvin':
        result = celsius + 273.15;
        break;
    }

    return this.formatNumber(result);
  },

  formatNumber(num) {
    if (Math.abs(num) < 0.000001 && num !== 0) {
      return num.toExponential(6);
    }
    if (Math.abs(num) > 1000000) {
      return num.toExponential(6);
    }
    return parseFloat(num.toFixed(10)).toString();
  },

  attachEventListeners() {
    const self = this;

    // Hover effects
    $(this.dialog_elem).find('.calc-btn').hover(
      function () { $(this).css('background', $(this).css('background-color').replace('rgb', 'rgba').replace(')', ', 0.8)')); },
      function () { $(this).css('background', ''); }
    );

    // Tab switching
    $(this.dialog_elem).find('.calc-tab-btn').on('click', function () {
      self.currentMode = $(this).data('mode');
      self.renderCalculator();
    });

    // Calculator buttons
    $(this.dialog_elem).find('.calc-btn[data-num]').on('click', function () {
      const num = $(this).data('num');
      if (self.display === '0' && num !== '.') {
        self.display = num.toString();
      } else {
        self.display += num;
      }
      self.updateDisplay();
    });

    $(this.dialog_elem).find('.calc-btn[data-op]').on('click', function () {
      const op = $(this).data('op');
      self.display += op;
      self.updateDisplay();
    });

    $(this.dialog_elem).find('.calc-btn[data-action="clear"]').on('click', function () {
      self.display = '0';
      self.updateDisplay();
    });

    $(this.dialog_elem).find('.calc-btn[data-action="backspace"]').on('click', function () {
      self.display = self.display.slice(0, -1) || '0';
      self.updateDisplay();
    });

    $(this.dialog_elem).find('.calc-btn[data-action="equals"]').on('click', function () {
      self.calculate();
    });

    // Scientific functions
    $(this.dialog_elem).find('.calc-btn[data-func]').on('click', function () {
      const func = $(this).data('func');
      self.applyFunction(func);
    });

    // Memory buttons
    $(this.dialog_elem).find('.calc-btn[data-action="mc"]').on('click', function () {
      self.memory = 0;
    });

    $(this.dialog_elem).find('.calc-btn[data-action="mr"]').on('click', function () {
      self.display = self.memory.toString();
      self.updateDisplay();
    });

    $(this.dialog_elem).find('.calc-btn[data-action="m+"]').on('click', function () {
      const current = parseFloat(self.display) || 0;
      self.memory += current;
    });

    $(this.dialog_elem).find('.calc-btn[data-action="m-"]').on('click', function () {
      const current = parseFloat(self.display) || 0;
      self.memory -= current;
    });

    // Converter events
    $(this.dialog_elem).find('.conv-category').on('change', function () {
      self.converterFrom = $(this).val();
      self.converterFromUnit = Object.keys(self.conversionCategories[self.converterFrom].units)[0];
      self.converterToUnit = Object.keys(self.conversionCategories[self.converterFrom].units)[1] || self.converterFromUnit;
      self.renderCalculator();
    });

    $(this.dialog_elem).find('.conv-from-value').on('input', function () {
      self.converterValue = $(this).val();
      $(self.dialog_elem).find('.conv-result').text(self.calculateConversion());
    });

    $(this.dialog_elem).find('.conv-from-unit, .conv-to-unit').on('change', function () {
      $(self.dialog_elem).find('.conv-result').text(self.calculateConversion());
    });
  },

  applyFunction(func) {
    if (!this.mathLib) {
      alert('Biblioteca matemática no cargada');
      return;
    }

    try {
      const value = parseFloat(this.display);
      if (isNaN(value)) return;

      let result;
      switch (func) {
        case 'sin':
          result = this.mathLib.sin(value);
          break;
        case 'cos':
          result = this.mathLib.cos(value);
          break;
        case 'tan':
          result = this.mathLib.tan(value);
          break;
        case 'sqrt':
          result = this.mathLib.sqrt(value);
          break;
        case 'log':
          result = this.mathLib.log10(value);
          break;
        case 'ln':
          result = this.mathLib.log(value);
          break;
        case '^':
          result = this.mathLib.pow(value, 2);
          break;
        case 'pi':
          this.display = this.mathLib.pi.toString();
          this.updateDisplay();
          return;
      }

      this.display = this.formatNumber(result);
      this.updateDisplay();
    } catch (e) {
      this.display = 'Error';
      this.updateDisplay();
    }
  },

  calculate() {
    if (!this.mathLib) {
      alert('Biblioteca matemática no cargada');
      return;
    }

    try {
      let expression = this.display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

      const result = this.mathLib.evaluate(expression);
      this.lastResult = result;
      this.display = this.formatNumber(result);
      this.updateDisplay();
    } catch (e) {
      this.display = 'Error';
      this.updateDisplay();
    }
  },

  updateDisplay() {
    $(this.dialog_elem).find('.calc-display').text(this.display);
  },

  checkWindowSize() {
    if (!$(dialog_elem).dialog("isOpen")) {
      return;
    }
    if (
      window.innerWidth <
      $(dialog_elem).dialog("option", "width") + $(dialog_elem).parent().offset()["left"] + dialogMarginH
    ) {
      $(dialog_elem)
        .parent()
        .offset({
          left: window.innerWidth - $(dialog_elem).dialog("option", "width") - dialogMarginH,
        });
    }
    if (window.innerWidth < $(dialog_elem).dialog("option", "width") + dialogMarginH) {
      var targetWidth = Math.max(dialogMinWidth, window.innerWidth);
      $(dialog_elem).parent().offset({ left: 0 });
      $(dialog_elem).dialog("option", {
        width: targetWidth - dialogMarginH,
      });
      window.ggbApplet && ggbApplet.setWidth(targetWidth - dialogPaddingH - dialogMarginH);
    }
    if (
      window.innerHeight <
      $(dialog_elem).dialog("option", "height") + $(dialog_elem).parent().offset()["top"] + dialogMarginV
    ) {
      $(dialog_elem)
        .parent()
        .offset({
          top: window.innerHeight - $(dialog_elem).dialog("option", "height") - dialogMarginV,
        });
    }
    if (window.innerHeight < $(dialog_elem).dialog("option", "height")) {
      var targetHeight = Math.max(dialogMinHeight, window.innerHeight);
      $(dialog_elem).parent().offset({ top: 0 });
      $(dialog_elem).dialog("option", { height: targetHeight });
      window.ggbApplet && ggbApplet.setHeight(targetHeight - dialogPaddingV);
    }
  },

  toggle() {
    if ($(this.dialog_elem).dialog("isOpen")) {
      $(this.dialog_elem).dialog("close");
      //if applet is initialized open it
    } else {
      $(this.dialog_elem).dialog("open");
      if (window.ggbApplet && ggbApplet.newConstruction) {
        ggbApplet.newConstruction();
        this.checkWindowSize();
      } else {
        window.ggbOnInit = this.checkWindowSize;
      }
    }
  },
})