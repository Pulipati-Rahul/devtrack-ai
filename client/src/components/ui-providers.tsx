'use client';

import * as React from 'react';
import { useNotificationStore } from '@/store/use-notification-store';
import { useModalStore } from '@/store/use-modal-store';
import { Icons } from './ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandPalette } from './search/CommandPalette';

export function UiProviders() {
  const { toasts, removeToast } = useNotificationStore();
  const { type, isOpen, closeModal } = useModalStore();

  return (
    <>
      {/* Toast Alert Wrapper */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';
            
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="pointer-events-auto flex items-center justify-between p-4 bg-card border border-border/40 rounded-xl shadow-lg gap-3"
              >
                <div className="flex items-center gap-2.5">
                  {isSuccess && <Icons.Success className="text-green-500 shrink-0" size={18} />}
                  {isError && <Icons.Warning className="text-red-500 shrink-0" size={18} />}
                  {isWarning && <Icons.Warning className="text-amber-500 shrink-0" size={18} />}
                  {!isSuccess && !isError && !isWarning && <Icons.Info className="text-blue-500 shrink-0" size={18} />}
                  <span className="text-xs font-medium text-foreground leading-relaxed">{toast.message}</span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                >
                  <Icons.Close size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Global Modals Wrapper */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-card border border-border/40 rounded-xl shadow-xl w-full max-w-md p-6 overflow-hidden z-10"
            >
              {type === 'deleteConfirm' && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-base">Are you absolutely sure?</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This action cannot be undone. This will permanently delete the resource from our servers.
                  </p>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="px-3 py-1.5 text-xs font-semibold hover:bg-secondary rounded-lg border border-border/40 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-3 py-1.5 text-xs font-semibold text-destructive-foreground bg-destructive rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {type !== 'deleteConfirm' && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-base">Placeholder Modal</h3>
                  <p className="text-xs text-muted-foreground">
                    This modal is initialized. Custom fields for &quot;{type}&quot; will be populated during milestone implementations.
                  </p>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={closeModal}
                      className="px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-primary rounded-lg transition-colors"
                    >
                      Close Modal
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      <CommandPalette />
    </>
  );
}
