"use client"

import { useState, useRef, useEffect } from "react"

type Step = {
  operation: string
  description: string
  matrix: number[][]
  vector: number[]
}

export const SolutionSteps = ({ steps }: { steps: Step[] }) => {
  const [expanded, setExpanded] = useState(false)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  
  // Referencias para los elementos de cada paso
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  
  // Inicializar las referencias del array
  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, steps.length)
  }, [steps.length])
  
  // Función para manejar el clic en un botón de paso
  const handleStepClick = (index: number) => {
    // Cambiar el paso activo
    setActiveStep(activeStep === index ? null : index)
    
    // Si el paso ya está expandido, desplazar hacia el elemento
    if (expanded && stepRefs.current[index]) {
      setTimeout(() => {
        stepRefs.current[index]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100) // Pequeño retraso para permitir cualquier renderizado
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-300">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
      >
        <span className="text-lg">{expanded ? "Ocultar" : "Mostrar"} detalles del proceso</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          <div className="flex overflow-x-auto pb-4 mb-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-700 dark:scrollbar-track-gray-800">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeStep === index
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600"
                  }`}
                >
                  Paso {index + 1}
                </button>
              ))}
            </div>
          </div>

          {steps.map((step, index) => (
            <div
              key={index}
              ref={el => { stepRefs.current[index] = el }}
              className={`bg-white dark:bg-gray-700 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 transition-all duration-300 ${
                activeStep === null || activeStep === index ? "opacity-100" : "opacity-50"
              }`}
              id={`step-${index}`}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-lg flex items-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-2">
                      {index + 1}
                    </span>
                    {step.operation}
                  </h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                    Operación {index + 1} de {steps.length}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-10">{step.description}</p>
              </div>

              <div className="grid md:grid-cols-[auto_1fr] gap-6">
                <div className="space-y-3 overflow-x-auto">
                  <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Matriz aumentada:
                  </span>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    {step.matrix.map((row, i) => (
                      <div key={i} className="flex gap-2 mb-2 last:mb-0">
                        {row.map((num, j) => (
                          <span
                            key={j}
                            className="w-16 text-right px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 font-mono"
                          >
                            {num}
                          </span>
                        ))}
                        <span className="px-2 text-gray-400 dark:text-gray-500 flex items-center">|</span>
                        <span className="w-16 text-right px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded text-blue-800 dark:text-blue-300 font-mono">
                          {step.vector[i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Explicación:</h4>
                  <p>{getStepExplanation(step)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  function getStepExplanation(step: Step): string {
    if (step.operation.includes("Pivoteo")) {
      return "Se selecciona el elemento con mayor valor absoluto en la columna actual como pivote para mejorar la estabilidad numérica."
    }

    if (step.operation.includes("Eliminación")) {
      // Buscar específicamente el patrón "Fila X"
      const filaMatch = step.description.match(/Fila (\d+)/)
      if (filaMatch && filaMatch[1]) {
        const fila = filaMatch[1]
        return `Se elimina la variable de la fila ${fila} mediante combinación lineal con la fila pivote.`
      }
    }

    return "Operación estándar de eliminación gaussiana."
  }
}