/**
 * Selector de templates de campos predefinidos
 */

import { useState } from 'react';
import Modal from '@/shared/components/overlays/modal/Modal';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { 
  templateCategories, 
  getTemplatesByCategory, 
  type FieldTemplate 
} from '../config/fieldTemplates';

interface FieldTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: FieldTemplate) => void;
  triggerElement?: HTMLElement | null;
}

export const FieldTemplateSelector = ({
  isOpen,
  onClose,
  onSelectTemplate,
  triggerElement
}: FieldTemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState('basic');

  const handleTemplateSelect = (template: FieldTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Modal
      modalVisible={isOpen}
      onClose={onClose}
      title="Templates de Campos"
      size="xl"
      triggerElement={triggerElement}
    >
      <div className="p-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <div className="px-6 pb-4">
              <TabsList className="grid w-full grid-cols-5">
                {templateCategories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center gap-1 text-xs"
                  >
                    <span>{category.icon}</span>
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {templateCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="px-6 pb-2">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-[400px] px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                    {getTemplatesByCategory(category.id).map((template) => (
                      <Card 
                        key={template.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{template.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {template.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {template.template.forFieTyp}
                                </Badge>
                                {template.template.forFieReq && (
                                  <Badge variant="destructive" className="text-xs">
                                    Requerido
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  Col: {template.template.forFieCol}
                                </Badge>
                              </div>

                              <div className="text-xs text-muted-foreground">
                                <div className="truncate">
                                  <strong>Campo:</strong> {template.template.forFieNam}
                                </div>
                                <div className="truncate">
                                  <strong>Etiqueta:</strong> {template.template.forFieLab}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
      </div>
    </Modal>
  );
}