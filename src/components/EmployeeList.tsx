// src/components/employees/My_EmployeeList.tsx
 

type Employee = {
  id: number
  name: string
  email: string
  phone: string
  position: string
  salary: number
  joinDate: string
  status: string
  avatar: string
}

type Props = {
  employees: Employee[]
}

export function My_EmployeeList({ employees }: Props) {
  return (
    <div className="space-y-4">
      {employees.map((emp) => (
        <div key={emp.id} className="flex items-center gap-4 p-4 border rounded-md bg-white">
          <img src={emp.avatar} alt={emp.name} className="h-10 w-10 rounded-full" />
          <div>
            <p className="font-semibold">{emp.name}</p>
            <p className="text-sm text-gray-500">{emp.position} • {emp.email}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
