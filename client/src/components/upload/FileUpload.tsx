import * as React from 'react';
import { Upload, X, AlertTriangle, FileText, CheckCircle, RefreshCw } from 'lucide-react';

interface FileUploadProps {
  folder?: string;
  onUploadComplete?: (urls: string[]) => void;
  multiple?: boolean;
}

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  error?: string;
  xhr?: XMLHttpRequest;
  url?: string;
}

export function FileUpload({ folder = 'temporary', onUploadComplete, multiple = false }: FileUploadProps) {
  const [tasks, setTasks] = React.useState<UploadTask[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const startUpload = (task: UploadTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'uploading', progress: 0, error: undefined } : t))
    );

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', task.file);
    formData.append('folder', folder);

    // Track upload progress percentage
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, progress: percent } : t))
        );
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          const uploadedUrl = res.data.url;

          setTasks((prev) => {
            const next = prev.map((t) =>
              t.id === task.id ? { ...t, status: 'success' as const, progress: 100, url: uploadedUrl } : t
            );
            
            // Notify when all files complete
            const completedUrls = next.filter((t) => t.status === 'success' && t.url).map((t) => t.url!);
            if (onUploadComplete && completedUrls.length > 0) {
              onUploadComplete(completedUrls);
            }
            return next;
          });
        } catch (err) {
          setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: 'failed', error: 'Invalid server response' } : t))
          );
        }
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: 'failed', error: `Upload failed (${xhr.status})` } : t))
        );
      }
    });

    xhr.addEventListener('error', () => {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'failed', error: 'Network error occurred' } : t))
      );
    });

    xhr.open('POST', '/api/v1/upload');
    
    // Track active XHR task to support cancellation aborts
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, xhr } : t))
    );

    xhr.send(formData);
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    const addedTasks = newFiles.map((file) => ({
      id: Math.random().toString(),
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    if (multiple) {
      setTasks((prev) => [...prev, ...addedTasks]);
      addedTasks.forEach(startUpload);
    } else {
      // If single upload, cancel any active uploads and replace tasks
      tasks.forEach((t) => t.xhr?.abort());
      setTasks(addedTasks);
      startUpload(addedTasks[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleCancel = (taskId: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      target?.xhr?.abort();
      return prev.filter((t) => t.id !== taskId);
    });
  };

  const handleRetry = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      startUpload(task);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border/60 hover:border-primary/50 bg-secondary/15 hover:bg-secondary/30 rounded-xl p-8 text-center cursor-pointer transition-colors space-y-3"
      >
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
          <Upload size={18} />
        </div>
        <div className="text-xs">
          <span className="font-semibold text-foreground">Click to upload</span>
          <span className="text-muted-foreground"> or drag and drop</span>
        </div>
        <p className="text-[10px] text-muted-foreground">Images, PDF, DOCX, ZIP (Max 10MB)</p>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Progress & File Previews list */}
      {tasks.length > 0 && (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div key={task.id} className="border border-border/45 rounded-xl p-3 bg-card flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                <FileText size={16} className="text-primary shrink-0" />
                <div className="overflow-hidden flex-1">
                  <span className="font-semibold text-foreground truncate block">{task.file.name}</span>
                  <span className="text-[10px] text-gray-500">
                    {Math.round(task.file.size / 1024)} KB
                  </span>
                  
                  {/* Progress bar */}
                  {task.status === 'uploading' && (
                    <div className="w-full bg-secondary rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${task.progress}%` }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {task.status === 'uploading' && (
                  <span className="text-[10px] text-primary font-bold">{task.progress}%</span>
                )}
                {task.status === 'success' && (
                  <CheckCircle size={15} className="text-emerald-500" />
                )}
                {task.status === 'failed' && (
                  <div className="flex items-center gap-1.5 text-rose-500 font-bold text-[10px]">
                    <AlertTriangle size={13} />
                    <span>Failed</span>
                  </div>
                )}

                <div className="flex gap-1 ml-2">
                  {task.status === 'failed' && (
                    <button
                      onClick={() => handleRetry(task.id)}
                      className="p-1 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded"
                      title="Retry upload"
                    >
                      <RefreshCw size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => handleCancel(task.id)}
                    className="p-1 hover:bg-secondary/40 text-muted-foreground hover:text-rose-500 rounded"
                    title="Cancel / Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default FileUpload;
