"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { DialogTitle } from "@/components/ui/dialog"
import { useSwap } from "@/contexts/SwapContext"

interface SettingsContentProps {
    isMobile?: boolean
}

export default function SettingsContent({
    isMobile = false
}: SettingsContentProps) {

    const { settings, updateSettings } = useSwap()
    const handleInputChange = (field: string, value: string | number | boolean) => {
        updateSettings({ [field]: value })
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            {isMobile ? (
                <DrawerHeader className="text-left border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <DrawerTitle>Settings</DrawerTitle>
                    </div>
                </DrawerHeader>
            ) : (
                <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                    <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
                </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-sm font-medium">
                        Swap Deadline (minutes)
                    </Label>
                    <Input
                        id="deadline"
                        type="number"
                        value={settings.swapDeadline}
                        onChange={(e) => handleInputChange('swapDeadline', parseInt(e.target.value))}
                        placeholder="30"
                        className="h-9"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="recipient" className="text-sm font-medium">
                        Custom Recipient
                    </Label>
                    <Input
                        id="recipient"
                        value={settings.customRecipient}
                        onChange={(e) => handleInputChange('customRecipient', e.target.value)}
                        placeholder="0x..."
                        className="h-9"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="hook"
                        checked={settings.enableHook}
                        onCheckedChange={(checked) => handleInputChange('enableHook', checked)}
                    />
                    <Label htmlFor="hook" className="text-sm font-medium">
                        Enable Hook
                    </Label>
                </div>

                {settings.enableHook && (
                    <>
                        <Separator />
                        <p className="text-sm text-gray-400 mb-4">
                            Call any smart contract with your own parameters
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="target" className="text-sm font-medium">
                                Target
                            </Label>
                            <Input
                                id="target"
                                value={settings.hookTarget}
                                onChange={(e) => handleInputChange('hookTarget', e.target.value)}
                                placeholder="Contract address (0x...)"
                                className="h-9"
                            />
                        </div>

                        {/*  <div className="space-y-2">
                            <Label htmlFor="gasLimit" className="text-sm font-medium">
                                Gas Limit
                            </Label>
                            <Input
                                id="gasLimit"
                                type="number"
                                value={settings.gasLimit}
                                onChange={(e) => handleInputChange('gasLimit', parseInt(e.target.value) || 21000)}
                                placeholder="21000"
                                className="h-9"
                            />
                        </div> */}

                        <div className="space-y-2">
                            <Label htmlFor="calldata" className="text-sm font-medium">
                                Calldata
                            </Label>
                            <Textarea
                                id="calldata"
                                value={settings.calldata}
                                onChange={(e) => handleInputChange('calldata', e.target.value)}
                                placeholder="Enter calldata here..."
                                className="min-h-[80px]"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
