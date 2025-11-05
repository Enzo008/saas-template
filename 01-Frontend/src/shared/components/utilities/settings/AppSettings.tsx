/**
 * AppSettings.tsx
 * Componente principal de configuración de la aplicación
 * 
 * Usa el modal estándar de la aplicación con:
 * - Sidebar de categorías
 * - Panel principal de configuración
 * - Vista previa en tiempo real
 */

import { useState } from "react"
import { Palette, Type, Monitor, RotateCcw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import { Badge } from "@/shared/components/ui/badge"
import { Switch } from "@/shared/components/ui/switch"
import { Label } from "@/shared/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { useAppConfig } from "@/shared/providers"
import { cn } from "@/lib/utils"    
import Modal from "@/shared/components/overlays/modal/Modal"

interface SettingsCategory {
    id: string
    name: string
    icon: React.ComponentType<{ className?: string | undefined }>
    description: string
}

const SETTINGS_CATEGORIES: SettingsCategory[] = [
    {
        id: 'appearance',
        name: 'Apariencia',
        icon: Palette,
        description: 'Personaliza colores y tema'
    },
    {
        id: 'typography',
        name: 'Tipografía',
        icon: Type,
        description: 'Configura fuentes y tamaños'
    },
    {
        id: 'display',
        name: 'Pantalla',
        icon: Monitor,
        description: 'Opciones de visualización'
    }
]

interface AppSettingsProps {
    isOpen: boolean
    onClose: () => void
}

export function AppSettings({ isOpen, onClose }: AppSettingsProps) {
    const [activeCategory, setActiveCategory] = useState('appearance')
    const {
        config,
        availablePalettes,
        availableFonts,
        updateConfig,
        resetConfig,

    } = useAppConfig()

    const renderAppearanceSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-3">Paleta de Colores</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Elige una paleta de colores que se adapte a tu estilo
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePalettes.map((palette) => (
                        <Card
                            key={palette.id}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                config.colorPalette === palette.id && "ring-2 ring-primary"
                            )}
                            onClick={() => updateConfig({ colorPalette: palette.id })}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                        style={{ backgroundColor: palette.preview }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{palette.name}</span>
                                            {config.colorPalette === palette.id && (
                                                <Badge variant="secondary" className="text-xs">Activo</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {palette.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Preview de colores */}
                                <div className="flex gap-1 mt-3">
                                    <div
                                        className="w-4 h-4 rounded-sm"
                                        style={{ backgroundColor: palette.light.primary }}
                                    />
                                    <div
                                        className="w-4 h-4 rounded-sm"
                                        style={{ backgroundColor: palette.light.secondary }}
                                    />
                                    <div
                                        className="w-4 h-4 rounded-sm"
                                        style={{ backgroundColor: palette.light.accent }}
                                    />
                                    <div
                                        className="w-4 h-4 rounded-sm border"
                                        style={{ backgroundColor: palette.light.background }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderTypographySettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-3">Fuente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Selecciona la fuente que prefieras para la interfaz
                </p>

                <RadioGroup
                    value={config.fontConfig}
                    onValueChange={(value) => updateConfig({ fontConfig: value })}
                    className="space-y-3"
                >
                    {availableFonts.map((font) => (
                        <div key={font.id} className="flex items-center space-x-3">
                            <RadioGroupItem value={font.id} id={font.id} />
                            <Label
                                htmlFor={font.id}
                                className="flex-1 cursor-pointer"
                                style={{ fontFamily: `${font.fontFamily}, ${font.fallback}` }}
                            >
                                <div>
                                    <div className="font-medium">{font.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {font.description}
                                    </div>
                                </div>
                            </Label>
                            {font.googleFont && (
                                <Badge variant="outline" className="text-xs">Google Font</Badge>
                            )}
                        </div>
                    ))}
                </RadioGroup>
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-semibold mb-3">Tamaño de Fuente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Ajusta el tamaño base del texto
                </p>

                <RadioGroup
                    value={config.fontSize}
                    onValueChange={(value: 'small' | 'medium' | 'large') => updateConfig({ fontSize: value })}
                    className="space-y-3"
                >
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="small" id="small" />
                        <Label htmlFor="small" className="flex-1 cursor-pointer">
                            <span className="text-sm">Pequeño (14px)</span>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="flex-1 cursor-pointer">
                            <span className="text-base">Mediano (16px)</span>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="large" id="large" />
                        <Label htmlFor="large" className="flex-1 cursor-pointer">
                            <span className="text-lg">Grande (18px)</span>
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    )

    const renderDisplaySettings = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Modo Compacto</h3>
                    <p className="text-sm text-muted-foreground">
                        Reduce el espaciado para mostrar más contenido
                    </p>
                </div>
                <Switch
                    checked={config.compactMode}
                    onCheckedChange={(checked) => updateConfig({ compactMode: checked })}
                />
            </div>
        </div>
    )

    const renderContent = () => {
        switch (activeCategory) {
            case 'appearance':
                return renderAppearanceSettings()
            case 'typography':
                return renderTypographySettings()
            case 'display':
                return renderDisplaySettings()
            default:
                return null
        }
    }

    return (
        <Modal
            modalVisible={isOpen}
            onClose={onClose}
            title="Configuración de la Aplicación"
            size="xl"
            maxWidth="1200px"
        >
            <div className="flex h-[600px]">
                {/* Sidebar */}
                <div className="w-64 border-r bg-muted/30 p-4">
                    <nav className="space-y-2">
                        {SETTINGS_CATEGORIES.map((category) => {
                            const Icon = category.icon
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                                        activeCategory === category.id
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">{category.name}</div>
                                        <div className="text-xs opacity-70">{category.description}</div>
                                    </div>
                                </button>
                            )
                        })}
                    </nav>

                    <Separator className="my-4" />

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetConfig}
                        className="w-full"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restablecer
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-2xl">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </Modal>
    )
}