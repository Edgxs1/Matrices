type Matrix = number[][];
type Step = {
  matrix: Matrix;
  vector: number[];
  operation: string;
  description: string;
};
export type Solution = {
  type: "unique" | "infinite" | "no-solution" | "singular";
  solution?: number[] | string[];
  pivotVars?: number[];
  freeVars?: number[];
  isHomogeneous?: boolean;
  steps: Step[];
  explanation: string;
};

export class EnhancedSolver {
  private pasos: Step[] = [];
  private matrizAumentada: number[][];
  private precision: number;
  private epsilon: number;
  private esHomogeneo: boolean = true;

  constructor(matrix: Matrix, vector: number[]) {
    if (matrix.length !== vector.length) {
      throw new Error("El número de filas de la matriz y vector no coinciden");
    }

    this.matrizAumentada = matrix.map((fila, i) => [...fila, vector[i]]);
    this.precision = 4;
    this.epsilon = 1e-10;
    this.esHomogeneo = vector.every(val => this.esCero(val));
  }

  private round(valor: number): number {
    return parseFloat(valor.toFixed(this.precision));
  }

  private esCero(valor: number): boolean {
    return Math.abs(valor) < this.epsilon;
  }

  private recordStep(operacion: string, descripcion: string) {
    const matrizActual = this.matrizAumentada.map((fila) =>
      fila.slice(0, -1).map((val) => this.round(val))
    );
    const vectorActual = this.matrizAumentada.map((fila) =>
      this.round(fila[fila.length - 1])
    );

    this.pasos.push({
      matrix: matrizActual.map((fila) => [...fila]),
      vector: [...vectorActual],
      operation: operacion,
      description: descripcion,
    });
  }

  public solve(): Solution {
    const filas = this.matrizAumentada.length;
    const columnas = this.matrizAumentada[0]?.length - 1 || 0;
    let filaPivote = 0;

    // Eliminación Gaussiana
    for (let col = 0; col < columnas && filaPivote < filas; col++) {
      let filaMaxima = filaPivote;
      for (let i = filaPivote; i < filas; i++) {
        if (Math.abs(this.matrizAumentada[i][col]) > Math.abs(this.matrizAumentada[filaMaxima][col])) {
          filaMaxima = i;
        }
      }

      if (this.esCero(this.matrizAumentada[filaMaxima][col])) continue;

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

    // Detectar inconsistencias
    let tieneInconsistencia = false;
    for (const fila of this.matrizAumentada) {
      const coeficientes = fila.slice(0, -1);
      const constante = fila[fila.length - 1];
      if (coeficientes.every(c => this.esCero(c)) && !this.esCero(constante)) {
        tieneInconsistencia = true;
        break;
      }
    }

    if (tieneInconsistencia) {
      return {
        type: "no-solution",
        isHomogeneous: this.esHomogeneo,
        steps: this.pasos,
        explanation: this.generarExplicacionSinSolucion(),
      };
    }

    // Contar pivotes
    let pivotes = 0;
    for (const fila of this.matrizAumentada) {
      if (fila.slice(0, -1).some(c => !this.esCero(c))) pivotes++;
    }

    // Generar explicación base
    let explicacion = `Sistema de ${filas} ecuaciones con ${columnas} variables\n`;
    explicacion += this.esHomogeneo ? "- Sistema HOMOGÉNEO\n" : "- Sistema NO HOMOGÉNEO\n";

    if (pivotes === columnas) {
      explicacion += "\n→ Sistema COMPATIBLE DETERMINADO (solución única)\n";
      explicacion += this.esHomogeneo
        ? "Solución trivial única (todas las variables son cero)."
        : "Todas las variables tienen pivote.";
      return this.manejarSolucionUnica(explicacion);
    } else {
      explicacion += "\n→ Sistema COMPATIBLE INDETERMINADO (infinitas soluciones)\n";
      explicacion += `Variables libres: ${columnas - pivotes}`;
      if (this.esHomogeneo) {
        explicacion += "\nSistema homogéneo con soluciones no triviales.";
      }
      return this.manejarInfinitasSoluciones(explicacion);
    }
  }

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

  private manejarSolucionUnica(explicacion: string): Solution {
    const columnas = this.matrizAumentada[0].length - 1;
    const solucion: number[] = new Array(columnas).fill(0);

    for (let i = this.matrizAumentada.length - 1; i >= 0; i--) {
      const columnaPivote = this.matrizAumentada[i].findIndex((val) => !this.esCero(val));
      if (columnaPivote === -1 || columnaPivote === columnas) continue;

      let suma = 0;
      for (let j = columnaPivote + 1; j < columnas; j++) {
        suma += this.matrizAumentada[i][j] * solucion[j];
      }
      solucion[columnaPivote] = this.round(this.matrizAumentada[i][columnas] - suma);
    }

    return {
      type: "unique",
      solution: solucion.map((val) => this.round(val)),
      isHomogeneous: this.esHomogeneo,
      steps: this.pasos,
      explanation: explicacion,
    };
  }

  private manejarInfinitasSoluciones(explicacion: string): Solution {
    const columnas = this.matrizAumentada[0].length - 1;
    const columnasConPivote: number[] = [];
    const columnasLibres: number[] = [];
    let filaActualPivote = 0;

    for (let col = 0; col < columnas; col++) {
      if (
        filaActualPivote < this.matrizAumentada.length &&
        !this.esCero(this.matrizAumentada[filaActualPivote][col])
      ) {
        columnasConPivote.push(col);
        filaActualPivote++;
      } else {
        columnasLibres.push(col);
      }
    }

    const solucionParametrica = columnasConPivote.map((pivote, i) => {
      let expresion = `${this.round(this.matrizAumentada[i][columnas])}`;
      columnasLibres.forEach((libre, j) => {
        const coef = this.round(-this.matrizAumentada[i][libre]);
        if (!this.esCero(coef)) {
          expresion += ` + (${coef})·t${j}`;
        }
      });
      return `x${pivote + 1} = ${expresion}`;
    });

    columnasLibres.forEach((libre, j) => {
      solucionParametrica.push(`x${libre + 1} = t${j}`);
    });

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