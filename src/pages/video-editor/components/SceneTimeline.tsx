import { useState, useRef } from 'react';

export interface SceneData {
  id: string;
  label: string;
  duration: number;
  thumbnail: string;
  textOverlay: string;
  narration: string;
  transition: string;
  color: string;
}

interface SceneTimelineProps {
  scenes: SceneData[];
  activeId: string;
  onSelect: (id: string) => void;
  onReorder: (scenes: SceneData[]) => void;
}

const SceneTimeline = ({ scenes, activeId, onSelect, onReorder }: SceneTimelineProps) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  const handleDragStart = (index: number, id: string) => {
    dragItem.current = index;
    setDraggingId(id);
  };

  const handleDragEnter = (index: number, id: string) => {
    dragOverItem.current = index;
    setDragOverId(id);
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newScenes = [...scenes];
    const dragged = newScenes.splice(dragItem.current, 1)[0];
    newScenes.splice(dragOverItem.current, 0, dragged);
    onReorder(newScenes);
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingId(null);
    setDragOverId(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Timeline header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="ri-film-line text-gray-400 dark:text-white/40 text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">Timeline</span>
          <span className="text-xs text-gray-400 dark:text-white/25 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{scenes.length} scenes</span>
        </div>
        <span className="text-xs text-gray-400 dark:text-white/30 font-mono">Total: {totalDuration}s</span>
      </div>

      {/* Duration bar */}
      <div className="flex rounded-full overflow-hidden h-1 gap-px">
        {scenes.map((s) => (
          <div
            key={s.id}
            className={`${s.color} transition-all`}
            style={{ width: `${(s.duration / totalDuration) * 100}%` }}
          ></div>
        ))}
      </div>

      {/* Scene blocks */}
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            draggable
            onDragStart={() => handleDragStart(index, scene.id)}
            onDragEnter={() => handleDragEnter(index, scene.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => onSelect(scene.id)}
            className={`
              flex-shrink-0 relative rounded-xl overflow-hidden cursor-pointer transition-all select-none
              border-2 group
              ${activeId === scene.id
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/25'
              }
              ${draggingId === scene.id ? 'opacity-40 scale-95' : ''}
              ${dragOverId === scene.id && draggingId !== scene.id ? 'ring-2 ring-blue-400/50 border-blue-400' : ''}
            `}
            style={{ width: '140px', height: '90px' }}
          >
            {/* Thumbnail */}
            <img
              src={scene.thumbnail}
              alt={scene.label}
              className="w-full h-full object-cover object-top"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

            {/* Active indicator */}
            {activeId === scene.id && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
            )}

            {/* Drag handle */}
            <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="ri-drag-move-2-line text-white/70 text-xs w-4 h-4 flex items-center justify-center"></i>
            </div>

            {/* Scene info */}
            <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
              <p className="text-white text-xs font-semibold truncate">{scene.label}</p>
              <p className="text-white/60 text-xs font-mono">{scene.duration}s</p>
            </div>

            {/* Index badge */}
            <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{index + 1}</span>
            </div>
          </div>
        ))}

        {/* Add scene button */}
        <div
          className="flex-shrink-0 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 flex items-center justify-center cursor-pointer transition-colors group"
          style={{ width: '80px', height: '90px' }}
        >
          <div className="flex flex-col items-center gap-1">
            <i className="ri-add-line text-gray-300 dark:text-white/20 group-hover:text-blue-400 text-lg w-5 h-5 flex items-center justify-center transition-colors"></i>
            <span className="text-xs text-gray-300 dark:text-white/20 group-hover:text-blue-400 transition-colors">Add</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneTimeline;
