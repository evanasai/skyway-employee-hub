
import React from 'react';
import MapZoneEditor from './MapZoneEditor';

interface ZoneEditorProps {
  onBack?: () => void;
}

const ZoneEditor: React.FC<ZoneEditorProps> = ({ onBack }) => {
  return <MapZoneEditor onBack={onBack} />;
};

export default ZoneEditor;
