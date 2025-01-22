import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pokemon } from '@/types/pokemon'
import { toast } from '@/components/ui/use-toast'
import { Clipboard } from 'lucide-react'

interface TeamSharingProps {
  currentTeam: Pokemon[]
  onImportTeam: (team: Pokemon[]) => void
}

export function TeamSharing({ currentTeam, onImportTeam }: TeamSharingProps) {
  const [shareableCode, setShareableCode] = useState('')
  const [importCode, setImportCode] = useState('')

  const generateShareableCode = () => {
    const teamData = JSON.stringify(currentTeam)
    const encodedTeam = btoa(teamData)
    setShareableCode(encodedTeam)
    toast({
      title: "Shareable code generated",
      description: "Use the 'Copy' button to copy the code to your clipboard.",
    })
  }

  const importTeam = () => {
    try {
      const decodedTeam = atob(importCode)
      const importedTeam = JSON.parse(decodedTeam) as Pokemon[]
      onImportTeam(importedTeam)
      setImportCode('')
      toast({
        title: "Team imported successfully",
        description: "The imported team has been added to your current team.",
      })
    } catch (error) {
      console.error('Error importing team:', error)
      toast({
        title: "Error importing team",
        description: "The provided code is invalid. Please check and try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Sharing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Button onClick={generateShareableCode} disabled={currentTeam.length === 0}>
              Generate Shareable Code
            </Button>
            {shareableCode && (
              <div className="mt-2 flex items-center">
                <Input value={shareableCode} readOnly className="flex-grow" />
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareableCode)
                    toast({
                      title: "Code copied",
                      description: "The shareable code has been copied to your clipboard.",
                    })
                  }} 
                  className="ml-2"
                >
                  <Clipboard className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            )}
          </div>
          <div>
            <Input
              type="text"
              placeholder="Enter team code"
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
            />
            <Button onClick={importTeam} className="mt-2" disabled={!importCode}>
              Import Team
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

