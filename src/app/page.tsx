"use client"
import { useState, useEffect } from "react"
import { EnhancedSolver, type Solution as SolverSolution } from "./lib/matrixSolver"
import MatrixInput from "./components/MatrixInput"
import { SolutionSteps } from "./components/SolutionSteps"
//import { MoonIcon, SunIcon } from "lucide-react"
//import { useDarkMode } from "./hooks/useDarkMode"

type Solution = SolverSolution

export default function EquationSolver() {
  //const { darkMode, toggleDarkMode } = useDarkMode()
  const [rows, setRows] = useState(2)
  const [cols, setCols] = useState(2)
  const [matrix, setMatrix] = useState<string[][]>(
    Array(rows)
      .fill("")
      .map(() => Array(cols).fill("")),
  )
  const [vector, setVector] = useState<string[]>(Array(rows).fill(""))
  const [result, setResult] = useState<Solution | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {}, [])

  const handleSolve = () => {
    setIsLoading(true)
    setResult(null)
    try {
      const numericMatrix = matrix.map((row) => row.map(Number))
      const numericVector = vector.map(Number)

      const solver = new EnhancedSolver(numericMatrix, numericVector)
      const solution = solver.solve()
      setResult(solution)
    } catch (error) {
      setResult({
        type: "singular",
        explanation: "Error en el cálculo: " + (error as Error).message,
        steps: [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const allFieldsFilled = matrix.flat().every((c) => c !== "") && vector.every((v) => v !== "")

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with theme toggle */}
        {/*<div className="flex justify-between items-center mb-8">
          <div className="flex-1"></div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300"
            aria-label="Toggle dark mode"

          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-blue-600" />
            )}
          </button>
        </div>*/}

        {/* Main content card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
          {/* Hero section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              Solucionador de Sistemas Lineales
            </h1>
            {/*<p className="text-blue-100 text-center max-w-2xl mx-auto">
              Resuelve sistemas de ecuaciones lineales de cualquier tamaño utilizando el método de eliminación gaussiana
              con pivoteo parcial.
            </p>*/}
          </div>

          {/* Main form */}
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium">Ecuaciones (filas)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={rows}
                    onChange={(e) => {
                      const newRows = Math.max(1, Number.parseInt(e.target.value) || 1)
                      setRows(newRows)
                      setMatrix((prev) =>
                        Array(newRows)
                          .fill("")
                          .map((_, i) => prev[i]?.slice(0, cols) || Array(cols).fill("")),
                      )
                      setVector((prev) => [
                        ...prev.slice(0, newRows),
                        ...Array(Math.max(0, newRows - prev.length)).fill(""),
                      ])
                    }}
                    className="p-3 border dark:border-gray-600 rounded-lg w-full text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-8 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">filas</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium">Variables (columnas)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={cols}
                    onChange={(e) => {
                      const newCols = Math.max(1, Number.parseInt(e.target.value) || 1)
                      setCols(newCols)
                      setMatrix((prev) =>
                        prev.map((row) => [
                          ...row.slice(0, newCols),
                          ...Array(Math.max(0, newCols - row.length)).fill(""),
                        ]),
                      )
                    }}
                    className="p-3 border dark:border-gray-600 rounded-lg w-full text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-8 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">columnas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <span className="inline-block w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-2 flex items-center justify-center text-center">
                    A
                  </span>
                  Coeficientes de la Matriz
                </h2>
                <div className="bg-blue-50 dark:bg-gray-700/50 rounded-xl p-4 border border-blue-100 dark:border-gray-600 transition-all duration-300">
                  <MatrixInput rows={rows} cols={cols} matrix={matrix} onChange={setMatrix} />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <span className="inline-block w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-2 flex items-center justify-center text-center">
                    b
                  </span>
                  Términos Independientes
                </h2>
                <div className="bg-purple-50 dark:bg-gray-700/50 rounded-xl p-4 border border-purple-100 dark:border-gray-600 transition-all duration-300">
                  <div className="grid gap-3">
                    {Array.from({ length: rows }).map((_, i) => (
                      <input
                        key={i}
                        type="number"
                        className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 transition-all duration-200"
                        value={vector[i] || ""}
                        onChange={(e) => {
                          const newVector = [...vector]
                          newVector[i] = e.target.value
                          setVector(newVector)
                        }}
                        placeholder="0"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-10">
              <button
                onClick={handleSolve}
                disabled={!allFieldsFilled || isLoading}
                className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  allFieldsFilled && !isLoading
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Calculando...
                  </span>
                ) : (
                  "Resolver Sistema"
                )}
              </button>
            </div>

            {result && (
              <div className="mt-8 space-y-8 animate-fadeIn">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl shadow-sm transition-all duration-300">
                  <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-3">Análisis del Sistema</h2>
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
                    {result.explanation}
                  </pre>
                </div>

                {result.type === "no-solution" && (
                  <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm transition-all duration-300">
                    <div className="flex items-center">
                      <svg className="w-8 h-8 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-lg font-medium">Sistema incompatible: No existe solución</span>
                    </div>
                  </div>
                )}

                {result.type === "unique" && (
                  <div className="space-y-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm transition-all duration-300">
                    <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Solución Única
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {(result.solution as number[]).map((val, i) => (
                        <div
                          key={i}
                          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800/50 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Variable</span>
                          <div className="flex items-baseline">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              x<sub>{i + 1}</sub> ={" "}
                            </span>
                            <span className="text-xl font-bold ml-2 text-gray-800 dark:text-gray-200">{val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.type === "infinite" && (
                  <div className="space-y-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50 shadow-sm transition-all duration-300">
                    <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Solución Paramétrica (Infinitas Soluciones)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(result.solution as string[]).map((eq, i) => (
                        <div
                          key={i}
                          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="font-mono text-sm text-blue-700 dark:text-blue-300">{eq}</div>
                          {i >= (result.pivotVars?.length || 0) && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded inline-block">
                              Variable libre
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                      <h4 className="text-sm font-medium mb-2 text-yellow-800 dark:text-yellow-300">
                        Parámetros libres:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.freeVars?.map((v, i) => (
                          <span
                            key={v}
                            className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800/50 text-sm shadow-sm"
                          >
                            t<sub>{i}</sub> = x<sub>{v + 1}</sub>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <SolutionSteps steps={result.steps} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Para el 10 en Algebra Lineal {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}

