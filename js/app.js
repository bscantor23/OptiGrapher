particlesJS.load("particles-js", "./assets/particles.json", function () {
  console.log("callback - particles.js config loaded");
});

const generateTargetFunction = (number, end) => {
  return `
  <div class="col-auto">
    <div class="row">
      <div class="col-auto">
        <input
          type="number"
          class="form-control"
          id="target_${number}"
          placeholder="0"
        />
      </div>
      <div class="col-auto px-0">
        <label for="x1" class="col-sm-auto col-form-label text-end"
          >X${number} ${end ? "" : "+"}</label
        >
      </div>
    </div>
  </div>`;
};

const generateRestriction = (row, column, end, method) => {
  let content = `
  <div class="col-auto">
    <input
      type="number"
      class="form-control"
      id="restriction_${row}_${column}"
      placeholder="0"
    />
  </div>
  <div class="col-auto px-0">
        <label for="x1" class="col-sm-auto col-form-label text-end"
          >X${column} ${end ? "" : "+"}</label
        >
  </div>
  `;

  if (end) {
    content += `
    <div class="col-auto">
      <select class="form-select" id="nature_${row}">
        <option value="0">≥</option>
        <option value="1">≤</option>
        <option value="2">=</option>
      </select>
    </div>
    <div class="col-auto p-0">
      <input type="number" class="form-control" id="restriction_${row}_${
      column + 1
    }" placeholder="0"/>
    </div>
    `;
  }

  return content;
};

const deleteGraph = () => {
  const existingCanvas = document.getElementById("graphCanvas");
  const parentContainer = existingCanvas.parentNode;

  if (existingCanvas) {
    parentContainer.removeChild(existingCanvas);
    $("#graph-label").empty();
  }
};

const checkForm = () => {
  // Verificar si todos los campos del primer formulario están diligenciados
  if ($("#method-form")[0].checkValidity()) {
    // Mostrar el segundo formulario
    createTargetForm();
    deleteGraph();

    movement();
  } else {
    swal(
      "Formulario Incompleto",
      "Debes ingresar todos los datos para continuar",
      "error"
    );
  }
};

const credits = () => {
  swal(
    "Autores OptiGrapher",
    `
      Daniel Felipe Rodriguez Hernandez - 20171578079
      Brayan Steban Cantor Munevar - 20191578017
      Carlos Alberto Rubiano Olaya - 20191578019
      Daniel Andres Ravelo Rivera - 20191578005
    `,
    "success"
  );
};

const movement = () => {
  let finalElement = $("body");
  $("html, body").animate({ scrollTop: finalElement.height() }, "slow");
};

const checkRowWidth = () => {
  let row = $("#target-variables");

  if (row.length > 0) {
    let rowWidth = 0;

    row.children().each(function () {
      rowWidth += $(this).outerWidth(true);
    });

    let maxWidth = $(".target-container").outerWidth();
    if (rowWidth > maxWidth) {
      $(".elastic-row").removeClass("justify-content-center");
      $(".elastic-group-row").addClass("overflow-auto");
    } else {
      $(".elastic-row").addClass("justify-content-center");
      $(".elastic-group-row").removeClass("overflow-auto");
    }
  }
};

const createTargetForm = () => {
  reloadSystem();
  let variablesValue = $("#variables").val();
  let restrictionsValue = $("#restrictions").val();
  let methodValue = $("#method-form").val();

  let variablesString = [];

  $("#target-variables").html(`
    <div class="col-auto">
      <label for="funcion" class="col-sm-auto col-form-label text-end">Función:</label>
    </div>
  `);

  for (let i = 1; i <= variablesValue; i++) {
    variablesString.push("X" + i);
    $("#target-variables").append(
      generateTargetFunction(i, i == variablesValue)
    );
  }

  $("#target-restrictions").empty();

  for (let i = 1; i <= restrictionsValue; i++) {
    $("#target-restrictions").append(
      `<div class="mb-3 row elastic-row flex-nowrap"></div>`
    );

    let row = $("#target-restrictions div");
    for (let j = 1; j <= variablesValue; j++) {
      row
        .last()
        .append(generateRestriction(i, j, j == variablesValue, methodValue));
    }
  }

  $("#variable-label").html(`${variablesString.join(", ")} ≥ 0`);

  checkRowWidth();
};

const reloadSystem = () => {
  $("#target-form").show();
  $(".datatable").DataTable().destroy();
  $("#iterations-container").empty();
  $("#iterations-container").hide();
  $("#calculateButton").prop("disabled", false);
};

const calculate = async () => {
  $(".datatable").DataTable().destroy();
  $("#iterations-container").empty();
  $("#iterations-container").hide();

  let methodValue = $("#method-select").val();
  console.log(methodValue);
  if (methodValue == "0") {
    natureSystem = 0; // Minimización 0 | Maximización 1
    target = [];
    natures = []; // > 0 | < 1 | = 2
    inputMatrix = [];

    let variablesValue = $("#variables").val();
    let restrictionsValue = $("#restrictions").val();

    natureSystem = Number($("#natureSystem").val()); // Minimización 0 | Maximización 1

    for (let i = 1; i <= variablesValue; i++) {
      let cellTarget = "#target_" + i;
      target.push(Number($(cellTarget).val()) || 0);
    }

    for (let i = 1; i <= restrictionsValue; i++) {
      let cellNature = "#nature_" + i;
      natures.push(Number($(cellNature).val()) || 0);
    }

    let columnsVariables = Number(variablesValue) + 1;
    for (let i = 1; i <= restrictionsValue; i++) {
      let rowCopy = [];
      for (let j = 1; j <= columnsVariables; j++) {
        let newValue = $("#restriction_" + i + "_" + j).val() || 0;
        rowCopy.push(Number(newValue));
      }
      inputMatrix.push(rowCopy);
    }

    execute();

    $("#iterations-container").append(` 
      <div class="row justify-content-center">
        <div class="mb-3 row justify-content-center phase-title">
          <h1 class="text-center">Primera Fase</h1>
        </div>
      </div>`);

    $("#loading-overlay").show();

    for (let i = 0; i < redos.length; i++) {
      $("#iterations-container").append(
        `<table id="matrix_${i}" class="datatable display"></table>`
      );

      let data = changeFractions(redos[i]);
      await initializeTable(data, i);

      if (!redos[i].candidate && i < redos.length - 1) {
        $("#iterations-container").append(` 
        <div class="row justify-content-center">
          <div class="mb-3 row justify-content-center phase-title">
            <h1 class="text-center">Segunda Fase</h1>
          </div>
        </div>`);
      }
    }
    $("#loading-overlay").hide();

    $("#iterations-container").show();
  } else {
    natureSystem = 0; // Minimización 0 | Maximización 1
    target = [];
    restrictions = []; // > 0 | < 1 | = 2

    let variablesValue = $("#variables").val();
    let restrictionsValue = $("#restrictions").val();

    natureSystem = Number($("#natureSystem").val()); // Minimización 0 | Maximización 1

    for (let i = 1; i <= variablesValue; i++) {
      let cellTarget = "#target_" + i;
      target.push(Number($(cellTarget).val()) || 0);
    }

    for (let i = 1; i <= restrictionsValue; i++) {
      let cellNature = "#nature_" + i;
      natures.push(Number($(cellNature).val()) || 0);
    }

    let columnsVariables = Number(variablesValue) + 1;
    for (let i = 1; i <= restrictionsValue; i++) {
      let rowCopy = [];
      for (let j = 1; j <= columnsVariables; j++) {
        let newValue = $("#restriction_" + i + "_" + j).val() || 0;

        if (j == 3) {
          let cellNature = "#nature_" + i;
          rowCopy.push(Number($(cellNature).val()) || 0);
        }
        rowCopy.push(Number(newValue));
      }
      restrictions.push(rowCopy);
    }

    graphCanvas();

    console.log("canvas");
    $("#canvas-container").show();
  }
};

const changeFractions = (data) => {
  for (let i = 0; i < data.matrix.length; i++) {
    for (let j = 0; j < data.matrix[i].length; j++) {
      // Verifica si el valor es un número y si tiene decimales
      if (!isNaN(data.matrix[i][j]) && data.matrix[i][j] % 1 !== 0) {
        let fraction = math.fraction(data.matrix[i][j]);
        let nature = fraction.s == -1 ? "-" : "";
        data.matrix[i][j] = nature + fraction.n + "/" + fraction.d; // Reemplaza el valor decimal con 1

        if (i == data.matrix.length - 1 && j == data.matrix[i].length - 1) {
          data.z = data.matrix[i][j];
        }
      }
    }
  }

  let variables = data.matrix
    .slice(2, -1)
    .map((row) => row.slice(-2))
    .filter((row) => String(row[1]).includes("X"));

  let decisionVariables = data.matrix[1].filter((variable) =>
    String(variable).includes("X")
  );

  decisionVariables.forEach((cell) => {
    let variable = variables.find((_) => _[1] == cell);

    if (!variable) {
      variables.push([0, cell]);
    }
  });

  data.variables = variables
    .sort(function (a, b) {
      return a[1].localeCompare(b[1], undefined, { numeric: true });
    })
    .map((row) => row.reverse().join(" = "))
    .join(", ");

  return data;
};

const initializeTable = async (data, index) => {
  let candidate = data.candidate;

  let content = [];
  for (var i = 0; i < data.matrix.length; i++) {
    var fila = [];
    for (var j = 0; j < data.matrix[i].length; j++) {
      if (i == 0 && j == 0) {
        fila.push("Cj");
      }

      if (i == 1 && j == 0) {
        fila.push("Cx");
      }

      if (
        i > 1 &&
        i < data.matrix.length - 1 &&
        j == data.matrix[i].length - 2
      ) {
        fila.push(data.matrix[i][j + 1]);
        continue;
      }

      if (
        i > 1 &&
        i < data.matrix.length - 1 &&
        j == data.matrix[i].length - 1
      ) {
        fila.push(data.matrix[i][j - 1]);
        continue;
      }

      if (i == data.matrix.length - 1 && j == 0) {
        fila.push("Zj - Cj");
      }

      if (i == data.matrix.length - 1 && j == data.matrix[i].length - 1) {
        fila.push(0);
        fila.push("Z = " + data.matrix[i][j]);
        continue;
      }

      fila.push(data.matrix[i][j]);

      if (i == 0 && j == data.matrix[i].length - 1) {
        fila.push("Tabla " + (index + 1));
      }

      if (i == 1 && j == data.matrix[i].length - 1) {
        fila.push("Xb");
        fila.push("bi");
      }
    }
    content.push(fila);
  }

  await new Promise((resolve) => {
    setTimeout(() => {
      // Configuración de DataTable
      $(`#matrix_${index}`).DataTable({
        paging: false,
        searching: false,
        ordering: false,
        info: false,
        autoWidth: false, // Desactiva el ajuste automático del ancho de las columnas
        columns: [
          { width: "100px" },
          ...Array(content[0].length - 1).fill({ width: "50px" }),
        ], // Aplica ancho de 50px a todas las columnas
        data: content,
        responsive: false,
        createdRow: function (row, data, dataIndex) {
          $(row).css("background-color", "#e4e4e4");

          if (candidate && dataIndex > 1) {
            $(`td:eq(${candidate.columnIndex})`, row)
              .removeClass()
              .addClass("cell-style-6");

            if (dataIndex == candidate.rowIndex + 2) {
              $(row).children().removeClass().addClass("cell-style-6");

              $(`td:eq(${candidate.columnIndex})`, row)
                .removeClass()
                .addClass("cell-style-1");
            }
          }

          if (dataIndex == 0) {
            $(row).children().removeClass().addClass("cell-style-2");
            $("td:eq(0)", row).removeClass().addClass("cell-style-3");
            $("td:eq(-1)", row).attr("colspan", 2);
            $("td:eq(-2)", row).hide();
          }

          if (dataIndex == 1) {
            $(row).children().removeClass().addClass("cell-style-1");
            $("td:eq(0)", row).removeClass().addClass("cell-style-4");
          }

          if (dataIndex > 1 && dataIndex < content.length - 1) {
            $("td:eq(0)", row).removeClass().addClass("cell-style-2");
            $("td:eq(-1)", row).removeClass().addClass("cell-style-2");
            $("td:eq(-2)", row).removeClass().addClass("cell-style-1");
          }

          if (dataIndex == content.length - 1) {
            $("td:eq(0)", row).removeClass().addClass("cell-style-1");
            $("td:eq(-1)", row)
              .removeClass()
              .addClass("cell-style-5")
              .attr("colspan", 2);
            $("td:eq(-2)", row).hide();
          }
        },
      });

      $("#iterations-container").append(`
      <div class="row justify-content-center">
        <div class="mb-3 row justify-content-center">
          <div class="col-auto py-0 px-2">
            <label
              for="funcion"
              class="col-sm-auto col-form-label text-end fw-bold variables-label"
              style="font-size: 16px"
              >${data.variables}, Z = ${data.z}</label
            >
          </div>
        </div>
      </div>
      `);

      resolve();
    }, 200);
  });
};

$(document).ready(function () {
  $(window).resize(function () {
    checkRowWidth();
  });

  $("#method-form :input").on("input change", function () {
    if (
      $("#iterations-container").is(":visible") ||
      $("#canvas-container").is(":visible")
    ) {
      $("#calculateButton").prop("disabled", true);
    }
  });

  $("#method-select").change(function () {
    if (
      $("#iterations-container").is(":visible") ||
      $("#canvas-container").is(":visible")
    ) {
      $("#calculateButton").prop("disabled", true);
    }

    var selectedValue = $(this).val();
    var variables = $("#variables");
    if (selectedValue == "1") {
      variables.val("2");
      variables.prop("disabled", true);
    } else {
      variables.val("");
      variables.prop("disabled", false);
    }
  });
});
