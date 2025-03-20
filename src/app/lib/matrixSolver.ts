// Definición de tipos básicos para el programa
// Matrix es un arreglo bidimensional de números (como una tabla de valores)
type Matrix = number[][];

// Step representa un paso en la resolución del sistema, guardando la matriz, vector y descripción
type Step = {
  matrix: Matrix;       // Estado actual de la matriz
  vector: number[];     // Estado actual del vector de términos independientes
  operation: string;    // Nombre de la operación realizada
  description: string;  // Descripción detallada del paso
};

// Solution es el resultado final que incluye el tipo de solución y todos los pasos
export type Solution = {
  type: "unique" | "infinite" | "no-solution" | "singular";  // Tipo de solución encontrada
  solution?: number[] | string[];  // Valores de la solución (números o expresiones)
  pivotVars?: number[];  // Variables que tienen pivote (posiciones importantes en la matriz)
  freeVars?: number[];   // Variables libres (que pueden tomar cualquier valor)
  isHomogeneous?: boolean;  // Indica si el sistema es homogéneo (todos los términos independientes son cero)
  steps: Step[];           // Lista de todos los pasos realizados
  explanation: string;     // Explicación en lenguaje natural de la solución
};

// Clase principal para resolver sistemas de ecuaciones lineales
export class EnhancedSolver {
  // Variables privadas que solo se pueden usar dentro de la clase
  private pasos: Step[] = [];  // Almacena todos los pasos de la resolución
  private matrizAumentada: number[][]; // Matriz que combina coeficientes y términos independientes
  private precision: number;  // Número de decimales a considerar en los cálculos
  private epsilon: number;    // Valor muy pequeño para considerar un número como cero
  private esHomogeneo: boolean = true; // Indica si el sistema es homogéneo

  // Constructor: inicializa la clase con la matriz de coeficientes y el vector de términos independientes
  constructor(matrix: Matrix, vector: number[]) {
    // Verificar que la matriz y el vector tengan dimensiones compatibles
    if (matrix.length !== vector.length) {
      throw new Error("El número de filas de la matriz y vector no coinciden");
    }

    // Crear la matriz aumentada combinando la matriz y el vector
    this.matrizAumentada = matrix.map((fila, i) => [...fila, vector[i]]);
    this.precision = 4;  // Usar 4 decimales de precisión
    this.epsilon = 1e-10; // Considerar valores menores a 0.0000000001 como cero
    // Verificar si el sistema es homogéneo (todos los términos independientes son cero)
    this.esHomogeneo = vector.every(val => this.esCero(val));
  }

  // Método para redondear números a la precisión establecida
  private round(valor: number): number {
    return parseFloat(valor.toFixed(this.precision));
  }

  // Método para determinar si un valor se considera cero (debido a errores de redondeo)
  private esCero(valor: number): boolean {
    return Math.abs(valor) < this.epsilon;
  }

  // Método para registrar cada paso de la resolución
  private recordStep(operacion: string, descripcion: string) {
    // Extraer la matriz actual (sin el vector de términos independientes)
    const matrizActual = this.matrizAumentada.map((fila) =>
      fila.slice(0, -1).map((val) => this.round(val))
    );
    // Extraer el vector actual de términos independientes
    const vectorActual = this.matrizAumentada.map((fila) =>
      this.round(fila[fila.length - 1])
    );

    // Guardar el paso en el historial
    this.pasos.push({
      matrix: matrizActual.map((fila) => [...fila]),
      vector: [...vectorActual],
      operation: operacion,
      description: descripcion,
    });
  }

  // Método principal para resolver el sistema de ecuaciones
  public solve(): Solution {
    const filas = this.matrizAumentada.length;
    const columnas = this.matrizAumentada[0]?.length - 1 || 0;
    let filaPivote = 0;

    // Proceso de Eliminación Gaussiana para transformar la matriz en forma escalonada
    for (let col = 0; col < columnas && filaPivote < filas; col++) {
      // Buscar la fila con el valor absoluto más grande en la columna actual (pivoteo parcial)
      let filaMaxima = filaPivote;
      for (let i = filaPivote; i < filas; i++) {
        if (Math.abs(this.matrizAumentada[i][col]) > Math.abs(this.matrizAumentada[filaMaxima][col])) {
          filaMaxima = i;
        }
      }

      // Si la columna actual solo tiene ceros, pasar a la siguiente columna
      if (this.esCero(this.matrizAumentada[filaMaxima][col])) continue;

      // Intercambiar filas si encontramos un mejor pivote
      if (filaMaxima !== filaPivote) {
        [this.matrizAumentada[filaPivote], this.matrizAumentada[filaMaxima]] = [
          this.matrizAumentada[filaMaxima],
          this.matrizAumentada[filaPivote],
        ];
        this.recordStep(
          "Pivoteo parcial",
          `Intercambio fila ${filaPivote + 1} con fila ${filaMaxima + 1}`
        );
      }

      // Normalizar la fila pivote (hacer que el elemento pivote sea 1)
      const valorPivote = this.matrizAumentada[filaPivote][col];
      for (let j = col; j <= columnas; j++) {
        this.matrizAumentada[filaPivote][j] = this.round(
          this.matrizAumentada[filaPivote][j] / valorPivote
        );
      }
      this.recordStep(
        "Normalización",
        `Fila ${filaPivote + 1} dividida por ${this.round(valorPivote)}`
      );

      // Eliminar el elemento de la columna actual en todas las demás filas
      for (let i = 0; i < filas; i++) {
        if (i !== filaPivote && !this.esCero(this.matrizAumentada[i][col])) {
          const factor = this.matrizAumentada[i][col];
          for (let j = col; j <= columnas; j++) {
            this.matrizAumentada[i][j] = this.round(
              this.matrizAumentada[i][j] - factor * this.matrizAumentada[filaPivote][j]
            );
          }
          this.recordStep(
            "Eliminación",
            `Fila ${i + 1} -= ${this.round(factor)} × Fila ${filaPivote + 1}`
          );
        }
      }
      filaPivote++;
    }

    // Detectar si el sistema es inconsistente (sin solución)
    // Un sistema es inconsistente si hay una ecuación donde todos los coeficientes son 0
    // pero el término independiente no es 0 (ejemplo: 0 = 5, lo cual es imposible)
    let tieneInconsistencia = false;
    for (const fila of this.matrizAumentada) {
      const coeficientes = fila.slice(0, -1);
      const constante = fila[fila.length - 1];
      if (coeficientes.every(c => this.esCero(c)) && !this.esCero(constante)) {
        tieneInconsistencia = true;
        break;
      }
    }

    // Si el sistema es inconsistente, devolver resultado indicando que no hay solución
    if (tieneInconsistencia) {
      return {
        type: "no-solution",
        isHomogeneous: this.esHomogeneo,
        steps: this.pasos,
        explanation: this.generarExplicacionSinSolucion(),
      };
    }

    // Contar cuántas filas tienen pivote (elemento no cero en la diagonal)
    let pivotes = 0;
    for (const fila of this.matrizAumentada) {
      if (fila.slice(0, -1).some(c => !this.esCero(c))) pivotes++;
    }

    // Generar explicación base con información sobre el sistema
    let explicacion = `Sistema de ${filas} ecuaciones con ${columnas} variables\n`;
    explicacion += this.esHomogeneo ? "- Sistema HOMOGÉNEO\n" : "- Sistema NO HOMOGÉNEO\n";

    // Determinar el tipo de solución basado en el número de pivotes
    if (pivotes === columnas) {
      // Si el número de pivotes es igual al número de variables, hay solución única
      explicacion += "\n→ Sistema COMPATIBLE DETERMINADO (solución única)\n";
      explicacion += this.esHomogeneo
        ? "Solución trivial única (todas las variables son cero)."
        : "Todas las variables tienen pivote.";
      return this.manejarSolucionUnica(explicacion);
    } else {
      // Si hay menos pivotes que variables, hay infinitas soluciones
      explicacion += "\n→ Sistema COMPATIBLE INDETERMINADO (infinitas soluciones)\n";
      explicacion += `Variables libres: ${columnas - pivotes}`;
      if (this.esHomogeneo) {
        explicacion += "\nSistema homogéneo con soluciones no triviales.";
      }
      return this.manejarInfinitasSoluciones(explicacion);
    }
  }

  // Método para generar una explicación cuando el sistema no tiene solución
  private generarExplicacionSinSolucion(): string {
    let explicacion = `Sistema de ${this.matrizAumentada.length} ecuaciones con ${
      this.matrizAumentada[0]?.length - 1
    } variables\n`;
    explicacion += this.esHomogeneo
      ? "- Sistema HOMOGÉNEO (imposible tener inconsistencia)\n"
      : "- Sistema NO HOMOGÉNEO\n";
    explicacion += "\n→ Sistema INCOMPATIBLE (sin solución)\n";
    explicacion += "Existe una ecuación inconsistente (ej: 0 = valor no cero).";
    return explicacion;
  }

  // Método para manejar un sistema con solución única
  private manejarSolucionUnica(explicacion: string): Solution {
    const columnas = this.matrizAumentada[0].length - 1;
    const solucion: number[] = new Array(columnas).fill(0);

    // Sustitución hacia atrás para encontrar los valores de las variables
    // Empezamos desde la última ecuación y vamos hacia arriba
    for (let i = this.matrizAumentada.length - 1; i >= 0; i--) {
      // Encontrar la posición del pivote en esta fila
      const columnaPivote = this.matrizAumentada[i].findIndex((val) => !this.esCero(val));
      if (columnaPivote === -1 || columnaPivote === columnas) continue;

      // Calcular el valor de la variable correspondiente
      let suma = 0;
      for (let j = columnaPivote + 1; j < columnas; j++) {
        suma += this.matrizAumentada[i][j] * solucion[j];
      }
      solucion[columnaPivote] = this.round(this.matrizAumentada[i][columnas] - suma);
    }

    // Devolver la solución única
    return {
      type: "unique",
      solution: solucion.map((val) => this.round(val)),
      isHomogeneous: this.esHomogeneo,
      steps: this.pasos,
      explanation: explicacion,
    };
  }

  // Método para manejar un sistema con infinitas soluciones
  private manejarInfinitasSoluciones(explicacion: string): Solution {
    const columnas = this.matrizAumentada[0].length - 1;
    const columnasConPivote: number[] = []; // Variables con pivote (determinadas)
    const columnasLibres: number[] = [];    // Variables libres (parámetros)
    let filaActualPivote = 0;

    // Identificar cuáles variables tienen pivote y cuáles son libres
    for (let col = 0; col < columnas; col++) {
      if (
        filaActualPivote < this.matrizAumentada.length &&
        !this.esCero(this.matrizAumentada[filaActualPivote][col])
      ) {
        // Esta variable tiene pivote (está determinada)
        columnasConPivote.push(col);
        filaActualPivote++;
      } else {
        // Esta variable es libre (parámetro)
        columnasLibres.push(col);
      }
    }

    // Generar la solución paramétrica (con variables libres como parámetros)
    const solucionParametrica = columnasConPivote.map((pivote, i) => {
      // Empezar con el término independiente
      let expresion = `${this.round(this.matrizAumentada[i][columnas])}`;
      
      // Agregar términos para cada variable libre
      columnasLibres.forEach((libre, j) => {
        const coef = this.round(-this.matrizAumentada[i][libre]);
        if (!this.esCero(coef)) {
          expresion += ` + (${coef})·t${j}`;
        }
      });
      
      // Formar la expresión para esta variable con pivote
      return `x${pivote + 1} = ${expresion}`;
    });

    // Agregar las variables libres a la solución
    columnasLibres.forEach((libre, j) => {
      solucionParametrica.push(`x${libre + 1} = t${j}`);
    });

    // Devolver la solución paramétrica
    return {
      type: "infinite",
      solution: solucionParametrica,
      pivotVars: columnasConPivote,
      freeVars: columnasLibres,
      isHomogeneous: this.esHomogeneo,
      steps: this.pasos,
      explanation: explicacion + `\nVariables libres: ${columnasLibres.map(c => `x${c + 1}`).join(", ")}`,
    };
  }
}