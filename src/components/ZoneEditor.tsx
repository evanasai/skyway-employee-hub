
import React from 'react';
import SimpleZoneEditor from './SimpleZoneEditor';

interface ZoneEditorProps {
  onBack?: () => void;
}

const ZoneEditor: React.FC<ZoneEditorProps> = ({ onBack }) => {
  return <SimpleZoneEditor />;
};

export default ZoneEditor;
