export interface HeraldManifest {
  version: string;
  project: {
    name: string;
    description: string;
    framework?: string;
    language?: string;
    repository?: string;
  };
  layers: {
    context: boolean;
    skills: boolean;
    commands: boolean;
    agents: boolean;
    permissions: boolean;
  };
  compatible_with?: string[];
}

export interface HeraldStatus {
  hasHerald: boolean;
  manifestValid: boolean;
  manifest?: HeraldManifest;
  layers: {
    context:     { enabled: boolean; files: string[] };
    skills:      { enabled: boolean; skills: string[] };
    commands:    { enabled: boolean; commands: string[] };
    agents:      { enabled: boolean; agents: string[] };
    permissions: { enabled: boolean; hasPolicy: boolean };
  };
  vendorFiles: {
    name: string;
    path: string;
    exists: boolean;
  }[];
}

export interface CompileTarget {
  id: string;
  label: string;
  outputPath: string;
  generate: (manifest: HeraldManifest, contextContent: string) => string;
}
