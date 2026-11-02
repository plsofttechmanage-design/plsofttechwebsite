import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Rocket,
  Zap,
  Shield,
  Code,
  Box,
  Globe,
  Flame,
  Terminal,
  Crown,
  Star,
  Compass,
} from 'lucide-react';

export const ICON_PRESETS = [
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'rocket', label: 'Rocket', icon: Rocket },
  { id: 'zap', label: 'Lightning', icon: Zap },
  { id: 'shield', label: 'Shield', icon: Shield },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'box', label: 'Box / Package', icon: Box },
  { id: 'globe', label: 'Globe', icon: Globe },
  { id: 'flame', label: 'Flame', icon: Flame },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'crown', label: 'Crown', icon: Crown },
  { id: 'star', label: 'Star', icon: Star },
  { id: 'compass', label: 'Compass', icon: Compass },
];

export const BrandLogo = ({
  logoUrl,
  logoIcon = 'layers',
  className = 'w-5 h-5 text-indigo-400',
  imgClassName = 'w-full h-full object-cover',
}) => {
  const [imgError, setImgError] = useState(false);

  // If a custom logo image URL is provided and has not errored, display the image
  if (logoUrl && !imgError) {
    const formattedUrl =
      logoUrl.startsWith('/media/') && !logoUrl.startsWith('http')
        ? (window.location.port === '5173' ? 'http://127.0.0.1:8000' + logoUrl : logoUrl)
        : logoUrl;

    return (
      <img
        src={formattedUrl}
        alt="Logo"
        className={imgClassName}
        onError={() => setImgError(true)}
      />
    );
  }

  // Otherwise, render the chosen preset icon
  const selectedPreset = ICON_PRESETS.find((p) => p.id === logoIcon) || ICON_PRESETS[0];
  const IconComponent = selectedPreset.icon;

  return <IconComponent className={className} />;
};

