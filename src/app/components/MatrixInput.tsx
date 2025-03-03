import type { Dispatch, SetStateAction } from "react"

interface MatrixInputProps {
  rows: number
  cols: number
  matrix: string[][]
  onChange: Dispatch<SetStateAction<string[][]>>
}

const MatrixInput = ({ rows, cols, matrix, onChange }: MatrixInputProps) => {
  const handleChange = (row: number, col: number, value: string) => {
    const newMatrix = matrix.map((r, i) => (i === row ? r.map((c, j) => (j === col ? value : c)) : r))
    onChange(newMatrix)
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid gap-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="text-gray-400 dark:text-gray-500 text-sm font-medium w-6 text-right">{i + 1}</div>
              {Array.from({ length: cols }).map((_, j) => (
                <div key={`${i}-${j}`} className="relative group">
                  <input
                    type="number"
                    className="w-16 h-12 text-center border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 
                              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none
                              transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700"
                    value={matrix[i]?.[j] || ""}
                    onChange={(e) => handleChange(i, j, e.target.value)}
                    placeholder="0"
                  />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    a
                    <sub>
                      {i + 1},{j + 1}
                    </sub>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MatrixInput

