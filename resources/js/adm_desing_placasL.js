import html2canvas from "html2canvas";

import {
  solicitudCargaT1,
  solicitudCargaDT2,
  solicitudCargaDT3,
} from './placasFormaL/solicitudCarga.js';

import {
  formDisplay,
  flexDesignT1X,
  flexDesignT1Y,
  dataTable2x,
  dataTable2y,
} from './placasFormaL/flexDesign.js';

import {
  tableData1,
  tableData1Y,
  tableData2,
  tableData3,
  tableData3Y,
  cutDesignT1X,
  cutDesignT1Y,
} from './placasFormaL/cutDesign.js';

import { diT1X, diT1Y, diagramI } from './placasFormaL/diagramaI.js';
import { vaT1X, vaT1Y } from './placasFormaL/agrietamiento.js';
import { dcpT1X, dcpT1Y } from './placasFormaL/pureCompressionDesign.js';
import { ddT1X /* ddT1Y */ } from './placasFormaL/deslizamiento.js';
import { elT1 } from './placasFormaL/efectoLocal.js';
import { resolve } from "mathjs";

document.addEventListener('DOMContentLoaded', function () {
  var coll = document.getElementsByClassName('collapsible-btn');
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener('click', function () {
      var targetId = this.getAttribute('data-target');
      var content = document.getElementById(targetId);

      if (content) {
        content.classList.toggle('d-none');
      }
    });
  }
  var formDataObject = {};

  var medidaAcero = [
    {
      diametro: 6,
      areaNominal: 0.28,
      diametroCm: 0.6,
      pesoNominal: 0.222,
      pesoMinimo: 0.207,
    },
    {
      diametro: 8,
      areaNominal: 0.5,
      diametroCm: 0.8,
      pesoNominal: 0.395,
      pesoMinimo: 0.371,
    },
    {
      diametro: "ø3/8''",
      areaNominal: 0.71,
      diametroCm: 0.95,
      pesoNominal: 0.56,
      pesoMinimo: 0.526,
    },
    {
      diametro: 12,
      areaNominal: 1.13,
      diametroCm: 1.2,
      pesoNominal: 0.888,
      pesoMinimo: 0.835,
    },
    {
      diametro: "ø1/2''",
      areaNominal: 1.29,
      diametroCm: 1.27,
      pesoNominal: 0.994,
      pesoMinimo: 0.934,
    },
    {
      diametro: "ø5/8''",
      areaNominal: 2.0,
      diametroCm: 1.59,
      pesoNominal: 1.552,
      pesoMinimo: 1.459,
    },
    {
      areaNominal: 2.84,
      diametroCm: 1.9,
      pesoNominal: 2.235,
      pesoMinimo: 2.101,
    },
    {
      diametro: "ø7/8''",
      areaNominal: 3.87,
      diametroCm: 2.22,
    },
    {
      diametro: "ø1''",
      areaNominal: 5.1,
      diametroCm: 2.54,
      pesoNominal: 3.973,
      pesoMinimo: 3.735,
    },
    {
      diametro: "ø1 3/8''",
      areaNominal: 10.06,
      diametroCm: 3.49,
      pesoNominal: 7.907,
      pesoMinimo: 7.433,
    },
  ];

  var factorØ = [
    {
      description: 'Flexión',
      value: 0.9,
    },
    {
      description: 'Flexo - Compresión Normal',
      value: 0.75,
    },
    {
      description: 'Flexo - Compresión en Resorte',
      subDescription: 'Sección en Resorte',
      value: 0.7,
    },
    {
      description: 'Corte',
      value: 0.85,
    },
  ];

  var factorβ = [
    {
      description: '280',
      value: 0.85,
    },
    {
      description: '350',
      value: 0.8,
    },
    {
      description: '420',
      value: 0.75,
    },
    {
      description: '490',
      value: 0.7,
    },
    {
      description: '560',
      value: 0.65,
    },
  ];

  var factorμ = [
    {
      description: '1',
      value: 1,
    },
    {
      description: '2',
      value: 2,
    },
    {
      description: '3',
      value: 3,
    },
    {
      description: '4',
      value: 4,
    },
  ];

  // Solicitaciones de carga contenedor de la tabla 1
  var contenedor1 = document.getElementById('solicitudCargaT1');
  solicitudCargaT1(contenedor1);

  // Unique form to be used for all sheets
  // Form Element, if a input change it will update other inputs related, it create the form and add its functionality
  var exDF = 0.3;
  var eyDF = 0.3;
  var lxDF = 6;
  var lyDF = 6;
  var dxDF = 0.8 * lxDF;
  var dyDF = 0.8 * lyDF;
  var zCxDF = 1.2;
  var zCyDF = 1.2;
  var ezcxDF = 0.3;
  var ezcyDF = 0.3;
  var lnucxDF = lxDF - 2 * zCxDF;
  var lnucyDF = lyDF - 2 * zCyDF;

  var fcDF = 280;
  var fyDF = 4200;
  var generalSelect = 0.9;
  var ecDF = 1500 * Math.sqrt(fcDF);
  var esDF = 2.1 * Math.pow(10, 6);
  var ƐcDF = 0.003;
  var β1DF =
    fcDF <= 280
      ? 0.85
      : fcDF <= 350
        ? 0.8
        : fcDF <= 420
          ? 0.75
          : fcDF <= 490
            ? 0.7
            : 0.65;

  var formDF = `<form id="generalForm" class="mt-2" met   d="post">
    <div class="col-md-12 mx-auto text-center">
      <label class="text-gray-950 dark:text-white" for="generalSelect">Cargar hoja</label>
      <div class="input-group mb-2">
        <select
          name="generalSelect"
          id="generalSelect"
          class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
        >
          <option value="0.9"selected>Flexión</option>
          <option value="0.85">Corte</option>
          <option value="0">Interacción</option>
          <option value="1">Agrietamiento</option>
          <option value="2">Compresión</option>
          <option value="3">Deslizamiento</option>
          <option value="4">Carga Puntual</option>
          <option value="0.75">Flexo - Comprensión Normal</option>
          <option value="0.7">Columna con Estribos</option>
          <option value="0.75">Columna con Espirales</option>
        </select>
      </div>
      <div class="text-gray-950 dark:text-white" id="generalSelectText">Ø ${generalSelect}</div>
    </div>
    <h5 class="text-center text-gray-950 dark:text-white">
      <strong>Propiedades Geométricas</strong
      ><button
        type="button"
        id="toggleButton"
        style="border: none; background: none"
      >
        <i class="fas fa-eye"></i>
      </button>
    </h5>
    <div class="contenedor mb-5" id="contenedor_dcc" style="display: none;">
      <div class="col-md-12 mx-auto text-center">
        <label for="exDF">ex</label>
        <div class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md">
          <input
            type="number"
            name="exDF"
            class="form-control text-center"
            id="exDF"
            placeholder="0.30"
            min="0"
            value="0.3"
            step="any"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="eyDF">ey</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="eyDF"
            class="form-control text-center"
            id="eyDF"
            placeholder="0.30"
            min="0"
            value="0.3"
            step="any"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="lxDF">Lx</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="lxDF"
            class="form-control text-center"
            id="lxDF"
            placeholder="6"
            min="0"
            step="any"
            value="6"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="lyDF">Ly</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="lyDF"
            class="form-control text-center"
            id="lyDF"
            placeholder="6"
            min="0"
            step="any"
            value="6"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="dxDF">dx</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="dxDF"
            class="form-control text-center"
            id="dxDF"
            placeholder="4.8"
            min="0"
            step="any"
            value="4.8"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="dyDF">dy</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="dyDF"
            class="form-control text-center"
            id="dyDF"
            placeholder="4.8"
            min="0"
            step="any"
            value="4.8"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="zcxDF">zCx</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="zcxDF"
            class="form-control text-center"
            id="zcxDF"
            placeholder="1.20"
            min="0"
            step="any"
            value="1.2"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="zCyDF">zCy</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="zCyDF"
            class="form-control text-center"
            id="zCyDF"
            placeholder="1.20"
            min="0"
            step="any"
            value="1.2"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="ezcxDF">ezcx</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="ezcxDF"
            class="form-control text-center"
            id="ezcxDF"
            placeholder="0.30"
            min="0"
            step="any"
            value="0.3"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="ezcyDF">ezcy</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="ezcyDF"
            class="form-control text-center"
            id="ezcyDF"
            placeholder="0.30"
            min="0"
            step="any"
            value="0.3"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="lnucxDF">Lnúcleo x</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="lnucxDF"
            class="form-control text-center"
            id="lnucxDF"
            placeholder="3.60"
            min="0"
            step="any"
            value="3.6"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="lnucyDF">Lnúcleo y</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="lnucyDF"
            class="form-control text-center"
            id="lnucyDF"
            placeholder="3.60"
            min="0"
            step="any"
            value="3.6"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <label for="acwxDC">Acwx</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="acwxDC"
            class="form-control text-center"
            id="acwxDC"
            placeholder="1.44"
            min="0"
            step="any"
            value="1.44"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m²</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <label for="acwyDC">Acwy</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="acwyDC"
            class="form-control text-center"
            id="acwyDC"
            placeholder="1.44"
            min="0"
            step="any"
            value="1.44"
            required
          />
          <div class="input-group-append">
            <span class="input-group-text">m²</span>
          </div>
        </div>
      </div>
    </div>
    <h5 class="text-center text-gray-800 dark:text-gray-200">
      <strong>Propiedades Mecánicas</strong
      ><button
        type="button"
        id="calccargars"
        style="border: none; background: none"
      >
        <i class="fas fa-eye"></i>
      </button>
    </h5>
    <div class="contenedor_cc" id="contenedor_cc" style="display: none;">
      <div class="col-md-12 mx-auto text-center">
        <label for="fcDF">f'c</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="fcDF"
            class="form-control text-center"
            id="fcDF"
            placeholder="280"
            min="0"
            step="any"
            value="280"
          />
          <div class="input-group-append">
            <span class="input-group-text">kg/cm²</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="fyDF">fy</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="fyDF"
            class="form-control text-center"
            id="fyDF"
            placeholder="4200"
            min="0"
            step="any"
            value="4200"
          />
          <div class="input-group-append">
            <span class="input-group-text">kg/cm²</span>
          </div>
        </div>
      </div>
  
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="designDF"
            class="form-control text-center"
            id="designDF"
            min="0"
            step="any"
            value="0.9"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <label for="designDC"></label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="designDC"
            class="form-control text-center"
            id="designDC"
            min="0"
            step="any"
            value="0.85"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="designDFCN"
            class="form-control text-center"
            id="designDFCN"
            min="0"
            step="any"
            value="0.75"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="designDCEst"
            class="form-control text-center"
            id="designDCEst"
            min="0"
            step="any"
            value="0.7"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="designDCEsp"
            class="form-control text-center"
            id="designDCEsp"
            min="0"
            step="any"
            value="0.75"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="designCP"
            class="form-control text-center"
            id="designCP"
            min="0"
            step="any"
            value="0.7"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="agVA"
            class="form-control text-center"
            id="agVA"
            min="0"
            step="any"
            value="2.4"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="lgxVA"
            class="form-control text-center"
            id="lgxVA"
            min="0"
            step="any"
            value="7.2"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center d-none">
        <div class="input-group mb-2">
          <input
            type="number"
            name="lgyVA"
            class="form-control text-center"
            id="lgyVA"
            min="0"
            step="any"
            value="7.2"
          />
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="ecDF">Ec</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="ecDF"
            class="form-control text-center"
            id="ecDF"
            placeholder="${ecDF}"
            min="0"
            step="any"
            value="${ecDF}"
          />
          <div class="input-group-append">
            <span class="input-group-text">kg/cm²</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="esDF">Es</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="esDF"
            class="form-control text-center"
            id="esDF"
            placeholder="${esDF}"
            min="0"
            step="any"
            value="${esDF}"
          />
          <div class="input-group-append">
            <span class="input-group-text">kg/cm²</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="ƐcDF">Ɛc</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="ƐcDF"
            class="form-control text-center"
            id="ƐcDF"
            placeholder="${ƐcDF}"
            min="0"
            step="any"
            value="${ƐcDF}"
          />
          <div class="input-group-append">
            <span class="input-group-text">-</span>
          </div>
        </div>
      </div>
      <div class="col-md-12 mx-auto text-center">
        <label for="β1DF">β1</label>
        <div class="input-group mb-2">
          <input
            type="number"
            name="β1DF"
            class="form-control text-center"
            id="β1DF"
            placeholder="${β1DF}"
            min="0"
            step="any"
            value="${β1DF}"
          />
          <div class="input-group-append">
            <span class="input-group-text">-</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Button Submit para Empezar a Diseñar el DOCUMENTO -->
    <div class="d-flex justify-content-center">
      <button class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" type="submit">DISEÑAR</button>
    </div>
  </form>`;

  //--------------Diseño por Flexión---------------------

  // Ocultar/Mostrar el formulario y ajustar el tamaño de las columnas
  function ocultarForm() {
    const toggleFormButton = document.getElementById('toggleFormButton');
    const formContainer = document.getElementById('formContainer');
    const formColumn = document.getElementById('formColumn');
    const resultadosContainer = document.getElementById('resultadosContainer');
    const toggleIcon = toggleFormButton.querySelector('i');

    // Función para cambiar las clases de Bootstrap y el ícono del botón
    function toggleClasses() {
      formColumn.classList.toggle('col-md-2');
      formColumn.classList.toggle('col-md-1');
      resultadosContainer.classList.toggle('col-md-10');
      resultadosContainer.classList.toggle('col-md-11');
      toggleIcon.classList.toggle('fa-chevron-left');
      toggleIcon.classList.toggle('fa-chevron-right');
    }

    // Función para ocultar el formulario antes de imprimir
    function hideFormBeforePrint() {
      formContainer.style.display = 'none';
      toggleIcon.classList.add('d-none');
      if (formColumn.classList.contains('col-md-2')) {
        toggleClasses();
      }
    }

    // Función para restaurar la visibilidad del formulario después de imprimir
    function showFormAfterPrint() {
      // Esperar un breve período antes de restaurar las clases
      setTimeout(function () {
        formContainer.style.display = 'block';
        toggleIcon.classList.remove('d-none');
        toggleClasses();
      }, 100); // Ajusta este valor según sea necesario
    }

    toggleFormButton.addEventListener('click', function () {
      formContainer.style.display =
        formContainer.style.display === 'none' ? 'block' : 'none';
      toggleClasses();
    });

    // Agregar eventos para detectar cuando se imprime la página
    window.addEventListener('beforeprint', hideFormBeforePrint);
    window.addEventListener('afterprint', showFormAfterPrint);
  }
  ocultarForm();

  // form Flex Desing
  var formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = formDF;

  //Cambios en el input Lx
  var lxDFElement = document.getElementById('lxDF');
  lxDFElement.addEventListener('input', function (e) {
    document.getElementById('dxDF').value = (
      0.8 * parseFloat(this.value)
    ).toFixed(2);
    document.getElementById('lnucxDF').value = (
      parseFloat(this.value) -
      2 * parseFloat(document.getElementById('zcxDF').value)
    ).toFixed(2);
  });

  //Cambios en el input Ly
  var lyDFElement = document.getElementById('lyDF');
  lyDFElement.addEventListener('input', function (e) {
    document.getElementById('dyDF').value = (
      0.8 * parseFloat(this.value)
    ).toFixed(2);
    document.getElementById('lnucyDF').value = (
      parseFloat(this.value) -
      2 * parseFloat(document.getElementById('zCyDF').value)
    ).toFixed(2);
  });

  var selectFormDF = document.getElementById('generalSelect');
  selectFormDF.addEventListener('change', function (e) {
    document.getElementById('generalSelectText').innerHTML = `Ø ${this.value}`;
    generalSelect = parseFloat(this.value);
    // Colapsar divs que no son seleccionados class="d-none"
    if (generalSelect == 0.85) {
      document.getElementById('acwyDC').classList.remove('d-none');
      document.getElementById('acwxDC').classList.remove('d-none');
    } else {
      document.getElementById('acwyDC').classList.add('d-none');
      document.getElementById('acwxDC').classList.add('d-none');
    }
  });

  //Cambios en el input f'c
  var fcDFElement = document.getElementById('fcDF');
  fcDFElement.addEventListener('input', function (e) {
    document.getElementById('ecDF').value = (
      15000 * Math.sqrt(parseFloat(this.value))
    ).toFixed(2);
    document.getElementById('β1DF').value = (
      parseFloat(this.value) <= 280
        ? 0.85
        : parseFloat(this.value) <= 350
          ? 0.8
          : parseFloat(this.value) <= 420
            ? 0.75
            : parseFloat(this.value) <= 490
              ? 0.7
              : 0.65
    ).toFixed(2);
  });

  formDisplay();

  // LLamada y envío de datos a las funciones exportadas para Diseño por Flexión
  var generalForm = document.getElementById('generalForm');
  generalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    //var canva = document.getElementById('graphDF');
    var formData = new FormData(this);
    var formDataObject = {};
    // Itera sobre todos los pares clave/valor en el objeto FormData
    for (var pair of formData.entries()) {
      formDataObject[pair[0]] = pair[1]; // Guarda cada par clave/valor en el objeto formDataObject
    }
    var sendInsteadDT3 = [
      ['Piso 1', 1445.64, 174.234, 1682.383, 12.576, 23.586],
      ['Piso 2', 1471.7, 133.72, 1207.14, 20.73, 34.19],
      ['Piso 3', 1369.05, 109.83, 900.41, 24.86, 38.96],
      ['Piso 4', 1265.11, 98.09, 695.02, 27.05, 41.4],
      ['Piso 4', 1160.05, 89.92, 548.43, 27.74, 41.88],
    ];
    var filtroTS2 = solicitudCargaDT2.map((subarray) => {
      return [
        subarray[0], // posición 0
        subarray[2], // posición 2
        subarray[5], // posición 5
      ];
    });

    var sendInsteadFiltroTS2 = [
      [1573.0, 15.26, 2.981],
      [1246.4, 608.848, 23.586],
      [1408.222, -583.572, -18.691],
      [1208.982, 1682.383, 9.426],
      [1445.64, -1657.107, -4.531],
      [1246.4, 608.848, 23.586],
      [1408.222, -583.572, -18.691],
      [1208.982, 1682.383, 9.426],
      [1445.64, -1657.107, -4.531],
      [615.518, 601.995, 22.181],
      [777.34, -590.425, -20.096],
      [578.1, 1675.53, 8.021],
      [814.758, -1663.96, -5.936],
      [615.518, 601.995, 22.181],
      [777.34, -590.425, -20.096],
      [578.1, 1675.53, 8.021],
      [814.758, -1663.96, -5.936],
      [1471.699, -12.551, 8.622],
      [1162.94, 417.648, 34.194],
      [1320.915, -438.453, -20.047],
      [1126.251, 1201.523, 16.046],
      [1357.604, -1222.328, -1.899],
      [1162.94, 417.648, 34.194],
      [1320.915, -438.453, -20.047],
      [1126.251, 1201.523, 16.046],
      [1357.604, -1222.328, -1.899],
      [572.978, 423.262, 30.114],
      [730.953, -432.839, -24.126],
      [536.289, 1207.137, 11.967],
      [767.642, -1216.715, -5.979],
      [572.978, 423.262, 30.114],
      [730.953, -432.839, -24.126],
      [536.289, 1207.137, 11.967],
      [767.642, -1216.715, -5.979],
    ];

    if (formDataObject.generalSelect == 0.9) {
      var contenedorX = document.getElementById('flexDesingT1X');
      var contenedorY = document.getElementById('flexDesingT1Y');
      /* flexDesignT1(contenedor, solicitudCargaDT3, formDataObject); */
      flexDesignT1X(contenedorX, solicitudCargaDT3, formDataObject);
      flexDesignT1Y(contenedorY, solicitudCargaDT3, formDataObject);
      document.getElementById('content2').classList.remove('d-none');
      document.getElementById('content3').classList.add('d-none');
      document.getElementById('content4').classList.add('d-none');
      document.getElementById('content5').classList.add('d-none');
      document.getElementById('content6').classList.add('d-none');
      document.getElementById('content7').classList.add('d-none');
      document.getElementById('content8').classList.add('d-none');
      /* flexDesingT1 */
      /* dibujarLine(canva); */
    } else if (formDataObject.generalSelect == 0.85) {
      //--------------Envío de datos (contenedor, solicitaciones de carga, a Diseño por Flexión)---------------------

      //--------------Diseño por Corte---------------------

      // LLamada y envío de datos a las funciones exportadas para Diseño por Corte
      var contenedorX = document.getElementById('cutDesingT1X');
      var contenedorY = document.getElementById('cutDesingT1Y');
      /* flexDesignT1(contenedor, solicitudCargaDT3, formDataObject); */
      cutDesignT1X(contenedorX, solicitudCargaDT3, formDataObject);
      cutDesignT1Y(contenedorY, solicitudCargaDT3, formDataObject);
      document.getElementById('content2').classList.add('d-none');
      document.getElementById('content3').classList.remove('d-none');
      document.getElementById('content4').classList.add('d-none');
      document.getElementById('content5').classList.add('d-none');
      document.getElementById('content6').classList.add('d-none');
      document.getElementById('content7').classList.add('d-none');
      document.getElementById('content8').classList.add('d-none');
      /* flexDesingT1 */
      /* dibujarLine(canva); */
      //--------------Envío de datos (contenedor, solicitaciones de carga, a Diseño por Corte)---------------------
    } else if (formDataObject.generalSelect == 0) {
      //------Envío de datos (contenedor, solicitaciones de carga, a Diagrama de interacción)--------------
      var contenedorX = document.getElementById('diT1X');
      var contenedorY = document.getElementById('diT1Y');
      if (tableData1 == []) {
        alert('Llene datos en la tabla 1 X-X de diseño corte');
        return;
      }
      if (tableData1Y == []) {
        alert('Llene datos en la tabla 1 Y-Y de diseño corte');
        return;
      }
      if (dataTable2x == []) {
        alert('Llene datos en la tabla 2 X-X de diseño flexión');
        return;
      }
      if (dataTable2y == []) {
        alert('Llene datos en la tabla 2 Y-Y de diseño flexión');
        return;
      }
      if (tableData3 == []) {
        alert('Llene datos en la tabla 3 X-X de diseño corte');
        return;
      }
      if (tableData3Y == []) {
        alert('Llene datos en la tabla 3 Y-Y de diseño corte');
        return;
      }
      diT1X(
        contenedorX,
        solicitudCargaDT3,
        tableData1,
        dataTable2x,
        tableData3,
        formDataObject
      );
      diT1Y(
        contenedorY,
        solicitudCargaDT3,
        tableData1Y,
        dataTable2y,
        tableData3Y,
        formDataObject
      );
      diagramI(filtroTS2);
      document.getElementById('content2').classList.add('d-none');
      document.getElementById('content3').classList.add('d-none');
      document.getElementById('content4').classList.remove('d-none');
      document.getElementById('content5').classList.add('d-none');
      document.getElementById('content6').classList.add('d-none');
      document.getElementById('content7').classList.add('d-none');
      document.getElementById('content8').classList.add('d-none');
      // diT1Y(contenedorY, sendInsteadDT3, formDataObject);
      //------Envío de datos (contenedor, solicitaciones de carga, a Diagrama de interacción)--------------
    } else if (formDataObject.generalSelect == 1) {
      //------Envío de datos (contenedor, solicitaciones de carga, a Verificación por Agrietamiento)--------------
      document.getElementById('content2').classList.add('d-none');
      document.getElementById('content3').classList.add('d-none');
      document.getElementById('content4').classList.add('d-none');
      document.getElementById('content5').classList.remove('d-none');
      document.getElementById('content6').classList.add('d-none');
      document.getElementById('content7').classList.add('d-none');
      document.getElementById('content8').classList.add('d-none');
      var contenedorX = document.getElementById('vaT1X');
      var contenedorY = document.getElementById('vaT1Y');
      vaT1X(contenedorX, solicitudCargaDT3, formDataObject);
      vaT1Y(contenedorY, solicitudCargaDT3, formDataObject);
      //------Envío de datos (contenedor, solicitaciones de carga, a Verificación por Agrietamiento)--------------
    } else if (formDataObject.generalSelect == 2) {
      //------Envío de datos (contenedor, solicitaciones de carga, a Diseño de de compresión Pura)--------------
      document.getElementById('content2').classList.add('d-none');
      document.getElementById('content3').classList.add('d-none');
      document.getElementById('content4').classList.add('d-none');
      document.getElementById('content5').classList.add('d-none');
      document.getElementById('content6').classList.remove('d-none');
      document.getElementById('content7').classList.add('d-none');
      document.getElementById('content8').classList.add('d-none');
      var contenedorX = document.getElementById('dcpT1X');
      var contenedorY = document.getElementById('dcpT1Y');
      dcpT1X(contenedorX, solicitudCargaDT3, formDataObject, tableData1);
      dcpT1Y(contenedorY, solicitudCargaDT3, formDataObject, tableData1);
      //------Envío de datos (contenedor, solicitaciones de carga, a Diseño de de compresión Pura)--------------
    } else if (formDataObject.generalSelect == 3) {
      //------Envío de datos (contenedor, solicitaciones de carga, a Diseño por Deslizamiento)--------------
      var contenedorX = document.getElementById('ddT1X');
      var contenedorY = document.getElementById('ddT1Y');
      document.getElementById('content2').classList.add('d-none');
      document.getElementById('content3').classList.add('d-none');
      document.getElementById('content4').classList.add('d-none');
      document.getElementById('content5').classList.add('d-none');
      document.getElementById('content6').classList.add('d-none');
      document.getElementById('content7').classList.remove('d-none');
      document.getElementById('content8').classList.add('d-none');
      ddT1X(
        contenedorX,
        solicitudCargaDT3,
        formDataObject,
        tableData3,
        tableData3Y
      );
      /* ddT1Y(
        contenedorY,
        sendInsteadDT3,
        formDataObject,
        tableData3,
        tableData3Y
      ); */
      //------Envío de datos (contenedor, solicitaciones de carga, a Diseño por Deslizamiento)--------------
    } else if (formDataObject.generalSelect == 4) {
      //------Envío de datos (contenedor, solicitaciones de carga, a Efecto Local -Carga Puntual)--------------
      var contenedor = document.getElementById('elT1');
      document.getElementById('content2').classList.add('d-none');
      document.getElementById('content3').classList.add('d-none');
      document.getElementById('content4').classList.add('d-none');
      document.getElementById('content5').classList.add('d-none');
      document.getElementById('content6').classList.add('d-none');
      document.getElementById('content7').classList.add('d-none');
      document.getElementById('content8').classList.remove('d-none');
      elT1(contenedor, formDataObject, tableData1);
      //------Envío de datos (contenedor, solicitaciones de carga, a Efecto Local -Carga Puntual)--------------
    }
  });

  // (CAPTURA DE PANTALLA POR TABLA) 
  function clonarConValores(node) {
    const clone = node.cloneNode(true);

    const original = node.querySelectorAll("input, select, textarea");
    const clonados = clone.querySelectorAll("input, select, textarea");

    original.forEach((el, i) => {
      const c = clonados[i];
      if (!c) return;

      if (el.tagName === "INPUT") {
        c.value = el.value;
        c.setAttribute("value", el.value);

        if (el.type === "checkbox" || el.type === "radio") {
          c.checked = el.checked;
          if (el.checked) c.setAttribute("checked", "checked");
          else c.removeAttribute("checked");
        }
      }

      if (el.tagName === "TEXTAREA") {
        c.value = el.value;
        c.textContent = el.value;
      }

      if (el.tagName === "SELECT") {
        c.value = el.value;
        Array.from(c.options).forEach((opt) => {
          if (opt.value === el.value) {
            opt.selected = true;
            opt.setAttribute("selected", "selected");
          } else {
            opt.selected = false;
            opt.removeAttribute("selected");
          }
        });
      }
    });

    return clone;
  }

  async function capturarElemento(id, nombre) {
    const original = document.getElementById(id);

    if (!original) {
      alert(`No existe el bloque con id "${id}"`);
      return;
    }

    if (original.innerHTML.trim() === "") {
      alert("El bloque está vacío.");
      return;
    }

    const estabaOculto =
      original.classList.contains("hidden") ||
      original.classList.contains("d-none") ||
      getComputedStyle(original).display === "none";

    if (estabaOculto) {
      original.classList.remove("hidden", "d-none");
      original.style.display = "block";
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    const clone = clonarConValores(original);

    // ocultar botones en la captura
    clone.querySelectorAll("button").forEach((btn) => {
      btn.style.display = "none";
    });

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-99999px";
    wrapper.style.top = "0";
    wrapper.style.background = "#ffffff";
    wrapper.style.padding = "16px";
    wrapper.style.zIndex = "-1";
    wrapper.style.width = "max-content";
    wrapper.style.height = "auto";
    wrapper.style.overflow = "visible";

    clone.style.display = "block";
    clone.style.maxHeight = "none";
    clone.style.height = "auto";
    clone.style.overflow = "visible";
    clone.style.maxWidth = "none";
    clone.style.width = "max-content";
    clone.style.backgroundColor = "#ffffff";
    clone.style.color = "#000000";

    clone.querySelectorAll("*").forEach((el) => {
      el.style.maxHeight = "none";
      el.style.height = "auto";
      el.style.overflow = "visible";
      el.style.maxWidth = "none";
    });

    clone.querySelectorAll(".wtBorder").forEach((el) => {
      el.style.display = "none";
    });

    clone.querySelectorAll(".handsontable, .ht_master, .wtHolder, .wtHider, .wtSpreader, .table-container").forEach((el) => {
      el.style.overflow = "visible";
      el.style.height = "auto";
      el.style.maxHeight = "none";
      el.style.maxWidth = "none";
      el.style.width = "max-content";
      el.style.backgroundColor = "#111827";
    });

    clone.querySelectorAll("td, th, .htCore td, .htCore th").forEach((el) => {
      el.style.borderColor = "#374151";
    });

    clone.querySelectorAll("table").forEach((table) => {
      table.style.width = "max-content";
      table.style.maxWidth = "none";
      table.style.tableLayout = "auto";
      table.style.borderCollapse = "collapse";
    });

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(wrapper, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: wrapper.scrollWidth,
        windowHeight: wrapper.scrollHeight,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${nombre}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      alert("Error al capturar.");
    } finally {
      document.body.removeChild(wrapper);

      if (estabaOculto) {
        original.style.display = "";
        original.classList.add("d-none");
      }
    }
  }

  document.querySelectorAll(".btn-captura-bloque").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const id = this.dataset.target;
      const nombre = this.dataset.name;
      const textoOriginal = this.textContent;

      try {
        this.disabled = true;
        this.textContent = "Generando...";
        await capturarElemento(id, nombre);
      } finally {
        this.disabled = false;
        this.textContent = textoOriginal;
      }
    });
  });

  // CAPTURAR PANTALLA 

});