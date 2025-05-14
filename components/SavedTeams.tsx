import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pokemon } from '@/types/pokemon'

interface SavedTeamsProps {
  currentTeam: Pokemon[]
  onLoadTeam: (team: Pokemon[]) => void
}

interface SavedTeam {
  name: string
  team: Pokemon[]
}

export function SavedTeams({ currentTeam, onLoadTeam }: SavedTeamsProps) {
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([])
  const [teamName, setTeamName] = useState('')

  useEffect(() => {
    const storedTeams = localStorage.getItem('savedTeams')
    if (storedTeams) {
      setSavedTeams(JSON.parse(storedTeams))
    }
  }, [])

  const saveTeam = () => {
    if (teamName && currentTeam.length > 0) {
      const newTeam: SavedTeam = { name: teamName, team: currentTeam }
      const updatedTeams = [...savedTeams, newTeam]
      setSavedTeams(updatedTeams)
      localStorage.setItem('savedTeams', JSON.stringify(updatedTeams))
      setTeamName('')
    }
  }

  const loadTeam = (team: Pokemon[]) => {
    onLoadTeam(team)
  }

  const deleteTeam = (index: number) => {
    const updatedTeams = savedTeams.filter((_, i) => i !== index)
    setSavedTeams(updatedTeams)
    localStorage.setItem('savedTeams', JSON.stringify(updatedTeams))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Teams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <Button onClick={saveTeam}>Save Current Team</Button>
        </div>
        <div className="space-y-2">
          {savedTeams.map((savedTeam, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <span>{savedTeam.name}</span>
              <div>
                <Button onClick={() => loadTeam(savedTeam.team)} className="mr-2">Load</Button>
                <Button onClick={() => deleteTeam(index)} variant="destructive">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

