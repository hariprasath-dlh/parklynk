import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MailOpen } from 'lucide-react';
import { mockEmails } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const InboxPage = () => {
  const { user } = useAuth();
  const emails = mockEmails.filter(e => e.userId === user?.id);
  const [selected, setSelected] = useState<string | null>(null);
  const email = emails.find(e => e.id === selected);

  return (
    <div>
      <h1 className="font-heading text-xl font-bold mb-4">Inbox</h1>
      <div className="space-y-2">
        {emails.map((e, i) => (
          <motion.button
            key={e.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setSelected(e.id)}
            className={`w-full text-left bg-card border rounded-lg p-3 flex items-start gap-3 hover-lift ${e.isRead ? 'border-border' : 'border-accent/30'}`}
          >
            {e.isRead ? <MailOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /> : <Mail className="h-4 w-4 text-accent mt-0.5 shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${e.isRead ? '' : 'font-semibold'}`}>{e.subject}</p>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{new Date(e.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{e.from}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{e.preview}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-base">{email?.subject}</DialogTitle>
            <p className="text-xs text-muted-foreground">From: {email?.from}</p>
          </DialogHeader>
          <pre className="text-sm whitespace-pre-wrap font-body leading-relaxed mt-2">{email?.body}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InboxPage;
