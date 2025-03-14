
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/contexts/SettingsContext';
import { getTranslation } from '@/utils/translations';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import LanguageSelector from './LanguageSelector';
import ThemeSelector from './ThemeSelector';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const { 
    language, 
    autoScroll, 
    setAutoScroll, 
    soundEnabled, 
    setSoundEnabled,
    thinkingMode,
    setThinkingMode
  } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">
            {getTranslation('settings', language)}
          </DialogTitle>
          <DialogDescription>
            {/* No description needed */}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{getTranslation('theme', language)}</h3>
              <ThemeSelector />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">{getTranslation('language', language)}</h3>
              <LanguageSelector />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Preferences</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-scroll">{getTranslation('autoScroll', language)}</Label>
                  <p className="text-[0.8rem] text-muted-foreground">
                    {getTranslation('autoScroll', language)}
                  </p>
                </div>
                <Switch
                  id="auto-scroll"
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-enabled">{getTranslation('soundNotifications', language)}</Label>
                  <p className="text-[0.8rem] text-muted-foreground">
                    {getTranslation('soundNotifications', language)}
                  </p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="thinking-mode">{getTranslation('thinkingMode', language)}</Label>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Use Qwen model for more detailed responses
                  </p>
                </div>
                <Switch
                  id="thinking-mode"
                  checked={thinkingMode}
                  onCheckedChange={setThinkingMode}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {getTranslation('close', language)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
