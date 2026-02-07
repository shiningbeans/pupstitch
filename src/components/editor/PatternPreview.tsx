'use client';

import { CustomPattern } from '@/types';
import Image from 'next/image';

interface PatternPreviewProps {
  pattern: CustomPattern;
  selectedPart?: string | null;
  onSelectPart?: (part: string | null) => void;
}

export default function PatternPreview({
  pattern,
  selectedPart,
  onSelectPart,
}: PatternPreviewProps) {
  const handleSelectPart = (part: string) => {
    onSelectPart?.(part);
  };

  // Get color assignments
  const colorMap: Record<string, string> = {};
  for (const assignment of pattern.customizations.colorAssignments) {
    colorMap[assignment.colorKey] = assignment.hexCode;
  }

  const primaryColor = colorMap['primary'] || '#D97706'; // Amber fallback
  const secondaryColor = colorMap['secondary'] || '#FEF3C7'; // Cream fallback
  const accentColor = colorMap['accent'] || '#F43F5E'; // Coral fallback
  const noseColor = colorMap['nose'] || '#1C1917'; // Dark fallback

  const headSize = (pattern.customizations.proportionAdjustments['headSize'] || 1) * 80;
  const bodyLength = (pattern.customizations.proportionAdjustments['bodyLength'] || 1) * 100;
  const legLength = (pattern.customizations.proportionAdjustments['legLength'] || 1) * 60;
  const earSize = (pattern.customizations.proportionAdjustments['earSize'] || 1) * 40;
  const tailLength = (pattern.customizations.proportionAdjustments['tailLength'] || 1) * 70;
  const overallSize = pattern.customizations.proportionAdjustments['overallSize'] || 1;

  // Scale all dimensions by overall size
  const scaledHeadSize = headSize * overallSize;
  const scaledBodyLength = bodyLength * overallSize;
  const scaledLegLength = legLength * overallSize;
  const scaledEarSize = earSize * overallSize;
  const scaledTailLength = tailLength * overallSize;

  const svgSize = 500;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  return (
    <div className="space-y-4">
      {/* Photo Reference */}
      {pattern.dogPhotoThumbnailUrl && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-amber-200">
          <Image
            src={pattern.dogPhotoThumbnailUrl}
            alt={pattern.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* SVG Preview */}
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="w-full border-2 border-amber-200 rounded-lg bg-white"
      >
        {/* Tail */}
        <g
          className={`cursor-pointer transition-all ${
            selectedPart === 'tail' ? 'filter drop-shadow-lg' : ''
          }`}
          onClick={() => handleSelectPart('tail')}
          style={{
            filter: selectedPart === 'tail' ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
          }}
        >
          <path
            d={`M ${centerX + scaledBodyLength / 2} ${centerY} Q ${
              centerX + scaledBodyLength / 2 + scaledTailLength / 2
            } ${centerY - scaledTailLength / 2} ${centerX + scaledBodyLength / 2 + scaledTailLength} ${
              centerY - scaledTailLength
            }`}
            fill="none"
            stroke={primaryColor}
            strokeWidth="12"
            strokeLinecap="round"
          />
        </g>

        {/* Body */}
        <g
          className={`cursor-pointer transition-all ${
            selectedPart === 'body' ? 'filter drop-shadow-lg' : ''
          }`}
          onClick={() => handleSelectPart('body')}
          style={{
            filter: selectedPart === 'body' ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
          }}
        >
          <ellipse
            cx={centerX}
            cy={centerY}
            rx={scaledBodyLength / 2}
            ry={scaledBodyLength / 3}
            fill={primaryColor}
          />
        </g>

        {/* Head */}
        <g
          className={`cursor-pointer transition-all ${
            selectedPart === 'head' ? 'filter drop-shadow-lg' : ''
          }`}
          onClick={() => handleSelectPart('head')}
          style={{
            filter: selectedPart === 'head' ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
          }}
        >
          <circle
            cx={centerX - scaledBodyLength / 2 - scaledHeadSize / 3}
            cy={centerY - scaledBodyLength / 6}
            r={scaledHeadSize / 2}
            fill={primaryColor}
          />
        </g>

        {/* Ears */}
        <g
          className={`cursor-pointer transition-all ${
            selectedPart === 'ear' ? 'filter drop-shadow-lg' : ''
          }`}
          onClick={() => handleSelectPart('ear')}
          style={{
            filter: selectedPart === 'ear' ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
          }}
        >
          {/* Left Ear */}
          <ellipse
            cx={centerX - scaledBodyLength / 2 - scaledHeadSize / 2}
            cy={centerY - scaledBodyLength / 6 - scaledHeadSize / 2 + scaledEarSize / 2}
            rx={scaledEarSize / 3}
            ry={scaledEarSize / 2}
            fill={primaryColor}
          />
          {/* Right Ear */}
          <ellipse
            cx={centerX - scaledBodyLength / 2 + scaledEarSize / 2}
            cy={centerY - scaledBodyLength / 6 - scaledHeadSize / 2 + scaledEarSize / 2}
            rx={scaledEarSize / 3}
            ry={scaledEarSize / 2}
            fill={primaryColor}
          />
        </g>

        {/* Snout */}
        <circle
          cx={centerX - scaledBodyLength / 2 - scaledHeadSize / 1.5}
          cy={centerY - scaledBodyLength / 6 + scaledHeadSize / 4}
          r={scaledHeadSize / 4}
          fill={secondaryColor}
          stroke={primaryColor}
          strokeWidth="2"
        />

        {/* Nose */}
        <circle
          cx={centerX - scaledBodyLength / 2 - scaledHeadSize / 1.5}
          cy={centerY - scaledBodyLength / 6 + scaledHeadSize / 4}
          r={scaledHeadSize / 8}
          fill={noseColor}
        />

        {/* Eyes */}
        <circle
          cx={centerX - scaledBodyLength / 2 - scaledHeadSize / 2.5}
          cy={centerY - scaledBodyLength / 6 - scaledHeadSize / 4}
          r={scaledHeadSize / 12}
          fill={noseColor}
        />
        <circle
          cx={centerX - scaledBodyLength / 2 - scaledHeadSize / 1.2}
          cy={centerY - scaledBodyLength / 6 - scaledHeadSize / 4}
          r={scaledHeadSize / 12}
          fill={noseColor}
        />

        {/* Front Left Leg */}
        <g
          className={`cursor-pointer transition-all ${
            selectedPart === 'frontLeg' ? 'filter drop-shadow-lg' : ''
          }`}
          onClick={() => handleSelectPart('frontLeg')}
          style={{
            filter: selectedPart === 'frontLeg' ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
          }}
        >
          <rect
            x={centerX - scaledBodyLength / 3 - scaledLegLength / 6}
            y={centerY + scaledBodyLength / 4}
            width={scaledLegLength / 3}
            height={scaledLegLength}
            rx={scaledLegLength / 6}
            fill={primaryColor}
          />
        </g>

        {/* Front Right Leg */}
        <g
          className={`cursor-pointer transition-all ${
            selectedPart === 'frontLeg' ? 'filter drop-shadow-lg' : ''
          }`}
          onClick={() => handleSelectPart('frontLeg')}
          style={{
            filter: selectedPart === 'frontLeg' ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
          }}
        >
          <rect
            x={centerX + scaledBodyLength / 3 - scaledLegLength / 6}
            y={centerY + scaledBodyLength / 4}
            width={scaledLegLength / 3}
            height={scaledLegLength}
            rx={scaledLegLength / 6}
            fill={primaryColor}
          />
        </g>

        {/* Back Left Leg */}
        <g
          className={`cursor-pointer transition-all ${
            selectedPart === 'backLeg' ? 'filter drop-shadow-lg' : ''
          }`}
          onClick={() => handleSelectPart('backLeg')}
          style={{
            filter: selectedPart === 'backLeg' ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
          }}
        >
          <rect
            x={centerX + scaledBodyLength / 5 - scaledLegLength / 6}
            y={centerY + scaledBodyLength / 4}
            width={scaledLegLength / 3}
            height={scaledLegLength}
            rx={scaledLegLength / 6}
            fill={secondaryColor}
            stroke={primaryColor}
            strokeWidth="2"
          />
        </g>

        {/* Back Right Leg */}
        <g
          className={`cursor-pointer transition-all ${
            selectedPart === 'backLeg' ? 'filter drop-shadow-lg' : ''
          }`}
          onClick={() => handleSelectPart('backLeg')}
          style={{
            filter: selectedPart === 'backLeg' ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
          }}
        >
          <rect
            x={centerX - scaledBodyLength / 5 - scaledLegLength / 6}
            y={centerY + scaledBodyLength / 4}
            width={scaledLegLength / 3}
            height={scaledLegLength}
            rx={scaledLegLength / 6}
            fill={secondaryColor}
            stroke={primaryColor}
            strokeWidth="2"
          />
        </g>
      </svg>

      {/* Part Info */}
      {selectedPart && (
        <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
          <p className="text-sm font-medium text-warm-primary capitalize">{selectedPart}</p>
          <p className="text-xs text-warm-secondary mt-1">Click to select body part details</p>
        </div>
      )}
    </div>
  );
}
