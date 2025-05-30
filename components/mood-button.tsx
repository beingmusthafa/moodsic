"use client"

import { useState } from "react"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function MoodButton() {
  const [showDialog, setShowDialog] = useState(false)

  const handleMoodClick = () => {
    setShowDialog(true)
  }

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-20 right-6 z-40 h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 md:bottom-6"
        onClick={handleMoodClick}
      >
        <Camera className="h-6 w-6" />
        <span className="sr-only">Detect mood</span>
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              Please login to use this feature. You'll be able to take a photo and get music recommendations based on
              your mood.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowDialog(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
