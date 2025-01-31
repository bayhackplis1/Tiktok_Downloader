import { Button } from "@/components/ui/button";
import { TikTokData } from "@/pages/home";
import { Download, Music, Info } from "lucide-react";
import { ProgressIndicator } from "./progress-indicator";
import { useState } from "react";

interface VideoPreviewProps {
  data: TikTokData;
}

export function VideoPreview({ data }: VideoPreviewProps) {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  async function downloadFile(url: string, type: "video" | "audio") {
    try {
      setDownloadProgress(0);

      // Crear un enlace temporal para la descarga
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank"; // Abrir en nueva pestaña
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadProgress(100);
      setTimeout(() => setDownloadProgress(null), 1000);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadProgress(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
        <img
          src={data.thumbnail}
          alt={data.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Info className="h-4 w-4" />
          Video Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium">{data.metadata.duration}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Video Size</p>
            <p className="font-medium">{data.metadata.videoSize}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Audio Size</p>
            <p className="font-medium">{data.metadata.audioSize}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Resolution</p>
            <p className="font-medium">{data.metadata.resolution}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Format</p>
            <p className="font-medium">{data.metadata.format}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Codec</p>
            <p className="font-medium">{data.metadata.codec}</p>
          </div>
          <div>
            <p className="text-muted-foreground">FPS</p>
            <p className="font-medium">{data.metadata.fps}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Bitrate</p>
            <p className="font-medium">{data.metadata.bitrate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => downloadFile(data.videoUrl, "video")}
          disabled={downloadProgress !== null}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Video
        </Button>

        <Button
          onClick={() => downloadFile(data.audioUrl, "audio")}
          disabled={downloadProgress !== null}
          variant="secondary"
          className="w-full"
        >
          <Music className="mr-2 h-4 w-4" />
          Download Audio
        </Button>
      </div>

      {downloadProgress !== null && (
        <ProgressIndicator progress={downloadProgress} />
      )}
    </div>
  );
}