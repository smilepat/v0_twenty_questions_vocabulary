"use client"

import { useEffect, useRef } from "react"

interface GameVisualizerProps {
  totalWords: number
  completedWords: string[]
  currentWord: string
  currentWordIndex: number
  questionsLeft: number
  topic: string
}

export function GameVisualizer({
  totalWords,
  completedWords,
  currentWord,
  currentWordIndex,
  questionsLeft,
  topic,
}: GameVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = "#f5f5f5"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw topic name
    ctx.fillStyle = "#000000"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(topic, canvas.width / 2, 30)

    // Draw progress path
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 60

    // Draw path
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 15
    ctx.stroke()

    // Draw completed progress
    if (totalWords > 0) {
      const completionRatio = completedWords.length / totalWords
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * completionRatio)
      ctx.strokeStyle = "#22c55e" // Green
      ctx.lineWidth = 15
      ctx.stroke()
    }

    // Draw word nodes
    const angleStep = (2 * Math.PI) / totalWords

    for (let i = 0; i < totalWords; i++) {
      const angle = -Math.PI / 2 + i * angleStep
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      // Draw node
      ctx.beginPath()
      ctx.arc(x, y, 15, 0, 2 * Math.PI)

      if (i < completedWords.length) {
        // Completed word
        ctx.fillStyle = "#22c55e" // Green
      } else if (i === currentWordIndex) {
        // Current word
        ctx.fillStyle = "#3b82f6" // Blue
      } else {
        // Future word
        ctx.fillStyle = "#d1d5db" // Gray
      }

      ctx.fill()

      // Add word number
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText((i + 1).toString(), x, y)
    }

    // Draw current word info in center
    if (currentWord) {
      // Draw questions left indicator
      const questionRatio = questionsLeft / 20
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius - 40, 0, 2 * Math.PI * questionRatio)
      ctx.strokeStyle = questionRatio > 0.5 ? "#3b82f6" : questionRatio > 0.25 ? "#f59e0b" : "#ef4444"
      ctx.lineWidth = 8
      ctx.stroke()

      // Draw text
      ctx.fillStyle = "#000000"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`Word ${currentWordIndex + 1}`, centerX, centerY - 15)

      ctx.font = "12px sans-serif"
      ctx.fillText(`${questionsLeft} questions left`, centerX, centerY + 15)
    }

    // Draw completion stats
    ctx.fillStyle = "#000000"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${completedWords.length} of ${totalWords} words completed`, centerX, canvas.height - 20)
  }, [totalWords, completedWords, currentWord, currentWordIndex, questionsLeft, topic])

  return (
    <div className="relative aspect-square w-full">
      <canvas ref={canvasRef} className="h-full w-full rounded-lg" />
    </div>
  )
}
