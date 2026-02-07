'use client';

import { CustomPattern } from '@/types';
import PatternOutput from './PatternOutput';

interface PatternEditorProps {
  pattern: CustomPattern;
}

export default function PatternEditor({ pattern }: PatternEditorProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <PatternOutput pattern={pattern} />
    </div>
  );
}
