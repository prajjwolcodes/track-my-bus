import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useState } from "react"

function MPINComponent({
    onSubmit,
    loading,
}: {
    onSubmit: (mpin: string) => void
    loading: boolean
}) {
    const [mpin, setMpin] = useState("")

    return (
        <div className="space-y-4">
            <Label>Enter your MPIN</Label>
            <Input
                type="password"
                placeholder="Enter MPIN"
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
            />
            <Button
                className="w-full rounded-xl"
                onClick={() => onSubmit(mpin)}
                disabled={loading}
            >
                {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Login
            </Button>
        </div>
    )
}

export default MPINComponent

