// src/components/employees/My_EmployeeSearch.tsx
 

type Props = {
  value: string
  onChange: (val: string) => void
}

export function My_EmployeeSearch({ value, onChange }: Props) {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari karyawan..."
        className="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>
  )
}
