/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef, useEffect } from "react";
import NextImage from "next/image"; // Renamed to avoid conflict
import { createWorker } from "tesseract.js";
import Header from "@/components/common/Header";
import { FileUpload } from "@/components/ui/aceternity/file-upload";
import { Button } from "@/components/ui/button"; // Assuming you have this component

// Extending types for tesseract.js v6
interface OCRWord {
  text: string;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  confidence: number;
}

export default function Home() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [ocrWords, setOcrWords] = useState<OCRWord[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showOverlay] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setOcrWords([]);
    setError(null);
    setIsProcessing(true);
    setCopied(false);

    try {
      const imgElement = new window.Image();
      imgElement.src = url;

      // Wait for the image to load to get its dimensions
      await new Promise<void>((resolve) => {
        imgElement.onload = () => {
          setImageSize({
            width: imgElement.width,
            height: imgElement.height
          });
          resolve();
        };
        imgElement.onerror = () => {
          setError("Failed to load image dimensions");
          resolve();
        };
      });

      // Create a new worker with Amharic language
      const worker = await createWorker("amh");

      // Recognize text in the image
      const result = await worker.recognize(file);

      // Extract words from the result - tesseract.js v6 has a different structure
      const extractedLines: OCRWord[] = [];

      // Access words through the result data
      const data = result.data as any;

      // Parse the words from the result data

      if (data.lines) {
        data.lines.forEach((line: any) => {
          const lineText = line.words.map((w: any) => w.text).join(" ");
          extractedLines.push({
            text: lineText,
            bbox: line.bbox, // tesseract gives line bbox too
            confidence: line.confidence || 0,
          });
        });
      } else if (data.lines) {
        // Extract from lines if structured that way
        data.lines.forEach((line: any) => {
          if (line.words) {
            line.words.forEach((word: any) => {
              extractedLines.push({
                text: word.text,
                bbox: word.bbox,
                confidence: word.confidence || 0
              });
            });
          }
        });
      } else if (data.paragraphs) {
        // Extract from paragraphs structure
        data.paragraphs.forEach((paragraph: any) => {
          if (paragraph.lines) {
            paragraph.lines.forEach((line: any) => {
              if (line.words) {
                line.words.forEach((word: any) => {
                  extractedLines.push({
                    text: word.text,
                    bbox: word.bbox,
                    confidence: word.confidence || 0
                  });
                });
              }
            });
          }
        });
      } else {
        // Fallback for text extraction - use the full text
        const allText = data.text || "";
        console.log("Could not find structured word data, using full text:", allText);
        setOcrWords([{
          text: allText,
          bbox: { x0: 0, y0: 0, x1: imageSize.width, y1: imageSize.height },
          confidence: 0
        }]);
      }

      if (extractedLines.length > 0) {
        setOcrWords(extractedLines);
        console.log(`Found ${extractedLines.length} words in the image`);
      }

      // Terminate the worker when done
      await worker.terminate();
    } catch (error) {
      console.error("OCR processing error:", error);
      setError(`Error processing image: ${(error as Error).message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update image size when the image loads
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      updateImageSize();
    }
  }, [imageURL]);

  const updateImageSize = () => {
    if (imageRef.current) {
      const { clientWidth, clientHeight } = imageRef.current;
      if (clientWidth && clientHeight) {
        setImageSize(prev => ({
          ...prev,
          displayWidth: clientWidth,
          displayHeight: clientHeight
        }));
      }
    }
  };

  // Function to copy all text to clipboard
  const copyAllText = () => {
    const text = ocrWords.map(word => word.text).join(' ');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <Header />
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg bg-white dark:bg-black relative p-4">
        <FileUpload onChange={handleFileUpload} />

        {isProcessing && (
          <div className="text-center my-4 p-2 bg-blue-50 dark:bg-black rounded">
            <p className="text-black dark:text-blue-200">
              Processing image... This may take a moment.
            </p>
          </div>
        )}

        {error && (
          <div className="text-center my-4 p-2 bg-red-50 dark:bg-red-900 rounded">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {imageURL && (
          <div className="relative mt-4">
            {ocrWords.length > 0 && (
              <div className="flex justify-end mb-2">
                <Button onClick={copyAllText} variant="outline" size="sm" disabled={copied}>
                  {copied ? "Copied!" : "Copy All Text"}
                </Button>
              </div>
            )}

            <div className="relative w-full h-[800px]">
              <NextImage
                ref={imageRef as any}
                src={imageURL}
                alt="Uploaded"
                fill
                style={{ objectFit: 'contain' }}
                onLoad={updateImageSize}
              />
            </div>

            {/* Display extracted text section only when overlay is hidden */}
            {ocrWords.length > 0 && !showOverlay && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
                <h3 className="text-lg font-medium mb-2">Extracted Text</h3>
                <div className="p-2 bg-white dark:bg-black border rounded">
                  <p className="whitespace-pre-wrap select-text">
                    {ocrWords.map(word => word.text).join(' ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .ocr-word span.select-text {
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
        }
      `}</style>
    </>
  );
}