function printMatrix() {
  console.log("");
  console.log("  " + JSON.stringify(primary[0]));
  console.log("  " + JSON.stringify(primary[1]));
  console.log("-------------------------------------------------------");
  for (var i = 0; i < matrix?.length; i++) {
    console.log(JSON.stringify(matrix[i]));
  }
  console.log("=======================================================");
  console.log("  " + JSON.stringify(resultZj));
}

function generateColumn(restrictions, index, nature) {
  let newColumn = [];
  for (let i = 0; i < restrictions; i++) {
    if (index == i) {
      newColumn.push(nature);
    } else {
      newColumn.push(0);
    }
  }
  return newColumn;
}

function decimalToFraction(decimal) {
  var precision = 1e9;
  var numerador = Math.round(decimal * precision);
  var denominador = precision;

  // Encontrar el máximo común divisor
  function encontrarMCD(a, b) {
    return b === 0 ? a : encontrarMCD(b, a % b);
  }

  // Calcular el máximo común divisor
  var mcd = encontrarMCD(numerador, denominador);

  // Simplificar la fracción
  var numeradorSimplificado = numerador / mcd;
  var denominadorSimplificado = denominador / mcd;

  // Crear la representación de la fracción
  var fraccion = numeradorSimplificado + "/" + denominadorSimplificado;

  return fraccion;
}

function fractionToDecimal(fraction) {
  // Dividir la cadena en numerador y denominador
  var partes = fraction.split("/");

  // Obtener el numerador y denominador como números
  var numerador = parseFloat(partes[0]);
  var denominador = parseFloat(partes[1]);

  // Verificar si los valores son válidos
  if (isNaN(numerador) || isNaN(denominador) || denominador === 0) {
    return "Error: Fracción no válida";
  }

  // Calcular el número decimal
  var resultadoDecimal = numerador / denominador;

  return resultadoDecimal;
}

function mostNegativeNumbersOrdered(arr) {
  const numbers = arr.filter((number) => number < 0).sort((a, b) => a - b);
  return [...new Set(numbers)];
}

function mostPositiveNumbersOrdered(arr) {
  const numbers = arr.filter((number) => number > 0).sort((a, b) => b - a);
  return [...new Set(numbers)];
}

function lessPositiveNumber(arr) {
  let number = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] != Infinity && arr[i] != NaN) {
      if (arr[i] > 0 && (arr[i] < number || number == 0)) {
        number = arr[i];
      }
    }
  }

  return number;
}

function generateMatrix(matrix) {
  matrix = generateMatrixIdentity(matrix);
  matrix = generateSuperavits(matrix);
  matrix = generateTarget(matrix);
  return matrix;
}

function generatePhaseTwo(matrix) {
  matrix = removeArtificials(matrix);
  matrix = updateTarget(matrix);
  return matrix;
}

function generateMatrixIdentity(matrix) {
  for (let i = 0; i < matrix?.length; i++) {
    let nature = natures[i];
    let newColumn = generateColumn(restrictions, i, 1);

    for (var j = 0; j < restrictions; j++) {
      matrix[j].splice(variables + i, 0, newColumn[j]);
    }

    //IR ACTUALIZANDO LA FUNCIÓN OBJETIVO
    switch (nature) {
      case 1: {
        holguras += 1;
        primary[0].push(0);
        primary[1].push("H" + holguras);
        break;
      }
      case 0:
      case 2: {
        artificials += 1;
        primary[0].push(natureSystem ? -1 : 1);
        primary[1].push("R" + artificials);
        break;
      }
    }
  }
  return matrix;
}

function generateSuperavits(matrix) {
  for (let i = 0; i < matrix.length; i++) {
    let nature = natures[i];
    let newColumn = generateColumn(restrictions, i, -1);

    if (nature == 0) {
      for (var j = 0; j < restrictions; j++) {
        matrix[j].splice(variables + superavits, 0, newColumn[j]);
      }

      superavits += 1;
      primary[0].splice(variables + superavits - 1, 0, 0);
      primary[1].splice(variables + superavits - 1, 0, "S" + superavits);
    }
  }

  return matrix;
}

function generateTarget(matrix) {
  let primaryCx = primary[0].slice(primary[0].length - restrictions);
  let primaryXb = primary[1].slice(primary[1].length - restrictions);

  for (var i = 0; i < matrix.length; i++) {
    matrix[i].splice(0, 0, primaryCx[i]);
    matrix[i].splice(matrix[i].length, 0, primaryXb[i]);
  }

  primary[0].push(0);

  return matrix;
}

function removeArtificials(matrix) {
  primary[0].fill(0);

  for (let i = 0; i < target.length; i++) {
    primary[0][i] = target[i];
  }

  for (let i = primary[1].length - 1; i >= 0; i--) {
    if (String(primary[1][i]).includes("R")) {
      primary[1].splice(i, 1);
      primary[0].splice(i, 1);

      for (let j = 0; j < matrix.length; j++) {
        matrix[j].splice(i + 1, 1);
      }
    }
  }

  /*for (let i = matrix.length - 1; i >= 0; i--) {
    if (matrix[i][matrix[i].length - 1].includes("R")) {
      matrix.splice(i, 1);
    }
  }*/

  return matrix;
}

function updateTarget(matrix) {
  for (let i = 0; i < matrix.length; i++) {
    let position = primary[1].findIndex(
      (_) => _ == matrix[i][matrix[i].length - 1]
    );
    matrix[i][0] = primary[0][position] != null ? primary[0][position] : 1;
  }

  return matrix;
}

function generateZj(matrix) {
  let resultZj = [];

  for (let i = 0; i < primary[0].length; i++) {
    resultZj.push(0);
  }

  matrix?.forEach((row, index) => {
    for (let i = 1; i < row.length - 1; i++) {
      //console.log(resultZj[i - 1] + "+=" + row[0] + "*" + row[i]);
      resultZj[i - 1] += row[0] * row[i];

      if (matrix.length == index + 1) {
        resultZj[i - 1] -= primary[0][i - 1];
      }
    }
  });

  return resultZj;
}

function searchPivoteColumn(nature, resultZj) {
  if (nature == 0) {
    return mostPositiveNumbersOrdered(resultZj.slice(0, -1));
  } else {
    return mostNegativeNumbersOrdered(resultZj.slice(0, -1));
  }
}

function searchPivoteRow(matrix, resultZj, columns) {
  let columnCandidates = [];
  let candidates = [];

  for (let c = 0; c < columns.length; c++) {
    for (let i = 0; i < resultZj.length - 1; i++) {
      if (resultZj[i] == columns[c]) {
        columnCandidates.push(i);
      }
    }

    for (let i = 0; i < columnCandidates.length; i++) {
      let pivoteColumn = matrix.map((fila) => {
        return fila[columnCandidates[i] + 1];
      });

      let biColumn = matrix.map((fila, index) => {
        return fila[matrix[index].length - 2];
      });

      let partial = [];

      for (let j = 0; j < pivoteColumn.length; j++) {
        if (i == 0) {
          if (biColumn[j] == 0 && pivoteColumn[j] == 1) {
            return {
              columnIndex: columnCandidates[i] + 1,
              columnValue: resultZj[columnCandidates[i]],
              columnVariable: primary[1][columnCandidates[i]],
              rowIndex: j,
              rowValue: 0,
              rowVariable: matrix[j][matrix[j].length - 1],
              principal: matrix[j][columnCandidates[i] + 1],
            };
          }
        }

        partial.push(biColumn[j] / pivoteColumn[j]);
      }

      let row = lessPositiveNumber(partial);

      for (let j = 0; j < partial.length; j++) {
        if (partial[j] == row) {
          candidates.push({
            columnIndex: columnCandidates[i] + 1,
            columnValue: resultZj[columnCandidates[i]],
            columnVariable: primary[1][columnCandidates[i]],
            rowIndex: j,
            rowValue: partial[j],
            rowVariable: matrix[j][matrix[j].length - 1],
            principal: matrix[j][columnCandidates[i] + 1],
          });
        }
      }
    }

    for (let i = 0; i < candidates.length; i++) {
      console.log(candidates[i]);
      if (
        String(candidates[i].columnVariable).includes("X") &&
        String(candidates[i].rowVariable).includes("R")
      ) {
        return candidates[i];
      }
    }

    for (let i = 0; i < candidates.length; i++) {
      if (String(candidates[i].rowVariable).includes("R")) {
        return candidates[i];
      }
    }

    if (candidates[0]) {
      return candidates[0];
    }
  }

  return null;
}

function identityRow(primary, arr, value) {
  arr[0] = primary[0];
  arr[arr.length - 1] = primary[1];

  for (let i = 1; i < arr.length - 1; i++) {
    arr[i] = arr[i] / value;
  }

  return arr;
}

function gauss(matrix, column, row) {
  let identityRow = matrix[row];

  for (let i = 0; i < matrix.length; i++) {
    if (row != i) {
      let principalCell = matrix[i][column];

      for (let j = 1; j < matrix[i].length - 1; j++) {
        matrix[i][j] = identityRow[j] * principalCell * -1 + matrix[i][j];
      }
    }
  }
}

function iteration(nature) {
  let redo = redos[redos.length - 1];

  let columns = searchPivoteColumn(nature, resultZj);
  console.log("PIVOTE");
  console.log(columns);
  let candidate = searchPivoteRow(matrix, resultZj, columns);
  redo.candidate = candidate;

  console.log("");
  console.log("CANDIDATO");
  console.log(candidate);
  console.log("");

  identityRow(
    [primary[0][candidate.columnIndex - 1], candidate.columnVariable],
    matrix[candidate.rowIndex],
    matrix[candidate.rowIndex][candidate.columnIndex]
  );

  gauss(matrix, candidate.columnIndex, candidate.rowIndex);
  resultZj = generateZj(matrix);

  saveRedo();
}

function finishValidation(nature, arr, specialCase) {
  if (!specialCase && arr[arr.length - 1] == 0) {
    return false;
  }

  let flag = false;
  for (let i = 0; i < arr.length; i++) {
    if (nature == 0) {
      if (arr[i] > 0) {
        flag = true;
      }
    } else {
      if (arr[i] < 0) {
        flag = true;
      }
    }
  }

  let columns = searchPivoteColumn(nature, resultZj);
  if (searchPivoteRow(matrix, resultZj, columns) == null) {
    return false;
  }

  return flag;
}

function saveRedo() {
  let newIteration = [];

  matrix.forEach((row) => {
    let fill = [...row];
    newIteration.push(fill);
  });

  redos.push({
    matrix: [[...primary[0]], [...primary[1]], ...newIteration, [...resultZj]],
    z: resultZj[resultZj.length - 1],
  });

  printMatrix();
}

let natureSystem = 0; // Minimización 0 | Maximización 1
let target = [];

let natures = []; // > 0 | < 1 | = 2
let inputMatrix = [];

let primary = [[], []];
let redos = [];

let holguras = 0;
let superavits = 0;
let artificials = 0;

let variables = 0;
let restrictions = 0;

let matrix = [];
let resultZj = [];

function initializeVariables() {
  primary = [[], []];
  redos = [];

  holguras = 0;
  superavits = 0;
  artificials = 0;

  variables = 0;
  restrictions = 0;

  matrix = [];
  resultZj = [];
}

function execute() {
  initializeVariables();

  console.log(natureSystem);
  console.log(target);
  console.log(natures);
  console.log(inputMatrix);

  let primaryMatrix = JSON.parse(JSON.stringify(inputMatrix));

  variables = target.length;
  restrictions = primaryMatrix.length;

  for (let i = 0; i < variables; i++) {
    primary[0].push(0);
    primary[1].push("X" + (i + 1));
  }

  matrix = generateMatrix(primaryMatrix);
  resultZj = generateZj(matrix);

  saveRedo();
  //TERCER PASO

  if (finishValidation(natureSystem, resultZj)) {
    do {
      iteration(natureSystem);
    } while (finishValidation(natureSystem, resultZj));
  }
  //CUATO PASO PHASE TWO

  console.log("");
  console.log("PHASE TWO");

  matrix = generatePhaseTwo(matrix);
  resultZj = generateZj(matrix);
  saveRedo();
  if (finishValidation(natureSystem, resultZj, true)) {
    do {
      iteration(natureSystem);
    } while (finishValidation(natureSystem, resultZj));
  }
}
