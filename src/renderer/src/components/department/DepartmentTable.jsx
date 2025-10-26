"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function DepartmentTable({ departments, onEdit, onDelete }) {
  return (
    <Card className="p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Code</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.id} className="border-b">
              <td className="p-2">{d.name}</td>
              <td className="p-2">{d.code}</td>
              <td className="p-2 space-x-2">
                <Button size="sm" onClick={() => onEdit(d)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(d)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
