import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RotateCcw, Check } from 'lucide-react';

interface SignatureCaptureProps {
  onSignatureComplete: (signature: string, signatureData: any) => void;
  taxpayerName: string;
  spouseName?: string;
}

export function SignatureCapture({ onSignatureComplete, taxpayerName, spouseName }: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [pin, setPin] = useState('');
  const [spousePin, setSpousePin] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL('image/png');
    onSignatureComplete(signatureData, {
      taxpayerPin: pin,
      spousePin: spousePin || undefined,
      signedDate: new Date().toISOString(),
      agreed
    });
  };

  const isValid = hasSignature && pin.length === 5 && agreed && (!spouseName || spousePin.length === 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Electronic Signature</CardTitle>
        <CardDescription>Sign your return electronically to authorize e-filing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Draw Your Signature</Label>
          <canvas
            ref={canvasRef}
            width={500}
            height={150}
            className="border rounded-lg cursor-crosshair w-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <Button variant="outline" size="sm" onClick={clearSignature} className="mt-2">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="pin">Self-Select PIN (5 digits)</Label>
            <Input
              id="pin"
              type="password"
              maxLength={5}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="12345"
            />
          </div>
          {spouseName && (
            <div>
              <Label htmlFor="spousePin">Spouse PIN (5 digits)</Label>
              <Input
                id="spousePin"
                type="password"
                maxLength={5}
                value={spousePin}
                onChange={(e) => setSpousePin(e.target.value.replace(/\D/g, ''))}
                placeholder="12345"
              />
            </div>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox id="agree" checked={agreed} onCheckedChange={(c) => setAgreed(c as boolean)} />
          <Label htmlFor="agree" className="text-sm leading-tight">
            I declare under penalties of perjury that I have examined this return and accompanying schedules 
            and statements, and to the best of my knowledge and belief, they are true, correct, and complete.
          </Label>
        </div>

        <Button onClick={handleComplete} disabled={!isValid} className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Complete Signature
        </Button>
      </CardContent>
    </Card>
  );
}
