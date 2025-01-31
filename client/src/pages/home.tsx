import { Card, CardContent } from "@/components/ui/card";
import { DownloadForm } from "@/components/download-form";
import { VideoPreview } from "@/components/video-preview";
import { useState } from "react";

export interface TikTokMetadata {
  duration: string;
  videoSize: string;
  audioSize: string;
  resolution: string;
  format: string;
  codec: string;
  fps: number;
  bitrate: string;
}

export interface TikTokData {
  videoUrl: string;
  audioUrl: string;
  thumbnail: string;
  title: string;
  metadata: TikTokMetadata;
}

export default function Home() {
  const [previewData, setPreviewData] = useState<TikTokData | null>(null);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8 mt-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            TikTok Downloader
          </h1>
          <p className="text-muted-foreground mt-2">
            Download videos and music from TikTok easily
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <DownloadForm onPreview={setPreviewData} />
          </CardContent>
        </Card>

        {previewData && (
          <Card>
            <CardContent className="pt-6">
              <VideoPreview data={previewData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}