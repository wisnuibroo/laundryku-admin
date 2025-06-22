 

import { useEffect } from "react"

type Props = {
  isOpen: boolean
  onOpenChange: (val: boolean) => void
  newEmployee: {
    name: string
    email: string
    phone: string
    position: string
    salary: string
  }
  setNewEmployee: (val: any) => void
}

export function My_EmployeeDialog({
  isOpen,
  onOpenChange,
  newEmployee,
  setNewEmployee,
}: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onOpenChange])

  if (!isOpen) return (
    <button
      onClick={() => onOpenChange(true)}
      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
    >
      + Tambah Karyawan
    </button>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={() => onOpenChange(false)} />
      <div className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tambah Karyawan Baru</h2>
          <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-black">×</button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            console.log("Simpan karyawan:", newEmployee)
            onOpenChange(false)
          }}
        >
          <input
            type="text"
            placeholder="Nama"
            className="w-full border px-3 py-2 rounded"
            value={newEmployee.name}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, name: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded"
            value={newEmployee.email}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, email: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="No. Telepon"
            className="w-full border px-3 py-2 rounded"
            value={newEmployee.phone}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, phone: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Posisi"
            className="w-full border px-3 py-2 rounded"
            value={newEmployee.position}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, position: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Gaji"
            className="w-full border px-3 py-2 rounded"
            value={newEmployee.salary}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, salary: e.target.value })
            }
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Simpan
          </button>
        </form>
      </div>
    </>
  )
}
