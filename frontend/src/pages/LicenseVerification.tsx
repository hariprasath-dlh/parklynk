import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ScanLine, ShieldCheck, ShieldX, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const LicenseVerification = () => {
  const { user, updateUser, setVerificationStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageData, setImageData] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<'idle' | 'passed' | 'failed'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(String(reader.result));
      setResult('idle');
    };
    reader.readAsDataURL(file);
  };

  const handleVerify = async () => {
    if (!imageData) {
      toast({
        title: 'Upload required',
        description: 'Please select a driving license image before verification.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    setVerificationStatus('scanning');

    try {
      const response = await authAPI.verifyLicense(imageData);
      if (response.success && response.user) {
        updateUser({
          verificationStatus: 'verified',
          licenseVerified: true,
          licenseNumber: response.user.licenseNumber,
          licenseImage: imageData,
        });
        setVerificationStatus('verified');
        setResult('passed');
        toast({
          title: 'License verified',
          description: `License number ${response.user.licenseNumber} validated successfully.`,
        });
      }
    } catch (error: any) {
      setVerificationStatus('rejected');
      setResult('failed');
      toast({
        title: 'Verification failed',
        description: error?.response?.data?.message || error?.message || 'Invalid driving license document.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-heading text-2xl font-bold">Park<span className="text-accent">Lynk</span></span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 font-heading text-lg font-bold">License Verification</h2>
          <p className="mb-6 text-xs text-muted-foreground">Upload your driving license. OCR validation runs on the backend before access is granted.</p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 flex h-56 w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface text-center transition-colors hover:border-accent"
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {imageData ? (
              <img src={imageData} alt="Driving license preview" className="h-full w-full rounded-lg object-contain" />
            ) : (
              <div>
                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Upload driving license</p>
                <p className="text-xs text-muted-foreground">Accepted: image files only</p>
              </div>
            )}
          </button>

          <div className="mb-4 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ScanLine className={`h-4 w-4 ${processing ? 'animate-pulse text-accent' : ''}`} />
              <span>
                {processing
                  ? 'Running OCR and license number validation...'
                  : user?.licenseNumber
                    ? `Last verified license: ${user.licenseNumber}`
                    : 'Indian license pattern validation: AA00###########'}
              </span>
            </div>
          </div>

          {result !== 'idle' ? (
            <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${result === 'passed' ? 'bg-teal/10 text-teal' : 'bg-destructive/10 text-destructive'}`}>
              {result === 'passed' ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
              <span>{result === 'passed' ? 'License verification complete' : 'License verification failed'}</span>
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button onClick={handleVerify} disabled={processing || !imageData} className="w-full press-scale bg-accent text-accent-foreground hover:bg-accent/90">
              {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Verify License'}
            </Button>
            {result === 'passed' ? (
              <Button onClick={() => navigate('/vehicle')} variant="outline" className="press-scale">
                Continue
              </Button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LicenseVerification;
