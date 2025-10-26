// "use client"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function DepartmentForm({ onSubmit, defaultValues }) {
  const { register, handleSubmit } = useForm({ defaultValues })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md"
    >
      <div>
        <Label htmlFor="name">Department Name</Label>
        <Input id="name" {...register("name", { required: true })} />
      </div>

      <div>
        <Label htmlFor="code">Department Code</Label>
        <Input id="code" {...register("code", { required: true })} />
      </div>

      <Button type="submit">Save</Button>
    </form>
  )
}
