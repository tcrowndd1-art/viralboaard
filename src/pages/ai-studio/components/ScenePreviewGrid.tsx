import { useState } from 'react';

const SCENE_IMAGE_BASE: Record<string, string> = {
  hook: '3D cinematic animation style, Octane render, extreme close-up of 45-year-old Asian woman, shocked expression mid-bite, subsurface scattering skin, dark navy gradient background, blue and red rim lighting, hyper-detailed, 9:16 vertical portrait, NO text in frame, NO subtitles',
  shock: '3D cinematic animation style, Octane render, semi-transparent human brain anatomy cross-section, glowing neural networks, fluid dynamics sugar molecules flooding synapses, dark navy gradient background, blue and red accent lighting, hyper-detailed, 9:16 vertical portrait, NO text in frame',
  evidence: '3D cinematic animation style, Octane render, macro neural lattice structure, glowing blue connection threads being severed one by one, dense adipose layer encasing connections, dark navy background, red accent lighting at severance points, hyper-detailed, 9:16 vertical portrait, NO text in frame',
  solution: '3D cinematic animation style, Octane render, 45-year-old Asian woman, clear healthy serene expression, semi-transparent skull revealing glowing gold-blue brain lattice fully relit, warm gold rim lighting, dark navy background, 9:16 vertical portrait, NO text in frame',
  cta: '3D cinematic animation style, Octane render, first-person POV both hands holding smartphone in dark space, comment section open, first pinned comment glowing with soft blue card, ambient screen glow, ultra-realistic glass reflection, 9:16 vertical portrait, NO text in frame',
};

function buildPollinationsUrl(sceneId: string, topic: string): string {
  const base = SCENE_IMAGE_BASE[sceneId] ?? SCENE_IMAGE_BASE.hook;
  const prompt = `${base}, context: ${topic}`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&nologo=true`;
}

interface Scene {
  id: string;
  sectionLabel: string;
  sectionColorLight: string;
  sectionColorDark: string;
  cameraAngle: string;
  motionHint: string;
  duration: string;
  prompt: string;
}

const SCENES: Scene[] = [
  {
    id: 'hook',
    sectionLabel: 'Hook',
    sectionColorLight: 'text-red-600 bg-red-50 border-red-200',
    sectionColorDark: 'dark:text-red-400 dark:bg-red-500/15 dark:border-red-500/30',
    cameraAngle: 'Extreme Close-up',
    motionHint: 'Zoom-in 10%',
    duration: '3s',
    prompt: 'Extreme close-up, shocked expression, dark bg',
  },
  {
    id: 'shock',
    sectionLabel: 'Shock',
    sectionColorLight: 'text-orange-600 bg-orange-50 border-orange-200',
    sectionColorDark: 'dark:text-orange-400 dark:bg-orange-500/15 dark:border-orange-500/30',
    cameraAngle: 'Wide Shot',
    motionHint: 'Push-in 5%',
    duration: '12s',
    prompt: 'Brain anatomy, neural networks, fluid dynamics',
  },
  {
    id: 'evidence',
    sectionLabel: 'Evidence',
    sectionColorLight: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    sectionColorDark: 'dark:text-yellow-400 dark:bg-yellow-500/15 dark:border-yellow-500/30',
    cameraAngle: 'Over-the-Shoulder',
    motionHint: 'Slow Pan Left',
    duration: '15s',
    prompt: 'Neural lattice severing, macro shot',
  },
  {
    id: 'solution',
    sectionLabel: 'Solution',
    sectionColorLight: 'text-sky-600 bg-sky-50 border-sky-200',
    sectionColorDark: 'dark:text-blue-400 dark:bg-blue-500/15 dark:border-blue-500/30',
    cameraAngle: 'Medium Shot',
    motionHint: 'Zoom-out 8%',
    duration: '20s',
    prompt: 'Woman healthy, gold lighting, brain relit',
  },
  {
    id: 'cta',
    sectionLabel: 'CTA',
    sectionColorLight: 'text-green-600 bg-green-50 border-green-200',
    sectionColorDark: 'dark:text-green-400 dark:bg-green-500/15 dark:border-green-500/30',
    cameraAngle: 'Dutch Angle',
    motionHint: 'Tilt + Zoom 12%',
    duration: '10s',
    prompt: 'Smartphone POV, comment section glowing',
  },
];

interface SceneCardProps {
  scene: Scene;
  index: number;
  topic: string;
  isGenerating: boolean;
}

const SceneCard = ({ scene, index, topic, isGenerating }: SceneCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleGenerate = () => {
    const url = buildPollinationsUrl(scene.id, topic || '바이럴 콘텐츠');
    setImageUrl(url);
    setImageLoading(true);
    setImageError(false);
  };

  return (
    <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden flex flex-col hover:border-red-300 dark:hover:border-red-500/30 transition-all group">
      {/* Scene header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 dark:text-white/40 font-mono">#{index + 1}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${scene.sectionColorLight} ${scene.sectionColorDark}`}>
            {scene.sectionLabel}
          </span>
        </div>
        <span className="text-xs font-mono text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{scene.duration}</span>
      </div>

      {/* Image area */}
      <div className="relative w-full bg-gray-100 dark:bg-dark-base" style={{ aspectRatio: '16/9' }}>
        {/* Loading spinner */}
        {(imageLoading || isGenerating) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-gray-100 dark:bg-dark-base">
            <div className="w-8 h-8 border-2 border-red-200 dark:border-blue-500/30 border-t-red-500 dark:border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-xs text-gray-400 dark:text-white/30">Generating...</span>
          </div>
        )}

        {/* No image yet */}
        {!imageUrl && !imageLoading && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-dark-surface">
            <i className="ri-image-ai-line text-gray-300 dark:text-white/20 text-2xl w-8 h-8 flex items-center justify-center"></i>
            <span className="text-xs text-gray-300 dark:text-white/20">Scene {index + 1}</span>
          </div>
        )}

        {/* Error */}
        {imageError && !imageLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-dark-surface">
            <i className="ri-image-line text-gray-300 dark:text-white/20 text-2xl w-8 h-8 flex items-center justify-center"></i>
            <span className="text-xs text-gray-300 dark:text-white/20">생성 실패</span>
          </div>
        )}

        {/* Generated image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`Scene ${index + 1} - ${scene.sectionLabel}`}
            className={`w-full h-full object-cover object-top transition-opacity ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => { setImageLoading(false); setImageError(true); }}
          />
        )}

        {/* Overlay badges */}
        {imageUrl && !imageLoading && !imageError && (
          <>
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
              <i className="ri-camera-lens-line text-sky-400 text-xs w-3 h-3 flex items-center justify-center"></i>
              <span className="text-xs text-white font-medium">{scene.cameraAngle}</span>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
              <i className="ri-speed-line text-yellow-400 text-xs w-3 h-3 flex items-center justify-center"></i>
              <span className="text-xs text-white/80">{scene.motionHint}</span>
            </div>
          </>
        )}

        {/* Regenerate overlay on hover */}
        {imageUrl && !imageLoading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-magic-line w-3 h-3 flex items-center justify-center"></i>
              Regenerate
            </button>
          </div>
        )}
      </div>

      {/* Prompt text */}
      <div className="px-3 py-2 border-t border-gray-100 dark:border-white/5">
        <p className="text-xs text-gray-400 dark:text-white/35 truncate font-light">{scene.prompt}</p>
      </div>

      {/* Generate Image button */}
      <div className="flex items-center justify-end px-3 pb-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || imageLoading}
          className="flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i className="ri-image-ai-line w-3 h-3 flex items-center justify-center"></i>
          {imageUrl ? 'Regenerate Image' : 'Generate Image'}
        </button>
      </div>
    </div>
  );
};

interface ScenePreviewGridProps {
  generatingAll: boolean;
  topic: string;
}

const ScenePreviewGrid = ({ generatingAll, topic }: ScenePreviewGridProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i className="ri-film-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
            Scene Preview
          </h2>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">5 scenes · 9:16 · Pollinations AI</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">
            <i className="ri-layout-grid-line mr-1"></i>Grid
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 overflow-y-auto flex-1 pr-1">
        {SCENES.map((scene, index) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            index={index}
            topic={topic}
            isGenerating={generatingAll}
          />
        ))}
      </div>
    </div>
  );
};

export default ScenePreviewGrid;
