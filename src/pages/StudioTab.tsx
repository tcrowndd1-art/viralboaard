export function StudioTab() {
  return (
    <div data-testid="studio-tab" className="text-center py-12">
      <h2 className="text-3xl font-bold mb-4">AI Studio</h2>
      <p className="text-gray-600 mb-8">
        영상 제작·편집·업로드는 데스크톱 앱에서 제공됩니다.
      </p>

      <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
        <p className="text-lg font-semibold mb-4">
          📥 ViralBoard Desktop
        </p>
        <p className="text-sm text-gray-600 mb-6">
          대본 생성 + TTS + 영상 렌더링 + YouTube 업로드를 한 번에
        </p>
        <div className="flex gap-3 justify-center">
          <button
            data-testid="download-mac"
            disabled
            className="px-4 py-2 bg-gray-300 rounded cursor-not-allowed"
          >
            ⬇ macOS (준비 중)
          </button>
          <button
            data-testid="download-win"
            disabled
            className="px-4 py-2 bg-gray-300 rounded cursor-not-allowed"
          >
            ⬇ Windows (준비 중)
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          곧 출시 예정. 알림 받기: 이메일 등록 (구현 예정)
        </p>
      </div>
    </div>
  );
}
