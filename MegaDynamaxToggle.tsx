import React from 'react';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface MegaDynamaxToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export function MegaDynamaxToggle({ isEnabled, onToggle }: MegaDynamaxToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="mega-dynamax-mode" checked={isEnabled} onCheckedChange={onToggle} />
      <Label htmlFor="mega-dynamax-mode">Mega/Dynamax</Label>
    </div>
  );
}

