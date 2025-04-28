'use client'

import { useEffect, useRef } from 'react'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'

interface Materia {
  id: number
  clave: string
  nombre: string
  horas_clase: number
  horas_taller: number
  horas_lab: number
  hpc: number
  hcl: number
  he: number
  creditos: number
}

interface SelectMateriasProps {
  materias: Materia[]
  value?: number[]
  onChange?: (selectedIds: number[]) => void
  placeholder?: string
  multiple?: boolean
}

export default function SelectMaterias({
  materias,
  value = [],
  onChange,
  placeholder = 'Seleccione materias...',
  multiple = true
}: SelectMateriasProps) {
  const selectRef = useRef<HTMLSelectElement>(null)
  const tomSelectRef = useRef<TomSelect | null>(null)

  // Inicializar TomSelect solo una vez
  useEffect(() => {
    if (!selectRef.current) return

    tomSelectRef.current = new TomSelect(selectRef.current, {
      options: materias.map(materia => ({
        id: materia.id,
        nombre: materia.clave ? `${materia.clave} - ${materia.nombre}` : materia.nombre,
      })),
      items: value.map(String),
      valueField: 'id',
      labelField: 'nombre',
      searchField: ['nombre', 'clave'],
      create: false,
      placeholder,
      closeAfterSelect: !multiple,
      maxItems: multiple ? null : 1,
      plugins: multiple ? ['remove_button'] : [],
      onChange: (selected: string | string[]) => {
        const selectedArray = Array.isArray(selected) ? selected : [selected]
        const ids = selectedArray.map(id => parseInt(id))
        onChange?.(ids)
      }
    })

    return () => {
      tomSelectRef.current?.destroy()
      tomSelectRef.current = null
    }
  }, [])

  // Actualizar opciones si cambian las materias
  useEffect(() => {
    if (tomSelectRef.current) {
      tomSelectRef.current.clearOptions()
      tomSelectRef.current.addOptions(
        materias.map(materia => ({
          id: materia.id,
          nombre: materia.clave ? `${materia.clave} - ${materia.nombre}` : materia.nombre,
        }))
      )
      tomSelectRef.current.refreshOptions()
    }
  }, [materias])

  // Sincronizar valores desde fuera
  useEffect(() => {
    if (tomSelectRef.current && value) {
      const currentValue = tomSelectRef.current.getValue()
      const newValue = value.map(String)
      if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
        tomSelectRef.current.setValue(newValue)
      }
    }
  }, [value])

  return (
    <select
      ref={selectRef}
      multiple={multiple}
      className="w-full"
      name="materias"
    />
  )
}
