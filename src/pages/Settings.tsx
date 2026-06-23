import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Unlock, Trash2, Download, Upload, Info, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSettings, saveSettings, clearAllData, exportAllData, importData, hashPin, verifyPin } from '@/lib/storage';
import { downloadFile } from '@/lib/utils';

export function Settings() {
  const navigate = useNavigate();
  const settings = getSettings();

  const [pinEnabled, setPinEnabled] = useState(settings.pinEnabled);
  const [pinHash] = useState(settings.pinHash);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  const handleEnablePin = () => {
    setPinError('');
    if (newPin.length < 4) { setPinError('PIN must be at least 4 characters'); return; }
    if (newPin !== confirmPin) { setPinError('PINs do not match'); return; }
    const hash = hashPin(newPin);
    saveSettings({ pinEnabled: true, pinHash: hash });
    setPinEnabled(true);
    setNewPin(''); setConfirmPin('');
    setPinSuccess('PIN enabled successfully!');
    setTimeout(() => setPinSuccess(''), 3000);
  };

  const handleDisablePin = () => {
    setPinError('');
    if (!verifyPin(currentPin, settings.pinHash)) {
      setPinError('Incorrect PIN');
      return;
    }
    saveSettings({ pinEnabled: false, pinHash: '' });
    setPinEnabled(false);
    setCurrentPin('');
    setPinSuccess('PIN disabled successfully!');
    setTimeout(() => setPinSuccess(''), 3000);
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `toolkit-pro-backup-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          importData(data);
          window.location.reload();
        } catch {
          alert('Invalid backup file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearData = () => {
    if (!confirm('This will permanently delete ALL your data including notes, stats, and settings. This cannot be undone. Continue?')) return;
    clearAllData();
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your ToolKit Pro preferences and data</p>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-400">100% Private & Serverless</p>
            <p className="text-xs text-muted-foreground mt-1">
              All your data is stored exclusively in your browser's localStorage. Nothing is ever sent to any server. Your notes, settings, and history remain completely private on your device.
            </p>
          </div>
        </div>
      </div>

      {/* Local PIN Security */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Local Access PIN</h2>
            <p className="text-xs text-muted-foreground">Protect your data with a PIN lock</p>
          </div>
          <div className={cn(
            'ml-auto px-2.5 py-1 rounded-full text-xs font-semibold',
            pinEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-secondary text-muted-foreground'
          )}>
            {pinEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {pinError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{pinError}</div>
        )}
        {pinSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{pinSuccess}</div>
        )}

        {!pinEnabled ? (
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="Enter new PIN (min 4 chars)"
                className="w-full px-4 py-3 pr-11 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button onClick={() => setShowPin(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={showPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value)}
              placeholder="Confirm PIN"
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleEnablePin}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-400 transition-all"
            >
              <Lock className="w-4 h-4" />
              Enable PIN Lock
            </button>
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              PIN is hashed locally using a simple hash. For strong security, use a password manager.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type={showPin ? 'text' : 'password'}
              value={currentPin}
              onChange={e => setCurrentPin(e.target.value)}
              placeholder="Enter current PIN to disable"
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleDisablePin}
              className="flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-xl text-sm font-semibold hover:bg-secondary transition-all"
            >
              <Unlock className="w-4 h-4" />
              Disable PIN Lock
            </button>
          </div>
        )}
      </div>

      {/* Data Portability */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Download className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Data Portability</h2>
            <p className="text-xs text-muted-foreground">Export or import your notes and settings</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Data (JSON)
          </button>
          <button
            onClick={handleImport}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-border text-foreground rounded-xl text-sm font-semibold hover:bg-secondary transition-all"
          >
            <Upload className="w-4 h-4" />
            Import Data
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Exports all notes, Pomodoro stats, and settings as a JSON file. Use this to back up or transfer your data between browsers.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-red-500/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold text-red-400">Danger Zone</h2>
            <p className="text-xs text-muted-foreground">Irreversible actions</p>
          </div>
        </div>
        <button
          onClick={handleClearData}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-600/20 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Clear All Local Data
        </button>
        <p className="text-xs text-muted-foreground">
          Permanently deletes all notes, stats, favorites, and settings stored in your browser. This cannot be undone.
        </p>
      </div>
    </div>
  );
}
