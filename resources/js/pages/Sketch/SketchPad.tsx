import React, { useRef, useEffect, useState } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Undo, Redo } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Sketch Pad', href: route('sketch') },
];


const colorOptions = [
  { name: 'Primary', value: '#3b82f6', tw: 'bg-primary' },
  { name: 'Secondary', value: '#64748b', tw: 'bg-secondary' },
  { name: 'Success', value: '#10b981', tw: 'bg-green-500' },
  { name: 'Warning', value: '#f59e0b', tw: 'bg-yellow-500' },
  { name: 'Danger', value: '#ef4444', tw: 'bg-destructive' },
  { name: 'Black', value: '#000000', tw: 'bg-black' },
];

export default function SketchPad() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [brushColor, setBrushColor] = useState<string>(colorOptions[0].value);

  useEffect(() => {
    console.log('🤖 SketchPad mounted:', canvasRef.current);
  }, []);

  const clear = () => {
    canvasRef.current?.clearCanvas();
  };

  const undo = () => {
    canvasRef.current?.undo();
  };

  const redo = () => {
    canvasRef.current?.redo();
  };

  const download = async () => {
    const dataUrl = await canvasRef.current?.exportImage('png');
    if (dataUrl) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'sketch.png';
      link.click();
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Sketch Pad" />
      <div className="relative flex-1">
    
        <div className="absolute inset-0">
          <ReactSketchCanvas
            ref={canvasRef}
            width="100%"
            height="100%"
            strokeWidth={4}
            strokeColor={brushColor}
            style={{ display: 'block', width: '100%', height: '100%' }}
          />
        </div>

        <div className="absolute top-4 right-4 flex flex-wrap items-center gap-2 p-3 bg-card border border-border rounded-lg shadow max-w-[90vw]">
    
          {colorOptions.map(option => (
            <button
              key={option.name}
              onClick={() => setBrushColor(option.value)}
              className={`h-6 w-6 rounded-full border-2 focus:outline-none ${option.tw} ${brushColor === option.value ? 'border-ring' : 'border-transparent'}`}
              aria-label={option.name}
            />
          ))}

  
          <Button size="icon" variant="outline" onClick={undo} title="Undo" className="w-8 h-8">
            <Undo className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={redo} title="Redo" className="w-8 h-8">
            <Redo className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={clear} title="Clear">
            Clear
          </Button>
          <Button size="sm" onClick={download} title="Download">
            Download
          </Button>
        </div>

      </div>
    </AppLayout>
  );
}