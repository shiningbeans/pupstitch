import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  CustomPattern,
  DogAnalysisResult,
  PatternCustomizations,
  DollSize,
} from '@/types';
import { analyzeImage, getDefaultAnalysisForBreed } from '@/lib/ai/vision-client';
import { generatePattern } from '@/lib/patterns/generator';
import { generatePreviewImage } from '@/lib/ai/preview-generator';
import { getPreset, getPresetBreedId } from '@/lib/patterns/presets';
import {
  savePattern,
  loadPattern,
  loadAllPatterns,
  deletePattern,
  migrateFromLocalStorage,
} from '@/lib/storage';

/**
 * Pattern store state and actions
 */
export interface PatternStore {
  // State
  currentPattern: CustomPattern | null;
  savedPatterns: CustomPattern[];
  isAnalyzing: boolean;
  isGenerating: boolean;
  isGeneratingPreview: boolean;
  analysisResult: DogAnalysisResult | null;
  uploadedImage: string | null; // data URL
  error: string | null;
  lastGeneratedPatternId: string | null;
  selectedBreeds: string[]; // up to 4 breeds for mixed breed support
  selectedSize: DollSize | null;
  initialized: boolean;

  // Actions
  initStorage: () => Promise<void>;
  setUploadedImage: (dataUrl: string) => void;
  setSelectedBreeds: (breeds: string[]) => void;
  toggleBreed: (breed: string) => void;
  setSelectedSize: (size: DollSize) => void;
  analyzeImage: (file: File) => Promise<void>;
  generateFromAnalysis: (customizations?: Partial<PatternCustomizations>) => Promise<void>;
  updateCustomization: (key: keyof PatternCustomizations, value: unknown) => void;
  regeneratePattern: () => Promise<void>;
  saveCurrentPattern: () => Promise<void>;
  loadPattern: (id: string) => Promise<void>;
  loadAllSaved: () => Promise<void>;
  deletePattern: (id: string) => Promise<void>;
  updateColorAssignment: (colorKey: string, hexCode: string) => void;
  addColorAssignment: (colorKey: string, hexCode: string, yarnName: string) => void;
  updateBodyPartColor: (partName: string, hexCode: string) => void;
  clearCurrent: () => void;
  setError: (error: string | null) => void;
}

/**
 * Create the Zustand store — NO persist middleware (IndexedDB handles persistence)
 */
export const usePatternStore = create<PatternStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentPattern: null,
      savedPatterns: [],
      isAnalyzing: false,
      isGenerating: false,
      isGeneratingPreview: false,
      analysisResult: null,
      uploadedImage: null,
      error: null,
      lastGeneratedPatternId: null,
      selectedBreeds: [],
      selectedSize: null,
      initialized: false,

      /**
       * Initialize storage: migrate from localStorage if needed, then load saved patterns
       */
      initStorage: async () => {
        if (get().initialized) return;
        try {
          await migrateFromLocalStorage();
          const patterns = await loadAllPatterns();
          set({ savedPatterns: patterns, initialized: true });
        } catch (e) {
          console.error('[Store] initStorage error:', e);
          set({ initialized: true });
        }
      },

      // Actions
      setUploadedImage: (dataUrl: string) => {
        set({ uploadedImage: dataUrl });
      },

      setSelectedBreeds: (breeds: string[]) => {
        set({ selectedBreeds: breeds.slice(0, 4) });
      },

      toggleBreed: (breed: string) => {
        const state = get();
        const current = state.selectedBreeds;
        if (current.includes(breed)) {
          set({ selectedBreeds: current.filter((b) => b !== breed) });
        } else if (current.length < 4) {
          set({ selectedBreeds: [...current, breed] });
        }
      },

      setSelectedSize: (size: DollSize) => {
        set({ selectedSize: size });
      },

      analyzeImage: async (file: File) => {
        const state = get();
        set({ isAnalyzing: true, error: null });
        try {
          const result = await analyzeImage(file, state.selectedBreeds);
          set({ analysisResult: result, isAnalyzing: false });
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to analyze image';
          set({ isAnalyzing: false, error: errorMessage });
        }
      },

      generateFromAnalysis: async (customizations?: Partial<PatternCustomizations>) => {
        const state = get();

        // If no analysis result, create a default one from the selected breeds
        let analysis = state.analysisResult;
        if (!analysis) {
          if (state.selectedBreeds.length === 0) {
            set({ error: 'Please select at least one breed first' });
            return;
          }
          const presetBreedId = getPresetBreedId(state.selectedBreeds[0]);
          analysis = getDefaultAnalysisForBreed(presetBreedId);
          set({ analysisResult: analysis });
        }

        set({ isGenerating: true, error: null });

        try {
          let breedId = analysis.detectedBreed;
          if (state.selectedBreeds.length > 0) {
            breedId = getPresetBreedId(state.selectedBreeds[0]);
          }

          const preset = getPreset(breedId, state.selectedSize || 'medium');
          if (!preset) {
            throw new Error(`Preset not found for breed: ${breedId}`);
          }

          const defaultCustomizations: PatternCustomizations = {
            colorAssignments: [],
            toggledFeatures: {},
            proportionAdjustments: {},
            difficultyLevel: 'standard',
            sizeMultiplier: state.selectedSize === 'small' ? 0.75 : state.selectedSize === 'large' ? 1.5 : 1.0,
            ...customizations,
          };

          const pattern = generatePattern(
            state.analysisResult || analysis,
            preset,
            defaultCustomizations
          );

          pattern.userId = 'current-user';

          // Keep the uploaded photo in memory for the live preview
          if (state.uploadedImage) {
            pattern.dogPhotoUrl = state.uploadedImage;
          }

          // Save to IndexedDB (no quota issues — hundreds of MB available)
          await savePattern(pattern);

          set({
            currentPattern: pattern,
            isGenerating: false,
            lastGeneratedPatternId: pattern.id,
          });

          // Refresh saved patterns list
          const updatedSaved = await loadAllPatterns();
          set({ savedPatterns: updatedSaved });

          // Generate AI preview image in the background (non-blocking)
          const analysisForPreview = get().analysisResult;
          if (analysisForPreview) {
            set({ isGeneratingPreview: true });
            generatePreviewImage(analysisForPreview)
              .then(async (imageUrl) => {
                if (imageUrl) {
                  const current = get().currentPattern;
                  if (current && current.id === pattern.id) {
                    const updated = { ...current, previewImageUrl: imageUrl };
                    set({ currentPattern: updated, isGeneratingPreview: false });
                    // Save the updated pattern with preview to IndexedDB
                    await savePattern(updated);
                  }
                } else {
                  set({ isGeneratingPreview: false });
                }
              })
              .catch((err) => {
                console.warn('[Store] Preview generation failed (non-fatal):', err);
                set({ isGeneratingPreview: false });
              });
          }
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to generate pattern';
          set({ isGenerating: false, error: errorMessage });
        }
      },

      updateCustomization: (key: keyof PatternCustomizations, value: unknown) => {
        const state = get();
        if (!state.currentPattern) {
          set({ error: 'No current pattern' });
          return;
        }

        const updated = { ...state.currentPattern };
        (updated.customizations[key] as unknown) = value;
        updated.updatedAt = new Date();
        set({ currentPattern: updated });
      },

      regeneratePattern: async () => {
        const state = get();
        if (!state.currentPattern || !state.analysisResult) {
          set({ error: 'No pattern or analysis result available' });
          return;
        }

        set({ isGenerating: true, error: null });

        try {
          const presetBreedId = getPresetBreedId(state.analysisResult.detectedBreed);
          const preset = getPreset(presetBreedId);
          if (!preset) {
            throw new Error(`Preset not found for breed: ${presetBreedId}`);
          }

          const pattern = generatePattern(
            state.analysisResult,
            preset,
            state.currentPattern.customizations
          );

          pattern.id = state.currentPattern.id;
          pattern.userId = state.currentPattern.userId;

          set({ currentPattern: pattern, isGenerating: false });
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to regenerate pattern';
          set({ isGenerating: false, error: errorMessage });
        }
      },

      saveCurrentPattern: async () => {
        const state = get();
        if (!state.currentPattern) {
          set({ error: 'No current pattern to save' });
          return;
        }

        try {
          await savePattern(state.currentPattern);
          const updatedSaved = await loadAllPatterns();
          set({
            savedPatterns: updatedSaved,
            currentPattern: {
              ...state.currentPattern,
              updatedAt: new Date(),
            },
          });
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to save pattern';
          set({ error: errorMessage });
        }
      },

      loadPattern: async (id: string) => {
        try {
          const pattern = await loadPattern(id);
          if (!pattern) {
            set({ error: `Pattern not found: ${id}` });
            return;
          }

          set({
            currentPattern: pattern,
            analysisResult: pattern.analysisResult,
            uploadedImage: pattern.dogPhotoUrl || null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to load pattern';
          set({ error: errorMessage });
        }
      },

      loadAllSaved: async () => {
        try {
          const patterns = await loadAllPatterns();
          set({ savedPatterns: patterns });
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to load patterns';
          set({ error: errorMessage });
        }
      },

      deletePattern: async (id: string) => {
        try {
          await deletePattern(id);

          const state = get();
          if (state.currentPattern?.id === id) {
            set({ currentPattern: null });
          }

          const updatedSaved = await loadAllPatterns();
          set({ savedPatterns: updatedSaved });
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to delete pattern';
          set({ error: errorMessage });
        }
      },

      updateColorAssignment: (colorKey: string, hexCode: string) => {
        const state = get();
        if (!state.currentPattern) return;
        const updated = { ...state.currentPattern };
        const assignments = [...updated.customizations.colorAssignments];
        const idx = assignments.findIndex((a) => a.colorKey === colorKey);
        if (idx >= 0) {
          assignments[idx] = { ...assignments[idx], hexCode };
        }
        updated.customizations = { ...updated.customizations, colorAssignments: assignments };
        updated.updatedAt = new Date();
        set({ currentPattern: updated });
      },

      addColorAssignment: (colorKey: string, hexCode: string, yarnName: string) => {
        const state = get();
        if (!state.currentPattern) return;
        const updated = { ...state.currentPattern };
        const assignments = [...updated.customizations.colorAssignments];
        // Avoid duplicates
        if (!assignments.find((a) => a.colorKey === colorKey)) {
          assignments.push({ colorKey, hexCode, yarnName });
        }
        updated.customizations = { ...updated.customizations, colorAssignments: assignments };
        updated.updatedAt = new Date();
        set({ currentPattern: updated });
      },

      updateBodyPartColor: (partName: string, hexCode: string) => {
        const state = get();
        if (!state.currentPattern) return;
        const updated = { ...state.currentPattern };

        // Update the bodyPartAnalysis color
        if (updated.analysisResult?.bodyPartAnalysis) {
          const parts = updated.analysisResult.bodyPartAnalysis.map((bp) =>
            bp.partName === partName
              ? { ...bp, primaryColor: hexCode, colors: [hexCode, ...bp.colors.slice(1)] }
              : bp
          );
          updated.analysisResult = { ...updated.analysisResult, bodyPartAnalysis: parts };
        }

        // Also update the analysis result in state
        const analysisResult = state.analysisResult;
        if (analysisResult?.bodyPartAnalysis) {
          const parts = analysisResult.bodyPartAnalysis.map((bp) =>
            bp.partName === partName
              ? { ...bp, primaryColor: hexCode, colors: [hexCode, ...bp.colors.slice(1)] }
              : bp
          );
          set({
            currentPattern: updated,
            analysisResult: { ...analysisResult, bodyPartAnalysis: parts },
          });
          return;
        }

        updated.updatedAt = new Date();
        set({ currentPattern: updated });
      },

      clearCurrent: () => {
        set({
          currentPattern: null,
          analysisResult: null,
          uploadedImage: null,
          error: null,
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    { name: 'PatternStore' }
  )
);

// Export hook for convenience
export const usePattern = () => usePatternStore();
