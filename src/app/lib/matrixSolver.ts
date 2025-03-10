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
  isHomogeneous?: boolean; // Nueva propiedad para sistemas homogéneos
  steps: Step[];
  explanation: string;
};

export class EnhancedSolver {
  private steps: Step[] = [];
  private augmented: number[][];
  private precision: number;
  private epsilon: number;
  private isHomogeneous: boolean = true; // Asumimos que es homogéneo hasta comprobar lo contrario

  constructor(matrix: Matrix, vector: number[]) {
    // Validación básica de entrada
    if (matrix.length !== vector.length) {
      throw new Error("El número de filas de la matriz y vector no coinciden");
    }

    this.augmented = matrix.map((row, i) => [...row, vector[i]]);
    this.precision = 4;
    this.epsilon = 1e-10;
    
    // Comprobamos si es un sistema homogéneo (todos los términos independientes son cero)
    this.isHomogeneous = vector.every(val => this.isZero(val));
  }

  private round(value: number): number {
    return parseFloat(value.toFixed(this.precision));
  }

  private isZero(value: number): boolean {
    return Math.abs(value) < this.epsilon;
  }

  private recordStep(operation: string, description: string) {
    // Usar función flecha aquí para mantener el contexto 'this'
    const currentMatrix = this.augmented.map((row) =>
      row.slice(0, -1).map((val) => this.round(val))
    );
    const currentVector = this.augmented.map((row) =>
      this.round(row[row.length - 1])
    );

    this.steps.push({
      matrix: currentMatrix.map((row) => [...row]),
      vector: [...currentVector],
      operation,
      description,
    });
  }

  private getRank(matrix: Matrix): number {
    let rank = 0;
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;

    for (let i = 0; i < rows; i++) {
      let pivot = -1;
      for (let j = 0; j < cols; j++) {
        if (!this.isZero(matrix[i][j])) {
          pivot = j;
          break;
        }
      }
      if (pivot !== -1) rank++;
    }
    return rank;
  }

  public solve(): Solution {
    const rows = this.augmented.length;
    const cols = this.augmented[0]?.length - 1 || 0;
    let pivotRow = 0;

    for (let col = 0; col < cols && pivotRow < rows; col++) {
      // Pivoteo parcial
      let maxRow = pivotRow;
      for (let i = pivotRow; i < rows; i++) {
        if (
          Math.abs(this.augmented[i][col]) >
          Math.abs(this.augmented[maxRow][col])
        ) {
          maxRow = i;
        }
      }

      if (this.isZero(this.augmented[maxRow][col])) continue;

      if (maxRow !== pivotRow) {
        [this.augmented[pivotRow], this.augmented[maxRow]] = [
          this.augmented[maxRow],
          this.augmented[pivotRow],
        ];
        this.recordStep(
          "Pivoteo parcial",
          `Intercambio fila ${pivotRow + 1} con fila ${
            maxRow + 1
          } para obtener mejor pivote`
        );
      }

      // Normalizar fila pivote
      const pivotValue = this.augmented[pivotRow][col];
      for (let j = col; j <= cols; j++) {
        this.augmented[pivotRow][j] = this.round(
          this.augmented[pivotRow][j] / pivotValue
        );
      }
      this.recordStep(
        "Normalización",
        `Fila ${pivotRow + 1} dividida por ${this.round(
          pivotValue
        )} para pivote 1`
      );

      // Eliminación hacia adelante y atrás
      for (let i = 0; i < rows; i++) {
        if (i !== pivotRow && !this.isZero(this.augmented[i][col])) {
          const factor = this.augmented[i][col];
          for (let j = col; j <= cols; j++) {
            this.augmented[i][j] = this.round(
              this.augmented[i][j] - factor * this.augmented[pivotRow][j]
            );
          }
          this.recordStep(
            "Eliminación",
            `Fila ${i + 1} -= ${this.round(factor)} × Fila ${pivotRow + 1}`
          );
        }
      }
      pivotRow++;
    }

    const matrixRank = this.getRank(
      this.augmented.map((row) => row.slice(0, -1))
    );
    const augmentedRank = this.getRank(this.augmented);
    const explanation = this.generateExplanation(
      matrixRank,
      augmentedRank,
      cols
    );

    if (matrixRank < augmentedRank) {
      return {
        type: "no-solution",
        isHomogeneous: this.isHomogeneous,
        steps: this.steps,
        explanation,
      };
    }

    if (matrixRank < cols) {
      return this.handleInfiniteSolutions(matrixRank, explanation);
    }

    if (matrixRank === cols && matrixRank === rows) {
      return this.handleUniqueSolution(explanation);
    }

    return {
      type: "singular",
      isHomogeneous: this.isHomogeneous,
      steps: this.steps,
      explanation: "Matriz de coeficientes singular (no invertible)",
    };
  }

  private generateExplanation(
    matrixRank: number,
    augmentedRank: number,
    cols: number
  ): string {
    const equations = this.augmented.length;
    const variables = cols;

    let explanation = `Sistema de ${equations} ecuaciones con ${variables} variables\n`;
    explanation += `- Rango matriz coeficientes: ${matrixRank}\n`;
    explanation += `- Rango matriz aumentada: ${augmentedRank}\n`;
    
    // Agregar información sobre si el sistema es homogéneo
    if (this.isHomogeneous) {
      explanation += `- Sistema HOMOGÉNEO (todos los términos independientes son cero)\n`;
    } else {
      explanation += `- Sistema NO HOMOGÉNEO\n`;
    }

    if (matrixRank < augmentedRank) {
      explanation += "\n→ Sistema INCOMPATIBLE (sin solución)\n";
      explanation +=
        "Existen ecuaciones contradictorias (ej: 0 = valor no cero)";
    } else if (matrixRank === variables) {
      explanation += "\n→ Sistema COMPATIBLE DETERMINADO (solución única)\n";
      if (this.isHomogeneous) {
        explanation += "Sistema homogéneo con solución trivial (todos los valores son cero)";
      } else {
        explanation +=
          "El número de variables independientes igual al número de ecuaciones";
      }
    } else {
      explanation +=
        "\n→ Sistema COMPATIBLE INDETERMINADO (infinitas soluciones)\n";
      if (this.isHomogeneous) {
        explanation += "Sistema homogéneo con infinitas soluciones (incluye la solución trivial)\n";
      }
      explanation += `Variables libres: ${variables - matrixRank}`;
    }

    return explanation;
  }

  private handleUniqueSolution(explanation: string): Solution {
    const cols = this.augmented[0].length - 1;
    const solution: number[] = new Array(cols).fill(0);

    for (let i = this.augmented.length - 1; i >= 0; i--) {
      const pivotCol = this.augmented[i].findIndex((val) => !this.isZero(val));
      if (pivotCol === -1 || pivotCol === cols) continue;

      let sum = 0;
      for (let j = pivotCol + 1; j < cols; j++) {
        sum += this.augmented[i][j] * solution[j];
      }
      solution[pivotCol] = this.round(this.augmented[i][cols] - sum);
    }

    return {
      type: "unique",
      solution: solution.map((val) => this.round(val)),
      isHomogeneous: this.isHomogeneous,
      steps: this.steps,
      explanation,
    };
  }

  private handleInfiniteSolutions(rank: number, explanation: string): Solution {
    const cols = this.augmented[0].length - 1;
    const pivotCols: number[] = [];
    const freeCols: number[] = [];

    for (let col = 0, row = 0; col < cols; col++) {
      if (
        row < this.augmented.length &&
        !this.isZero(this.augmented[row][col])
      ) {
        pivotCols.push(col);
        row++;
      } else {
        freeCols.push(col);
      }
    }

    const parametricSolution = pivotCols.map((pivot, i) => {
      let expr = `${this.round(this.augmented[i][cols])}`;
      freeCols.forEach((free, j) => {
        const coeff = this.round(-this.augmented[i][free]);
        if (!this.isZero(coeff)) {
          expr += ` + (${coeff})·t${j}`;
        }
      });
      return `x${pivot + 1} = ${expr}`;
    });

    freeCols.forEach((free, j) => {
      parametricSolution.push(`x${free + 1} = t${j}`);
    });

    let homogeneousExplanation = "";
    if (this.isHomogeneous) {
      homogeneousExplanation = "\nSistema homogéneo: incluye la solución trivial (todos ceros) cuando los parámetros son cero";
    }

    return {
      type: "infinite",
      solution: parametricSolution,
      pivotVars: pivotCols,
      freeVars: freeCols,
      isHomogeneous: this.isHomogeneous,
      steps: this.steps,
      explanation:
        explanation +
        `\nVariables libres: ${freeCols.map((c) => `x${c + 1}`).join(", ")}` +
        homogeneousExplanation,
    };
  }
}