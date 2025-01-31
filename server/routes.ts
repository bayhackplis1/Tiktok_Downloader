import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { validateTikTokUrl } from "../client/src/lib/validators";
import { spawn } from "child_process";
import { promisify } from "util";
import { exec } from "child_process";
import { createWriteStream, createReadStream } from "fs";
import path from "path";
import { mkdir } from "fs/promises";

const execPromise = promisify(exec);
const tiktokInfoSchema = z.object({
  url: validateTikTokUrl,
});

export function registerRoutes(app: Express): Server {
  app.post("/api/tiktok/info", async (req, res) => {
    try {
      const { url } = tiktokInfoSchema.parse(req.body);

      // Obtener información del video usando yt-dlp
      const { stdout } = await execPromise(`yt-dlp --dump-json "${url}"`);
      const videoInfo = JSON.parse(stdout);

      const mockData = {
        videoUrl: "/api/tiktok/download/video?url=" + encodeURIComponent(url),
        audioUrl: "/api/tiktok/download/audio?url=" + encodeURIComponent(url),
        thumbnail: videoInfo.thumbnail || "https://picsum.photos/seed/1/1280/720",
        title: videoInfo.title || "TikTok Video",
        metadata: {
          duration: videoInfo.duration ? `${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}` : "00:00",
          videoSize: `${Math.round(videoInfo.filesize / 1024 / 1024 * 10) / 10} MB`,
          audioSize: `${Math.round(videoInfo.audio_filesize / 1024 / 1024 * 10) / 10} MB`,
          resolution: `${videoInfo.width}x${videoInfo.height}`,
          format: "MP4",
          codec: videoInfo.vcodec || "H.264",
          fps: videoInfo.fps || 30,
          bitrate: `${Math.round(videoInfo.tbr)}Mbps`,
        }
      };

      res.json(mockData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error('Error getting video info:', error);
        res.status(500).json({ message: "Failed to process TikTok URL" });
      }
    }
  });

  app.get("/api/tiktok/download/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const url = req.query.url as string;

      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const tempPath = path.join(process.cwd(), "temp");
      // Asegurar que el directorio temporal existe
      await mkdir(tempPath, { recursive: true });

      const timestamp = Date.now();
      const outputFile = path.join(tempPath, `tiktok-${type}-${timestamp}.${type === 'video' ? 'mp4' : 'mp3'}`);

      // Configurar las opciones de descarga según el tipo
      const options = type === 'video' 
        ? ['--format', 'best[ext=mp4]', '--force-overwrites']
        : ['--extract-audio', '--audio-format', 'mp3', '--force-overwrites'];

      // Crear el proceso de descarga
      const ytdlp = spawn('yt-dlp', [
        ...options,
        '-o', outputFile,
        url
      ]);

      // Esperar a que termine la descarga
      await new Promise((resolve, reject) => {
        ytdlp.on('close', (code) => {
          if (code === 0) resolve(code);
          else reject(new Error(`yt-dlp exited with code ${code}`));
        });

        ytdlp.stderr.on('data', (data) => {
          console.error(`yt-dlp error: ${data}`);
        });
      });

      // Configurar headers para la descarga
      const extension = type === 'video' ? 'mp4' : 'mp3';
      res.setHeader('Content-Type', type === 'video' ? 'video/mp4' : 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="tiktok-${type}-${timestamp}.${extension}"`);

      // Enviar el archivo
      const fileStream = createReadStream(outputFile);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: "Failed to download content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}